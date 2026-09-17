-- =============================================================================
-- Établissements : une entreprise présente dans plusieurs villes.
-- Pré-vol : supabase/preflight/20260917000100_company_sites.sql
-- Rollback : supabase/rollbacks/20260917000100_company_sites.sql
--
-- Une fiche reste une entité légale (SIREN). Chaque avis peut désigner le site
-- (SIRET vérifié dans SIRENE par submit-review) où l'auteur a travaillé.
--
-- Anonymat : company_sites n'est lisible ni par anon ni par authenticated (la
-- simple existence d'un site trahirait qu'un avis y a été écrit), sauf les sites
-- des propres avis de l'utilisateur. reviews_public n'expose que la ville, et
-- seulement quand l'entreprise compte au moins 3 avis publiés dans cette ville.
--
-- Verrous : ADD COLUMN nullable sans défaut (pas de réécriture), clé étrangère
-- validée sur une table de 30 lignes (volumétrie lue au pré-vol).
-- Compatibilité : colonne ajoutée en fin de reviews_public, l'app installée l'ignore.
-- Idempotente : rejouable sans erreur.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Établissements vérifiés (écrits par l'Edge Function submit-review seulement)
-- -----------------------------------------------------------------------------
create table if not exists public.company_sites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  siret text not null unique check (siret ~ '^[0-9]{14}$'),
  city text check (char_length(city) <= 100),
  postal_code text check (postal_code ~ '^[0-9A-Z]{5}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  -- Cible de la clé étrangère composite de reviews : un avis ne peut pas désigner le site d'une autre entreprise.
  constraint company_sites_id_company_key unique (id, company_id)
);

comment on table public.company_sites is
  'Établissements (SIRET) désignés par des avis. Jamais lisible publiquement : seule la ville sort, via reviews_public, au-delà du seuil d''anonymat.';

create index if not exists company_sites_company_city_idx on public.company_sites (company_id, city);

alter table public.company_sites enable row level security;

-- -----------------------------------------------------------------------------
-- Site d'un avis
-- -----------------------------------------------------------------------------
alter table public.reviews add column if not exists site_id uuid;

comment on column public.reviews.site_id is
  'Établissement où l''auteur a travaillé (facultatif). Les avis antérieurs restent sans site.';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reviews_site_same_company' and conrelid = 'public.reviews'::regclass
  ) then
    alter table public.reviews
      add constraint reviews_site_same_company
      foreign key (site_id, company_id) references public.company_sites (id, company_id);
  end if;
end
$$;

create index if not exists reviews_site_idx on public.reviews (site_id) where site_id is not null;

-- L'auteur relit le site de ses propres avis (formulaire d'édition, compte).
select public.create_policy_if_missing(
  'company_sites', 'L''auteur lit les sites de ses avis',
  'for select to authenticated using (exists (
     select 1 from public.reviews r
     where r.site_id = company_sites.id and r.user_id = (select auth.uid())
   ))'
);

-- -----------------------------------------------------------------------------
-- Vue publique des avis : ville du site en fin de vue, seuil d'anonymat de 3 avis
-- (à garder synchronisé avec company_city_stats et constants/companies.ts).
-- -----------------------------------------------------------------------------
create or replace view public.reviews_public as
with city_counts as (
  select r.company_id, s.city, count(*) as published_count
  from public.reviews r
  join public.company_sites s on s.id = r.site_id
  where r.status = 'published' and s.city is not null
  group by r.company_id, s.city
)
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
  ) as voted_helpful,
  case when cc.published_count >= 3 then s.city end as site_city
from public.reviews r
join public.companies c on c.id = r.company_id and not c.is_hidden
left join public.company_sites s on s.id = r.site_id
left join city_counts cc on cc.company_id = r.company_id and cc.city = s.city
where r.status = 'published'
  and not exists (
    select 1 from public.user_blocks b
    where b.blocker_id = (select auth.uid()) and b.blocked_user_id = r.user_id
  );

-- -----------------------------------------------------------------------------
-- Note par ville (filtre de la fiche) : mêmes poids et même exclusion de la
-- période surveillée que companies_with_stats, mêmes seuils que reviews_public.
-- -----------------------------------------------------------------------------
create or replace function public.company_city_stats(p_company_id uuid)
returns table (city text, review_count integer, avg_overall double precision)
language sql
stable
security definer
set search_path = ''
as $$
  select
    s.city,
    count(*)::integer as review_count,
    round((sum(r.rating_overall * w.weight) / nullif(sum(w.weight), 0))::numeric, 1)::float8 as avg_overall
  from public.reviews r
  join public.companies c on c.id = r.company_id and not c.is_hidden
  join public.company_sites s on s.id = r.site_id
  cross join lateral (
    select case
      when not exists (
        select 1 from public.company_watches cw
        where cw.company_id = r.company_id and cw.resolved_at is null and r.created_at >= cw.window_start
      ) then r.trust_weight::float8
    end as weight
  ) w
  where r.company_id = p_company_id and r.status = 'published' and s.city is not null
  group by s.city
  having count(*) >= 3
  order by review_count desc, s.city;
$$;

-- -----------------------------------------------------------------------------
-- Droits (Supabase accorde ALL par défaut : revoke puis grant explicite)
-- -----------------------------------------------------------------------------
revoke all on public.company_sites from anon, authenticated;
grant select (id, siret, city, postal_code) on public.company_sites to authenticated;
grant all on public.company_sites to service_role;

-- Hygiène relevée au pré-vol : les vues publiques avaient ALL, lecture seule suffit.
revoke all on public.reviews_public, public.companies_with_stats from anon, authenticated;
grant select on public.reviews_public, public.companies_with_stats to anon, authenticated;

revoke execute on function public.company_city_stats(uuid) from public, anon, authenticated;
grant execute on function public.company_city_stats(uuid) to anon, authenticated;
