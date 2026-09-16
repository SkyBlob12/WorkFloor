-- =============================================================================
-- ROLLBACK de 20260916000000_sector_photos.
--
-- Supprime la table des photos de secteur (aucune donnée utilisateur).
-- Sans risque pour l'app installée : sans la table, les cartes de secteur
-- retombent sur leur pictogramme. Rejouable : gardé par IF EXISTS.
-- =============================================================================

drop table if exists public.sector_photos;
