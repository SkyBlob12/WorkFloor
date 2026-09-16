-- =============================================================================
-- BehindTheDesk : schéma initial (idempotent, rejouable sans erreur)
--
-- Avant de l'appliquer : supabase/preflight/20260915000000_init_schema.sql
-- Pour l'annuler     : supabase/rollbacks/20260915000000_init_schema.sql
--
-- Principe d'anonymat :
--   * `reviews` contient user_id mais n'est JAMAIS lisible publiquement
--     (RLS : chacun ne lit que ses propres lignes).
--   * La lecture publique passe par la vue `reviews_public`, qui n'expose ni
--     user_id ni horodatage précis (mois de publication seulement).
--   * Écritures sensibles (avis, fiches entreprise) : uniquement via Edge
--     Functions (captcha, rate limit, modération), jamais en direct.
-- =============================================================================

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- -----------------------------------------------------------------------------
-- Types (CREATE TYPE n'a pas de IF NOT EXISTS : garde par le catalogue)
-- -----------------------------------------------------------------------------
do $$
declare
  definitions constant text[][] := array[
    ['employment_status', $e$('current', 'former')$e$],
    ['contract_type', $e$('cdi', 'cdd', 'interim', 'internship', 'apprenticeship', 'freelance', 'other')$e$],
    ['salary_period', $e$('year', 'month', 'hour')$e$],
    ['review_status', $e$('published', 'pending', 'hidden', 'removed')$e$],
    ['report_reason', $e$('defamation', 'personal_data', 'harassment', 'hate', 'spam', 'off_topic', 'illegal', 'other')$e$],
    ['report_status', $e$('open', 'actioned', 'dismissed')$e$],
    ['banned_term_action', $e$('reject', 'review')$e$]
  ];
  i integer;
begin
  for i in 1 .. array_length(definitions, 1) loop
    if not exists (
      select 1 from pg_type where typname = definitions[i][1] and typnamespace = 'public'::regnamespace
    ) then
      execute format('create type public.%I as enum %s', definitions[i][1], definitions[i][2]);
    end if;
  end loop;
end
$$;

-- -----------------------------------------------------------------------------
-- Utilitaires
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.normalize_text(value text)
returns text
language sql
immutable parallel safe strict
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, value));
$$;

-- Crée une policy seulement si elle n'existe pas encore (CREATE POLICY n'a pas de IF NOT EXISTS).
create or replace function public.create_policy_if_missing(p_table text, p_name text, p_definition text)
returns void
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = p_table and policyname = p_name
  ) then
    execute format('create policy %I on public.%I %s', p_name, p_table, p_definition);
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Entreprises
-- -----------------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  siren text unique check (siren ~ '^[0-9]{9}$'),
  siret text check (siret ~ '^[0-9]{14}$'),
  name text not null check (char_length(name) between 1 and 200),
  naf_code text,
  -- Obsolète : le secteur est déduit du code NAF côté app (traduisible). Conservé pour compatibilité.
  sector text,
  city text,
  postal_code text,
  employee_range text,
  is_active boolean not null default true,
  verified boolean not null default false,
  is_hidden boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.companies.siren is
  'Clé de dédoublonnage : une fiche par entité légale (SIREN). Le SIRET du siège est conservé à titre informatif.';

create index if not exists companies_name_search_idx
  on public.companies using gin (public.normalize_text(name) extensions.gin_trgm_ops);

create or replace trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

alter table public.companies enable row level security;

select public.create_policy_if_missing(
  'companies', 'Fiches entreprise visibles par tous',
  'for select to anon, authenticated using (not is_hidden)'
);
-- Pas de policy insert/update/delete : création via l'Edge Function create-company.

-- -----------------------------------------------------------------------------
-- Avis
-- -----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,

  rating_overall smallint not null check (rating_overall between 1 and 5),
  rating_culture smallint check (rating_culture between 1 and 5),
  rating_salary smallint check (rating_salary between 1 and 5),
  rating_benefits smallint check (rating_benefits between 1 and 5),
  rating_management smallint check (rating_management between 1 and 5),
  rating_work_life smallint check (rating_work_life between 1 and 5),
  recommends boolean,

  title text not null check (char_length(title) between 3 and 120),
  pros text not null check (char_length(pros) between 20 and 3000),
  cons text not null check (char_length(cons) between 20 and 3000),
  benefits text check (char_length(benefits) <= 1000),
  job_title text check (char_length(job_title) <= 100),
  employment_status public.employment_status not null,
  contract_type public.contract_type,
  salary_amount integer check (salary_amount > 0 and salary_amount < 10000000),
  salary_period public.salary_period,

  status public.review_status not null default 'published',
  moderation_flags jsonb,
  helpful_count integer not null default 0,
  report_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Règle métier : un avis par utilisateur par entreprise.
  constraint reviews_one_per_user_per_company unique (user_id, company_id),
  constraint reviews_salary_complete check ((salary_amount is null) = (salary_period is null))
);

