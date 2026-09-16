-- =============================================================================
-- PRÉ-VOL (lecture seule) de 20260916000100_restrict_author_columns :
-- npm run db:restrict-author-columns:preflight
-- Une seule requête : chaque ligne est une vérification, `ok` doit valoir true
-- partout avant d'appliquer la migration. Ne modifie rien.
-- =============================================================================

with checks(verification, valeur, attendu) as (
  -- La migration accorde SELECT colonne par colonne : une colonne ajoutée hors
  -- migration deviendrait illisible pour l'app. Liste attendue exacte.
  select 'colonnes de companies',
    (select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns
      where table_schema = 'public' and table_name = 'companies'),
    'id,siren,siret,name,naf_code,sector,city,postal_code,employee_range,is_active,verified,is_hidden,created_by,created_at,updated_at'
  union all
  select 'colonnes de user_blocks',
    (select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns
      where table_schema = 'public' and table_name = 'user_blocks'),
    'blocker_id,blocked_user_id,created_at'
  union all
  -- Les vues publiques lisent les tables avec les droits de leur propriétaire :
  -- retirer des droits à anon / authenticated ne doit pas les casser.
  select 'propriétaire des vues publiques',
    (select string_agg(distinct pg_get_userbyid(relowner), ',') from pg_class
      where relnamespace = 'public'::regnamespace and relname in ('reviews_public', 'companies_with_stats')),
    'postgres'
  union all
  -- Une vue (hors propriétaire postgres) ou une fonction SECURITY INVOKER qui lit
  -- ces colonnes échouerait après la migration.
  select 'vues non postgres lisant created_by ou blocked_user_id',
    (select count(*) from information_schema.view_column_usage u
      join pg_class v on v.relname = u.view_name and v.relnamespace = 'public'::regnamespace
      where u.table_schema = 'public'
        and ((u.table_name = 'companies' and u.column_name = 'created_by')
          or (u.table_name = 'user_blocks' and u.column_name = 'blocked_user_id'))
        and pg_get_userbyid(v.relowner) <> 'postgres')::text,
    '0'
  union all
  select 'fonctions SECURITY INVOKER citant created_by ou blocked_user_id',
    (select count(*) from pg_proc
      where pronamespace = 'public'::regnamespace and not prosecdef
        and (prosrc ilike '%created_by%' or prosrc ilike '%blocked_user_id%'))::text,
    '0'
  union all
  select 'companies ou user_blocks publiées en Realtime',
    (select count(*) from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename in ('companies', 'user_blocks'))::text,
    '0'
  union all
  -- État actuel, informatif : true avant la migration (fuite), false après.
  select 'anon lit companies.created_by (true = pas encore appliquée)',
    has_column_privilege('anon', 'public.companies', 'created_by', 'SELECT')::text,
    'true ou false'
  union all
  select 'authenticated lit user_blocks.blocked_user_id (true = pas encore appliquée)',
    has_column_privilege('authenticated', 'public.user_blocks', 'blocked_user_id', 'SELECT')::text,
    'true ou false'
)
select
  verification,
  valeur,
  attendu,
  case when attendu = 'true ou false' then valeur in ('true', 'false') else valeur = attendu end as ok
from checks;
