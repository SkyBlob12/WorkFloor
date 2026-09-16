-- =============================================================================
-- PURGE DE TOUTES LES DONNÉES : IRRÉVERSIBLE, AUCUN ROLLBACK POSSIBLE.
--
-- Supprime : entreprises, avis, votes, signalements, blocages, journal anti-abus, jetons push.
-- Conserve : le schéma (tables, vues, policies, fonctions), la liste des mots interdits.
-- Option   : les comptes utilisateurs (auth.users), désactivée par défaut.
--
-- Procédure :
--   1. npm run db:backup             (sauvegarde des données dans supabase/backups/, non versionné)
--   2. npm run db:purge:preflight    (voir ce qui sera supprimé)
--   3. Remplacer 'NON' par 'OUI' ci-dessous (et l'option comptes si voulu), enregistrer
--   4. npm run db:purge
--   5. Remettre 'NON' et enregistrer, pour qu'un relancement accidentel ne fasse rien
-- =============================================================================

begin;

-- ⚠️ Confirmation obligatoire : 'OUI' pour autoriser la purge.
select set_config('app.confirm_purge', 'NON', true);
-- Option : 'OUI' pour supprimer aussi TOUS les comptes utilisateurs (y compris le tien).
select set_config('app.purge_users', 'NON', true);

do $$
begin
  if current_setting('app.confirm_purge', true) is distinct from 'OUI' then
    raise exception 'Purge non confirmée : remplacer NON par OUI dans le fichier (après sauvegarde).';
  end if;
end
$$;

-- Les avis, votes et signalements partent en cascade avec les entreprises.
delete from public.companies;
delete from public.user_blocks;
delete from public.abuse_events;
delete from public.push_tokens;

do $$
begin
  if current_setting('app.purge_users', true) = 'OUI' then
    delete from auth.users;
  end if;
end
$$;

commit;

-- Vérification : tout doit valoir 0 (sauf comptes si l'option est restée à NON).
select
  (select count(*) from public.companies) as entreprises,
  (select count(*) from public.reviews) as avis,
  (select count(*) from public.reports) as signalements,
  (select count(*) from auth.users) as comptes;
