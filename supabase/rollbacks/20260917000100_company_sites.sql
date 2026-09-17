-- =============================================================================
-- ROLLBACK de 20260917000100_company_sites.
--
-- ORDRE : redéployer d'abord la version précédente de submit-review (elle écrit
-- reviews.site_id et company_sites), et retirer de la circulation la version de
-- l'app qui lit site_city / company_city_stats, sinon la fiche entreprise échoue.
--
-- Effets sur les données : le site de chaque avis est perdu (les avis restent).
-- reviews_public est recréée à l'identique du schéma initial : une colonne ne se
-- retire pas par CREATE OR REPLACE, il faut supprimer la vue (aucune dépendance,
-- vérifié au pré-vol). Le tout dans une transaction. Rejouable.
-- =============================================================================

begin;

drop function if exists public.company_city_stats(uuid);

drop view if exists public.reviews_public;

create view public.reviews_public as
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

revoke all on public.reviews_public from anon, authenticated;
grant select on public.reviews_public to anon, authenticated;

drop index if exists public.reviews_site_idx;
alter table public.reviews drop constraint if exists reviews_site_same_company;
alter table public.reviews drop column if exists site_id;

drop table if exists public.company_sites;

commit;