create index if not exists reviews_company_published_idx
  on public.reviews (company_id, created_at desc) where status = 'published';

-- updated_at ne bouge que si le contenu change (pas sur un vote "utile").
create or replace trigger reviews_set_updated_at
  before update of rating_overall, rating_culture, rating_salary, rating_benefits, rating_management,
    rating_work_life, recommends, title, pros, cons, benefits, job_title, employment_status,
    contract_type, salary_amount, salary_period
  on public.reviews
  for each row execute function public.set_updated_at();

alter table public.reviews enable row level security;

select public.create_policy_if_missing(
  'reviews', 'L''auteur lit ses propres avis',
  'for select to authenticated using (user_id = (select auth.uid()))'
);
select public.create_policy_if_missing(
  'reviews', 'L''auteur supprime ses propres avis',
  'for delete to authenticated using (user_id = (select auth.uid()))'
);
-- Création / édition : Edge Function submit-review (captcha, modération).

-- Un avis publié, écrit par quelqu'un d'autre que l'utilisateur courant.
create or replace function public.review_is_actionable(p_review_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.reviews r
    where r.id = p_review_id
      and r.status = 'published'
      and r.user_id <> (select auth.uid())
  );
$$;

-- -----------------------------------------------------------------------------
-- Votes "utile"
-- -----------------------------------------------------------------------------
create table if not exists public.review_votes (
  review_id uuid not null references public.reviews (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

alter table public.review_votes enable row level security;

select public.create_policy_if_missing(
  'review_votes', 'Lire ses votes',
  'for select to authenticated using (user_id = (select auth.uid()))'
);
select public.create_policy_if_missing(
  'review_votes', 'Voter sur l''avis d''un autre',
  'for insert to authenticated with check (user_id = (select auth.uid()) and public.review_is_actionable(review_id))'
);
select public.create_policy_if_missing(
  'review_votes', 'Retirer son vote',
  'for delete to authenticated using (user_id = (select auth.uid()))'
);

create or replace function public.sync_helpful_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.reviews set helpful_count = helpful_count + 1 where id = new.review_id;
  elsif tg_op = 'DELETE' then
    update public.reviews set helpful_count = greatest(helpful_count - 1, 0) where id = old.review_id;
  end if;
  return null;
end;
$$;

create or replace trigger review_votes_sync_count
  after insert or delete on public.review_votes
  for each row execute function public.sync_helpful_count();

-- -----------------------------------------------------------------------------
-- Signalements (exigence Apple UGC, statut d'hébergeur LCEN)
-- -----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason public.report_reason not null,
  details text check (char_length(details) <= 1000),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now(),
  constraint reports_one_per_user_per_review unique (review_id, reporter_id)
);

create index if not exists reports_open_idx on public.reports (created_at desc) where status = 'open';

alter table public.reports enable row level security;

select public.create_policy_if_missing(
  'reports', 'Signaler l''avis d''un autre',
  'for insert to authenticated with check (reporter_id = (select auth.uid()) and public.review_is_actionable(review_id))'
);
select public.create_policy_if_missing(
  'reports', 'Lire ses signalements',
  'for select to authenticated using (reporter_id = (select auth.uid()))'
);

-- Au-delà de N signalements, l'avis est masqué en attente de revue humaine.
create or replace function public.on_report_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  auto_hide_threshold constant integer := 5;
begin
  update public.reviews
  set report_count = report_count + 1,
      status = case
        when status = 'published' and report_count + 1 >= auto_hide_threshold then 'pending'::public.review_status
        else status
      end
  where id = new.review_id;
  return null;
end;
$$;

create or replace trigger reports_after_insert
  after insert on public.reports
  for each row execute function public.on_report_created();

-- -----------------------------------------------------------------------------
-- Blocage d'auteurs (exigence Apple UGC)
-- -----------------------------------------------------------------------------
create table if not exists public.user_blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_user_id),
  check (blocker_id <> blocked_user_id)
);

