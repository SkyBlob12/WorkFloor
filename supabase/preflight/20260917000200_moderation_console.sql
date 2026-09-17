-- =============================================================================
-- PRÉ-VOL (lecture seule) de 20260917000200_moderation_console :
-- npm run db:moderation:preflight
-- Une seule requête : chaque ligne est une vérification, `ok` doit valoir true
-- partout avant d'appliquer la migration. Ne modifie rien.
--
-- Ce que prévoit la migration (écran de modération dans l'app) :
--   * table moderators (user_id) : aucune lecture ni écriture pour anon / authenticated ;
--   * fonctions security definer is_moderator(), moderation_queue(), moderate_review(),
--     qui refusent tout appelant absent de moderators ;
--   * aucune policy ajoutée sur reviews ni reports, aucune vue publique modifiée.
-- =============================================================================

with checks(verification, valeur, attendu) as (
  select 'table moderators déjà présente',
    (to_regclass('public.moderators') is not null)::text,
    'true ou false'
  union all
  select 'compte modérateur présent dans auth.users',
    exists (select 1 from auth.users where id = 'c2dc2540-212b-4bb6-850d-1b3365ac38c9')::text,
    'true'
  union all
  select 'compte modérateur non anonyme',
    coalesce((select not is_anonymous from auth.users where id = 'c2dc2540-212b-4bb6-850d-1b3365ac38c9'), false)::text,
    'true'
  union all
  select 'fonctions de modération déjà présentes',
    (select coalesce(string_agg(proname, ',' order by proname), '') from pg_proc
      where pronamespace = 'public'::regnamespace
        and proname in ('is_moderator', 'moderation_queue', 'moderate_review')),
    'liste ou vide'
  union all
  -- La migration écrit ces valeurs : l'énuméré doit les connaître.
  select 'valeurs de review_status',
    (select string_agg(enumlabel, ',' order by enumsortorder) from pg_enum
      where enumtypid = 'public.review_status'::regtype),
    'published,pending,hidden,removed'
  union all
  select 'valeurs de report_status',
    (select string_agg(enumlabel, ',' order by enumsortorder) from pg_enum
      where enumtypid = 'public.report_status'::regtype),
    'open,actioned,dismissed'
  union all
  -- La file lit hold_reason (migration review_trust).
  select 'reviews.hold_reason présente',
    exists (select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'reviews' and column_name = 'hold_reason')::text,
    'true'
  union all
  -- Quitter pending doit vider l'attente automatique.
  select 'trigger reviews_clear_hold présent',
    exists (select 1 from pg_trigger
      where tgrelid = 'public.reviews'::regclass and tgname = 'reviews_clear_hold')::text,
    'true'
  union all
  -- Anonymat : aucune policy de mise à jour ne doit exister sur reviews / reports.
  select 'policies update / insert sur reviews',
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'reviews' and cmd in ('UPDATE', 'INSERT', 'ALL'))::text,
    '0'
  union all
  select 'policies update sur reports',
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'reports' and cmd in ('UPDATE', 'ALL'))::text,
    '0'
  union all
  -- Volumétrie, informatif.
  select 'signalements ouverts',
    (select count(*) from public.reports where status = 'open')::text,
    'nombre'
  union all
  select 'avis en relecture humaine',
    (select count(*) from public.reviews where status = 'pending' and hold_reason is null)::text,
    'nombre'
)
select
  verification,
  valeur,
  attendu,
  case attendu
    when 'true ou false' then valeur in ('true', 'false')
    when 'nombre' then valeur ~ '^[0-9]+$'
    when 'liste ou vide' then valeur is not null
    else valeur = attendu
  end as ok
from checks;
