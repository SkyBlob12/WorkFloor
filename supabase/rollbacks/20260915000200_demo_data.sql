-- =============================================================================
-- ROLLBACK de supabase/demo/20260915000200_demo_data.sql
-- Supprime UNIQUEMENT les données de démo : les 9 fiches inventées (et en cascade leurs
-- avis, votes et signalements), puis les 10 auteurs fictifs. Double filtre (identifiant
-- ET SIREN / email) pour ne jamais toucher une donnée réelle. Rejouable.
-- À lancer avant l'ouverture au public et avant la soumission aux stores.
-- =============================================================================

begin;

delete from public.companies
where id::text like 'dc000000-0000-4000-8000-%'
  and siren ~ '^00000000[1-9]$';

delete from auth.users
where id::text like 'da000000-0000-4000-8000-%'
  and email like '%@demo.behindthedesk.invalid';

commit;

-- Vérification : attendu 0 et 0.
select
  (select count(*) from public.companies where id::text like 'dc000000-0000-4000-8000-%') as fiches_demo_restantes,
  (select count(*) from auth.users where email like '%@demo.behindthedesk.invalid') as auteurs_demo_restants;