alter table public.user_blocks enable row level security;

select public.create_policy_if_missing(
  'user_blocks', 'Lire ses blocages',
  'for select to authenticated using (blocker_id = (select auth.uid()))'
);
select public.create_policy_if_missing(
  'user_blocks', 'Supprimer ses blocages',
  'for delete to authenticated using (blocker_id = (select auth.uid()))'
);

-- L'identité de l'auteur n'étant jamais exposée, le blocage passe par l'id de l'avis.
create or replace function public.block_review_author(p_review_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := (select auth.uid());
  v_author uuid;
begin
  if v_me is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select user_id into v_author from public.reviews where id = p_review_id;
  if v_author is null then
    raise exception 'review_not_found' using errcode = 'P0002';
  end if;
  if v_author = v_me then
    raise exception 'cannot_block_self' using errcode = '22023';
  end if;

  insert into public.user_blocks (blocker_id, blocked_user_id)
  values (v_me, v_author)
  on conflict do nothing;
end;
$$;

-- -----------------------------------------------------------------------------
-- Anti-abus : journal pour rate limiting (IP hachée, purge à 30 jours)
-- -----------------------------------------------------------------------------
create table if not exists public.abuse_events (
  id bigint generated always as identity primary key,
  action text not null,
  user_id uuid references auth.users (id) on delete cascade,
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists abuse_events_user_idx on public.abuse_events (action, user_id, created_at desc);
create index if not exists abuse_events_ip_idx on public.abuse_events (action, ip_hash, created_at desc);

alter table public.abuse_events enable row level security;
-- Aucune policy : table réservée au service role.

create or replace function public.consume_rate_limit(
  p_action text,
  p_user_id uuid,
  p_ip_hash text,
  p_user_max integer,
  p_ip_max integer,
  p_window interval
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_count integer := 0;
  v_ip_count integer := 0;
begin
  if p_user_id is not null then
    select count(*) into v_user_count
    from public.abuse_events
    where action = p_action and user_id = p_user_id and created_at > now() - p_window;
  end if;

  if p_ip_hash is not null then
    select count(*) into v_ip_count
    from public.abuse_events
    where action = p_action and ip_hash = p_ip_hash and created_at > now() - p_window;
  end if;

  if v_user_count >= p_user_max or v_ip_count >= p_ip_max then
    return false;
  end if;

  insert into public.abuse_events (action, user_id, ip_hash) values (p_action, p_user_id, p_ip_hash);
  return true;
end;
$$;

-- -----------------------------------------------------------------------------
-- Mots interdits (complément de la modération IA), éditable depuis le dashboard
-- -----------------------------------------------------------------------------
create table if not exists public.banned_terms (
  term text primary key check (term = public.normalize_text(term)),
  action public.banned_term_action not null default 'reject',
  note text,
  created_at timestamptz not null default now()
);

alter table public.banned_terms enable row level security;
-- Aucune policy : lu uniquement par les Edge Functions.

insert into public.banned_terms (term, action, note) values
  ('connard', 'reject', 'insulte'),
  ('connasse', 'reject', 'insulte'),
  ('encule', 'reject', 'insulte'),
  ('salope', 'reject', 'insulte'),
  ('batard', 'reject', 'insulte'),
  ('fils de pute', 'reject', 'insulte'),
  ('pedophile', 'review', 'accusation grave : relecture humaine'),
  ('harceleur', 'review', 'accusation visant potentiellement une personne'),
  ('violeur', 'review', 'accusation grave : relecture humaine')
on conflict (term) do nothing;

-- -----------------------------------------------------------------------------
-- Jetons de notifications push (Expo)
-- -----------------------------------------------------------------------------
create table if not exists public.push_tokens (
  token text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  platform text check (platform in ('ios', 'android')),
  updated_at timestamptz not null default now()
);

alter table public.push_tokens enable row level security;

select public.create_policy_if_missing(
  'push_tokens', 'Gérer ses jetons push',
  'for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))'
);

-- -----------------------------------------------------------------------------
-- Vues publiques
-- Volontairement SANS security_invoker : elles lisent `reviews` avec les droits
-- du propriétaire pour agréger et exposer les avis sans jamais sortir user_id.
-- (Le Security Advisor Supabase les signalera : c'est voulu.)
-- -----------------------------------------------------------------------------
create or replace view public.companies_with_stats as
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
  count(r.id)::integer as review_count,
  round(avg(r.rating_overall), 1)::float8 as avg_overall,
  round(avg(r.rating_culture), 1)::float8 as avg_culture,
  round(avg(r.rating_salary), 1)::float8 as avg_salary,
  round(avg(r.rating_benefits), 1)::float8 as avg_benefits,
  round(avg(r.rating_management), 1)::float8 as avg_management,
  round(avg(r.rating_work_life), 1)::float8 as avg_work_life,
  round(100.0 * avg(case when r.recommends then 1 when not r.recommends then 0 end))::integer as recommend_pct
from public.companies c
left join public.reviews r on r.company_id = c.id and r.status = 'published'
where not c.is_hidden
group by c.id, c.siren, c.siret, c.name, c.naf_code, c.sector, c.city, c.postal_code,
  c.employee_range, c.is_active, c.verified, c.created_at;

create or replace view public.reviews_public as
select
  r.id,
  r.company_id,
  r.rating_overall,
  r.rating_culture,
  r.rating_salary,
  r.rating_benefits,
  r.rating_management,
  r.rating_work_life,
  r.recommends,
  r.title,
  r.pros,
  r.cons,
  r.benefits,
  r.job_title,
  r.employment_status,
  r.contract_type,
  r.salary_amount,
  r.salary_period,
  r.helpful_count,
  date_trunc('month', r.created_at)::date as published_month,
  (r.updated_at > r.created_at + interval '1 hour') as is_edited,
  coalesce(r.user_id = (select auth.uid()), false) as is_mine,
  exists (
    select 1 from public.review_votes v
    where v.review_id = r.id and v.user_id = (select auth.uid())
  ) as voted_helpful
from public.reviews r
join public.companies c on c.id = r.company_id and not c.is_hidden
where r.status = 'published'
  and not exists (
    select 1 from public.user_blocks b
    where b.blocker_id = (select auth.uid()) and b.blocked_user_id = r.user_id
  );

-- -----------------------------------------------------------------------------
-- Recherche (nom sans accents ni casse, ou SIREN / SIRET)
-- -----------------------------------------------------------------------------
create or replace function public.search_companies(p_query text default '', p_limit integer default 20)
returns setof public.companies_with_stats
language sql
stable
set search_path = ''
as $$
  with params as (
    select
      public.normalize_text(btrim(coalesce(p_query, ''))) as term,
      regexp_replace(coalesce(p_query, ''), '\D', '', 'g') as digits
  )
  select s.*
  from public.companies_with_stats s, params p
  where p.term = ''
     or public.normalize_text(s.name) like '%' || p.term || '%'
     or (length(p.digits) = 9 and s.siren = p.digits)
     or (length(p.digits) = 14 and s.siret = p.digits)
  order by
    case when p.term = '' then 0 else extensions.similarity(public.normalize_text(s.name), p.term) end desc,
    s.review_count desc,
    s.name
  limit least(greatest(coalesce(p_limit, 20), 1), 50);
$$;

-- -----------------------------------------------------------------------------
-- Droits (explicites, indépendants du réglage "expose new tables")
-- -----------------------------------------------------------------------------
revoke all on public.reviews, public.review_votes, public.reports, public.user_blocks,
  public.abuse_events, public.banned_terms, public.push_tokens from anon;
revoke insert, update on public.reviews from authenticated;
revoke all on public.abuse_events, public.banned_terms from authenticated;

grant select on public.companies to anon, authenticated;
grant select, delete on public.reviews to authenticated;
grant select, insert, delete on public.review_votes to authenticated;
grant select, insert on public.reports to authenticated;
grant select, delete on public.user_blocks to authenticated;
grant select, insert, update, delete on public.push_tokens to authenticated;
grant select on public.companies_with_stats, public.reviews_public to anon, authenticated;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

revoke execute on function public.create_policy_if_missing(text, text, text) from public, anon, authenticated;

revoke execute on function public.block_review_author(uuid) from public, anon;
grant execute on function public.block_review_author(uuid) to authenticated;

revoke execute on function public.consume_rate_limit(text, uuid, text, integer, integer, interval) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, uuid, text, integer, integer, interval) to service_role;

grant execute on function public.search_companies(text, integer) to anon, authenticated;
