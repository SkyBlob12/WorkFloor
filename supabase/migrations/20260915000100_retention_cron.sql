-- Durée de conservation des données anti-abus (à reporter dans la politique de confidentialité).
-- Séparé du schéma initial : si pg_cron n'est pas activable, seul ce fichier échoue.

create extension if not exists pg_cron with schema pg_catalog;

select cron.schedule(
  'purge-abuse-events',
  '17 3 * * *',
  $$ delete from public.abuse_events where created_at < now() - interval '30 days' $$
);

-- Les avis masqués par l'utilisateur ou la modération depuis plus d'un an sont purgés.
select cron.schedule(
  'purge-removed-reviews',
  '27 3 * * *',
  $$ delete from public.reviews where status = 'removed' and updated_at < now() - interval '1 year' $$
);
