-- =============================================================================
-- ROLLBACK de 20260916000100_restrict_author_columns.
--
-- ATTENTION : rouvre la faille d'anonymat (companies.created_by et
-- user_blocks.blocked_user_id à nouveau lisibles). Ne l'utiliser que si la
-- migration casse l'app, le temps de corriger.
--
-- Restaure les droits constatés avant la migration (ALL, défaut Supabase) sur
-- companies et user_blocks. Le retrait de TRUNCATE / REFERENCES / TRIGGER sur les
-- autres tables n'est pas annulé : rien ne s'en sert. Aucune donnée touchée.
-- Rejouable.
-- =============================================================================

grant all on public.companies to anon, authenticated;
grant all on public.user_blocks to authenticated;
