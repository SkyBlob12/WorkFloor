-- =============================================================================
-- Lutte contre les faux avis : attestation, publication différée des comptes
-- récents, surveillance des entreprises en activité inhabituelle, moyennes pondérées.
--
-- Avant de l'appliquer : supabase/preflight/20260917000000_review_trust.sql
-- Pour l'annuler     : supabase/rollbacks/20260917000000_review_trust.sql
--
-- Déploiement : cette migration D'ABORD, puis `supabase functions deploy submit-review`
-- (la fonction écrit attested_at, hold_reason, held_until, trust_weight).
--
-- Décisions prises dans l'Edge Function (seuils : supabase/functions/_shared/trust.ts),
-- statistiques calculées ici. Fenêtres à garder synchronisées avec trust.ts :
-- 7 jours observés, 12 semaines de référence avant (84 + 7 = 91 jours).
--
-- Anonymat : company_watches ne contient aucun identifiant d'auteur et n'est
-- lisible que par le service role. La vue companies_with_stats n'expose qu'un
-- booléen under_review en plus. reviews_public est inchangée.
-- Verrous : ADD COLUMN nullable ou à défaut constant (pas de réécriture, PG 11+),
-- index et CHECK sur une table de petite taille (volumétrie lue au pré-vol).
-- Idempotente : rejouable sans erreur.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Avis : attestation, attente automatique, poids dans les moyennes
-- -----------------------------------------------------------------------------
alter table public.reviews add column if not exists attested_at timestamptz;
alter table public.reviews add column if not exists hold_reason text;
alter table public.reviews add column if not exists held_until timestamptz;
alter table public.reviews add column if not exists trust_weight real not null default 1;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.reviews'::regclass and conname = 'reviews_hold_reason_check'
  ) then
    alter table public.reviews
      add constraint reviews_hold_reason_check check (hold_reason in ('new_account', 'company_surge'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.reviews'::regclass and conname = 'reviews_trust_weight_check'
  ) then
    alter table public.reviews
      add constraint reviews_trust_weight_check check (trust_weight > 0 and trust_weight <= 1);
  end if;
end
$$;

comment on column public.reviews.attested_at is
  'Dernière attestation sur l''honneur d''avoir travaillé dans l''entreprise (à chaque envoi). Nulle pour les avis antérieurs.';
comment on column public.reviews.hold_reason is
  'Attente automatique d''un avis pending : new_account (publié à held_until), company_surge (publié à la clôture de la surveillance). Nulle = relecture humaine.';
comment on column public.reviews.trust_weight is
  'Poids dans les moyennes de companies_with_stats (0,5 pour un compte de moins de 7 jours à l''écriture).';

create index if not exists reviews_company_created_idx on public.reviews (company_id, created_at desc);
create index if not exists reviews_held_idx on public.reviews (held_until) where hold_reason is not null;

-- Un avis qui quitte l'état pending (cron, modération dans le Table Editor) perd son attente.
create or replace function public.clear_review_hold()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'pending' then
    new.hold_reason := null;
    new.held_until := null;
  end if;
  return new;
end;
$$;

create or replace trigger reviews_clear_hold
  before update of status on public.reviews
  for each row
  when (new.status is distinct from old.status)
  execute function public.clear_review_hold();

-- -----------------------------------------------------------------------------
-- Entreprises sous surveillance (service role uniquement)
-- -----------------------------------------------------------------------------
create table if not exists public.company_watches (
  id bigint generated always as identity primary key,
  company_id uuid not null references public.companies (id) on delete cascade,
  signals text[] not null default '{}',
  -- Les avis créés depuis cette date sont exclus des moyennes tant que la surveillance est ouverte.
  window_start timestamptz not null,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution text check (resolution in ('cleared', 'actioned')),
  note text
);

comment on table public.company_watches is
  'Activité inhabituelle détectée par submit-review. Clore en renseignant resolved_at après avoir retiré les faux avis. Aucune donnée d''auteur.';

create unique index if not exists company_watches_one_open_idx
  on public.company_watches (company_id) where resolved_at is null;

alter table public.company_watches enable row level security;
-- Aucune policy : table réservée au service role et au dashboard.

-- -----------------------------------------------------------------------------
-- Statistiques d'activité d'une entreprise, hors avis en cours d'envoi
-- -----------------------------------------------------------------------------
create or replace function public.company_activity_stats(p_company_id uuid, p_user_id uuid, p_text text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with since as (
    -- Une surveillance close ne doit pas se rouvrir sur les avis qu'elle a déjà examinés.
    select greatest(
      now() - interval '7 days',
      coalesce((select max(w.resolved_at) from public.company_watches w where w.company_id = p_company_id), '-infinity')
    ) as start_at
  ),
  recent as (
    select
      r.user_id,
      r.rating_overall,
      coalesce(u.created_at > r.created_at - interval '7 days', false) as new_account,
      r.pros || ' ' || r.cons as body
    from public.reviews r
    left join auth.users u on u.id = r.user_id
    where r.company_id = p_company_id
      and r.status <> 'removed'
      and r.created_at > (select start_at from since)
      and r.user_id <> p_user_id
  ),
  networks as (
    select count(distinct e.user_id) as reviewers
    from public.abuse_events e
    where e.action = 'submit_review'
      and e.ip_hash is not null
      and e.created_at > now() - interval '7 days'
      and (e.user_id = p_user_id or e.user_id in (select user_id from recent))
    group by e.ip_hash
  )
  select jsonb_build_object(
    'recent_count', (select count(*) from recent),
    'recent_new_accounts', (select count(*) from recent where new_account),
    'recent_extreme', (select count(*) from recent where rating_overall in (1, 5)),
    'baseline_count', (
      select count(*) from public.reviews r
      where r.company_id = p_company_id
        and r.status <> 'removed'
        and r.created_at <= now() - interval '7 days'
        and r.created_at > now() - interval '91 days'
    ),
    'max_similarity', coalesce((select max(extensions.similarity(body, coalesce(p_text, ''))) from recent), 0),
    'max_reviewers_per_network', coalesce((select max(reviewers) from networks), 0),
    'active_watch', exists (
      select 1 from public.company_watches w where w.company_id = p_company_id and w.resolved_at is null
    )
  );
$$;

create or replace function public.open_company_watch(p_company_id uuid, p_signals text[])
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.company_watches (company_id, signals, window_start)
  values (
    p_company_id,
    coalesce(p_signals, '{}'),
    greatest(
      now() - interval '7 days',
      coalesce((select max(w.resolved_at) from public.company_watches w where w.company_id = p_company_id), '-infinity')
    )
  )
  on conflict (company_id) where resolved_at is null do nothing;
$$;

-- Publie les avis dont l'attente est terminée. Le trigger reviews_clear_hold vide hold_reason.
create or replace function public.release_held_reviews()
returns integer
language sql
security definer
set search_path = ''
as $$
  with released as (
    update public.reviews r
    set status = 'published'
    where r.status = 'pending'
      and r.hold_reason is not null
      and (r.hold_reason <> 'new_account' or coalesce(r.held_until, now()) <= now())
      and not exists (
        select 1 from public.company_watches w where w.company_id = r.company_id and w.resolved_at is null
      )
    returning 1
  )
  select count(*)::integer from released;
$$;

-- cron.schedule met à jour une tâche existante du même nom : rejouable.
select cron.schedule('release-held-reviews', '*/15 * * * *', $$ select public.release_held_reviews() $$);

-- -----------------------------------------------------------------------------
-- Vue publique : moyennes pondérées, période surveillée exclue, colonne en fin
-- (CREATE OR REPLACE VIEW n'accepte que l'ajout de colonnes en dernière position).
-- review_count compte toujours tous les avis publiés (ceux affichés dans la liste).
-- -----------------------------------------------------------------------------
create or replace view public.companies_with_stats as
with open_watches as (
  select w.company_id, w.window_start from public.company_watches w where w.resolved_at is null
),
counted as (
  select
    r.company_id,
    r.rating_overall,
    r.rating_culture,
    r.rating_salary,
    r.rating_benefits,
    r.rating_management,
    r.rating_work_life,
    r.recommends,
    case when w.window_start is null or r.created_at < w.window_start then r.trust_weight::float8 end as weight
  from public.reviews r
  left join open_watches w on w.company_id = r.company_id
  where r.status = 'published'
)
select
  c.id,
  c.siren,
  c.siret,
  c.name,
  c.naf_code,
  c.sector,
  c.city,
  c.postal_code,
  c.employee_range,
  c.is_active,
  c.verified,
  c.created_at,
  count(r.company_id)::integer as review_count,
  round((sum(r.rating_overall * r.weight) / nullif(sum(r.weight), 0))::numeric, 1)::float8 as avg_overall,
  round((sum(r.rating_culture * r.weight)
    / nullif(sum(r.weight) filter (where r.rating_culture is not null), 0))::numeric, 1)::float8 as avg_culture,
  round((sum(r.rating_salary * r.weight)
    / nullif(sum(r.weight) filter (where r.rating_salary is not null), 0))::numeric, 1)::float8 as avg_salary,
  round((sum(r.rating_benefits * r.weight)
    / nullif(sum(r.weight) filter (where r.rating_benefits is not null), 0))::numeric, 1)::float8 as avg_benefits,
  round((sum(r.rating_management * r.weight)
    / nullif(sum(r.weight) filter (where r.rating_management is not null), 0))::numeric, 1)::float8 as avg_management,
  round((sum(r.rating_work_life * r.weight)
    / nullif(sum(r.weight) filter (where r.rating_work_life is not null), 0))::numeric, 1)::float8 as avg_work_life,
  round(100 * sum(case when r.recommends then r.weight when not r.recommends then 0 end)
    / nullif(sum(r.weight) filter (where r.recommends is not null), 0))::integer as recommend_pct,
  exists (select 1 from open_watches w where w.company_id = c.id) as under_review
from public.companies c
left join counted r on r.company_id = c.id
where not c.is_hidden
group by c.id, c.siren, c.siret, c.name, c.naf_code, c.sector, c.city, c.postal_code,
  c.employee_range, c.is_active, c.verified, c.created_at;

-- -----------------------------------------------------------------------------
-- Droits
-- -----------------------------------------------------------------------------
revoke all on public.company_watches from anon, authenticated;
grant all on public.company_watches to service_role;

grant select on public.companies_with_stats to anon, authenticated;

revoke execute on function public.clear_review_hold() from public, anon, authenticated;

revoke execute on function public.company_activity_stats(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.company_activity_stats(uuid, uuid, text) to service_role;

revoke execute on function public.open_company_watch(uuid, text[]) from public, anon, authenticated;
grant execute on function public.open_company_watch(uuid, text[]) to service_role;

revoke execute on function public.release_held_reviews() from public, anon, authenticated;
grant execute on function public.release_held_reviews() to service_role;
