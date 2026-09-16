-- =============================================================================
-- PRÉ-VOL (lecture seule) de la purge : npm run db:purge:preflight
-- Montre exactement ce que supabase/maintenance/20260915000300_purge_all_data.sql supprimerait.
-- =============================================================================

select 'entreprises' as donnees, count(*) as lignes_supprimees from public.companies
union all select 'avis (en cascade)', count(*) from public.reviews
union all select 'votes utiles (en cascade)', count(*) from public.review_votes
union all select 'signalements (en cascade)', count(*) from public.reports
union all select 'auteurs masqués', count(*) from public.user_blocks
union all select 'journal anti-abus', count(*) from public.abuse_events
union all select 'jetons push', count(*) from public.push_tokens
union all select 'comptes utilisateurs (seulement si l’option est activée)', count(*) from auth.users
union all select 'mots interdits (conservés)', count(*) from public.banned_terms;
