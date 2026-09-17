-- =============================================================================
-- Écran de modération dans l'app.
-- Pré-vol : supabase/preflight/20260917000200_moderation_console.sql
-- Rollback : supabase/rollbacks/20260917000200_moderation_console.sql
--
-- Les modérateurs sont listés dans public.moderators (ajout depuis le dashboard
-- ou le SQL Editor uniquement). L'app ne lit ni reviews ni reports directement :
-- tout passe par des fonctions security definer qui vérifient l'appartenance.
--
-- Anonymat : la file ne renvoie jamais reviews.user_id ni reports.reporter_id.
-- Aucune policy insert / update ajoutée sur reviews ou reports.
-- Verrous : création d'objets seulement, aucune table existante modifiée.
-- Idempotente : rejouable sans erreur.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Modérateurs
-- -----------------------------------------------------------------------------
create table if not exists public.moderators (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

comment on table public.moderators is
  'Comptes autorisés à utiliser l''écran de modération. Aucune lecture client : passer par is_moderator().';

alter table public.moderators enable row level security;
-- Aucune policy : table réservée au service role et au dashboard.

insert into public.moderators (user_id)
select id from auth.users where id = 'c2dc2540-212b-4bb6-850d-1b3365ac38c9'
on conflict (user_id) do nothing;

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.moderators m where m.user_id = (select auth.uid()));
$$;

-- -----------------------------------------------------------------------------
-- File : avis en relecture humaine et avis visés par un signalement ouvert
-- -----------------------------------------------------------------------------
create or replace function public.moderation_queue()
returns table (
  review_id uuid,
  company_id uuid,
  company_name text,
  status public.review_status,
  hold_reason text,
  rating_overall smallint,
  title text,
  pros text,
  cons text,
  benefits text,
  job_title text,
  moderation_flags jsonb,
  report_count integer,
  created_at timestamptz,
  reports jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_moderator() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  return query
  select
    r.id,
    r.company_id,
    c.name,
    r.status,
    r.hold_reason,
    r.rating_overall,
    r.title,
    r.pros,
    r.cons,
    r.benefits,
    r.job_title,
    r.moderation_flags,
    r.report_count,
    r.created_at,
    coalesce(o.items, '[]'::jsonb)
  from public.reviews r
  join public.companies c on c.id = r.company_id
  left join lateral (
    select
      jsonb_agg(
        jsonb_build_object('id', rp.id, 'reason', rp.reason, 'details', rp.details, 'created_at', rp.created_at)
        order by rp.created_at
      ) as items,
      min(rp.created_at) as first_at
    from public.reports rp
    where rp.review_id = r.id and rp.status = 'open'
  ) o on true
  where (r.status = 'pending' and r.hold_reason is null) or o.items is not null
  order by coalesce(o.first_at, r.created_at)
  limit 100;
end;
$$;

-- -----------------------------------------------------------------------------
-- Décision : keep (publié, signalements rejetés), hide ou remove (signalements traités)
-- -----------------------------------------------------------------------------
create or replace function public.moderate_review(p_review_id uuid, p_decision text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_moderator() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if coalesce(p_decision, '') not in ('keep', 'hide', 'remove') then
    raise exception 'INVALID_INPUT' using errcode = '22023';
  end if;

  update public.reviews r
  set status = case p_decision
        when 'hide' then 'hidden'::public.review_status
        when 'remove' then 'removed'::public.review_status
        -- Un avis en attente automatique (compte récent, surveillance) garde son attente.
        else case when r.status = 'pending' and r.hold_reason is not null then r.status
                  else 'published'::public.review_status end
      end,
      -- Avis conservé : le compteur repart de zéro pour le masquage automatique.
      report_count = case when p_decision = 'keep' then 0 else r.report_count end
  where r.id = p_review_id;

  if not found then
    raise exception 'REVIEW_NOT_FOUND' using errcode = 'P0002';
  end if;

  update public.reports
  set status = case when p_decision = 'keep' then 'dismissed'::public.report_status
                    else 'actioned'::public.report_status end
  where review_id = p_review_id and status = 'open';
end;
$$;

-- -----------------------------------------------------------------------------
-- Droits (Supabase accorde ALL par défaut : revoke puis grant explicite)
-- -----------------------------------------------------------------------------
revoke all on public.moderators from anon, authenticated;
grant all on public.moderators to service_role;

revoke execute on function public.is_moderator() from public, anon;
grant execute on function public.is_moderator() to authenticated;

revoke execute on function public.moderation_queue() from public, anon;
grant execute on function public.moderation_queue() to authenticated;

revoke execute on function public.moderate_review(uuid, text) from public, anon;
grant execute on function public.moderate_review(uuid, text) to authenticated;
