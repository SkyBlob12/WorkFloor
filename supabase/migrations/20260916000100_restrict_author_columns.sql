-- =============================================================================
-- Anonymat : plus aucun identifiant d'auteur lisible via l'API
--
-- Avant de l'appliquer : supabase/preflight/20260916000100_restrict_author_columns.sql
-- Pour l'annuler     : supabase/rollbacks/20260916000100_restrict_author_columns.sql
--
-- Faille corrigée : block_review_author() écrit l'user_id réel de l'auteur dans
-- user_blocks, que le bloqueur pouvait relire (blocked_user_id). Recoupé avec
-- companies.created_by (lisible par anon), on reliait avis, fiches et comptes.
--
-- Les privilèges par défaut de Supabase donnent ALL à anon / authenticated sur
-- chaque nouvelle table : on repart de zéro sur ces deux tables et on n'accorde
-- que les colonnes utiles. RLS inchangée. Les vues publiques (propriétaire
-- postgres) ne dépendent pas de ces droits.
-- Idempotente : REVOKE / GRANT sont rejouables (REVOKE sur la table retire aussi
-- les droits par colonne).
-- =============================================================================

-- Entreprises : lecture de tout sauf created_by. L'app ne lit pas la table en
-- direct (vues et search_companies) ; les Edge Functions passent par le service role.
revoke all on public.companies from anon, authenticated;
grant select (id, siren, siret, name, naf_code, sector, city, postal_code, employee_range,
  is_active, verified, is_hidden, created_at, updated_at)
  on public.companies to anon, authenticated;

-- Blocages : compter et tout débloquer, sans jamais voir qui est bloqué.
-- L'insertion passe par block_review_author() (security definer).
revoke all on public.user_blocks from anon, authenticated;
grant select (blocker_id, created_at) on public.user_blocks to authenticated;
grant delete on public.user_blocks to authenticated;

-- Hygiène : privilèges jamais utilisés par l'app et ignorés par RLS (TRUNCATE).
revoke truncate, references, trigger
  on public.reviews, public.review_votes, public.reports, public.push_tokens,
     public.abuse_events, public.banned_terms, public.sector_photos
  from anon, authenticated;
