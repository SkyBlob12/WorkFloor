-- =============================================================================
-- ROLLBACK de 20260917000200_moderation_console.
--
-- L'écran de modération de l'app cesse de fonctionner (l'entrée du compte
-- disparaît : is_moderator() échoue et vaut false côté app). Les décisions déjà
-- prises (statuts des avis et des signalements) sont conservées. Rejouable.
-- =============================================================================

begin;

drop function if exists public.moderate_review(uuid, text);
drop function if exists public.moderation_queue();
drop function if exists public.is_moderator();
drop table if exists public.moderators;

commit;
