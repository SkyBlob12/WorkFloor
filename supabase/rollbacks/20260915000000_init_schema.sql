-- =============================================================================
-- ROLLBACK de 20260915000000_init_schema (et de 20260915000100_retention_cron).
--
-- ATTENTION : SUPPRIME DÉFINITIVEMENT toutes les données du projet (entreprises,
-- avis, votes, signalements). Faire un export avant. Les comptes auth.users ne
-- sont pas touchés. Les extensions pg_trgm, unaccent et pg_cron restent installées.
-- Rejouable : chaque suppression est gardée par IF EXISTS.
-- =============================================================================

begin;

-- Tâches planifiées (seulement si pg_cron est installé)
do $$
begin
  if to_regclass('cron.job') is not null then
    perform cron.unschedule(jobname)
    from cron.job
    where jobname in ('purge-abuse-events', 'purge-removed-reviews');
  end if;
end
$$;

drop function if exists public.search_companies(text, integer);
drop view if exists public.reviews_public;
drop view if exists public.companies_with_stats;

drop table if exists public.push_tokens;
drop table if exists public.banned_terms;
drop table if exists public.abuse_events;
drop table if exists public.user_blocks;
drop table if exists public.reports;
drop table if exists public.review_votes;
drop table if exists public.reviews;
drop table if exists public.companies;

drop function if exists public.consume_rate_limit(text, uuid, text, integer, integer, interval);
drop function if exists public.block_review_author(uuid);
drop function if exists public.on_report_created();
drop function if exists public.sync_helpful_count();
drop function if exists public.review_is_actionable(uuid);
drop function if exists public.create_policy_if_missing(text, text, text);
drop function if exists public.normalize_text(text);
drop function if exists public.set_updated_at();

drop type if exists public.banned_term_action;
drop type if exists public.report_status;
drop type if exists public.report_reason;
drop type if exists public.review_status;
drop type if exists public.salary_period;
drop type if exists public.contract_type;
drop type if exists public.employment_status;

commit;
