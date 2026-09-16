-- ROLLBACK de 20260915000100_retention_cron : retire les tâches de purge, sans toucher aux données.
-- Rejouable. L'extension pg_cron reste installée.
do $$
begin
  if to_regclass('cron.job') is not null then
    perform cron.unschedule(jobname)
    from cron.job
    where jobname in ('purge-abuse-events', 'purge-removed-reviews');
  end if;
end
$$;
