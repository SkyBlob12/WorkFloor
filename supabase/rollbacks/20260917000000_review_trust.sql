-- =============================================================================
-- ROLLBACK de 20260917000000_review_trust.
--
-- ORDRE : redéployer d'abord la version précédente de submit-review (elle écrit
-- des colonnes supprimées ici), sinon toute publication d'avis échoue.
--
-- Effets sur les données :
--   * les avis retenus pour compte récent (hold_reason = new_account) sont publiés,
--     comme ils l'auraient été sans la migration ;
--   * les avis retenus pour activité inhabituelle restent pending (relecture humaine,
--     indices conservés dans moderation_flags.activity_signals) ;
--   * les dates d'attestation, poids et surveillances sont supprimés.
-- La vue companies_with_stats est recréée à l'identique du schéma initial : il faut
-- la supprimer (une colonne ne se retire pas par CREATE OR REPLACE), donc aussi
-- search_companies qui renvoie son type. Le tout dans une transaction.
-- Rejouable.
-- =============================================================================

begin;

select cron.unschedule('release-held-reviews')
where exists (select 1 from cron.job where jobname = 'release-held-reviews');

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'reviews' and column_name = 'hold_reason'
  ) then
    update public.reviews set status = 'published' where status = 'pending' and hold_reason = 'new_account';
  end if;
end
$$;

drop function if exists public.search_companies(text, integer);
drop view if exists public.companies_with_stats;

create view public.companies_with_stats as
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

revoke all on public.companies_with_stats from anon, authenticated;
grant select on public.companies_with_stats to anon, authenticated;
grant all on public.companies_with_stats to service_role;
grant execute on function public.search_companies(text, integer) to anon, authenticated;

drop function if exists public.release_held_reviews();
drop function if exists public.open_company_watch(uuid, text[]);
drop function if exists public.company_activity_stats(uuid, uuid, text);
drop table if exists public.company_watches;

drop trigger if exists reviews_clear_hold on public.reviews;
drop function if exists public.clear_review_hold();

drop index if exists public.reviews_held_idx;
drop index if exists public.reviews_company_created_idx;

alter table public.reviews drop constraint if exists reviews_hold_reason_check;
alter table public.reviews drop constraint if exists reviews_trust_weight_check;
alter table public.reviews drop column if exists attested_at;
alter table public.reviews drop column if exists hold_reason;
alter table public.reviews drop column if exists held_until;
alter table public.reviews drop column if exists trust_weight;

commit;
