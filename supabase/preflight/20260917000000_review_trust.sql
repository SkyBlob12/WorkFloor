-- =============================================================================
-- PRÉ-VOL (lecture seule) de 20260917000000_review_trust :
-- npm run db:review-trust:preflight
-- Une seule requête : chaque ligne est une vérification, `ok` doit valoir true
-- partout avant d'écrire / appliquer la migration. Ne modifie rien.
--
-- Ce que prévoit la migration (lutte contre les faux avis) :
--   * reviews : colonnes attested_at, hold_reason, held_until, trust_weight
--     (ADD COLUMN nullable ou à défaut constant : pas de réécriture) ;
--   * table company_watches (entreprises sous surveillance), service role seul ;
--   * fonctions company_activity_stats, open_company_watch, release_held_reviews
--     (lit auth.users.created_at), trigger clear_review_hold ;
--   * tâche pg_cron release-held-reviews ;
--   * companies_with_stats remplacée : moyennes pondérées, avis de la période
--     surveillée exclus, colonne under_review ajoutée EN FIN de vue.
-- =============================================================================

with checks(verification, valeur, attendu) as (
  select 'version de Postgres >= 11 (ADD COLUMN avec défaut sans réécriture)',
    (current_setting('server_version_num')::integer >= 110000)::text,
    'true'
  union all
  -- Liste exacte : une colonne ajoutée hors migration serait à examiner avant.
  -- Si la migration a déjà été appliquée, les 4 nouvelles colonnes apparaissent en fin de liste.
  select 'colonnes de reviews',
    (select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns
      where table_schema = 'public' and table_name = 'reviews'),
    'id,company_id,user_id,rating_overall,rating_culture,rating_salary,rating_benefits,rating_management,rating_work_life,recommends,title,pros,cons,benefits,job_title,employment_status,contract_type,salary_amount,salary_period,status,moderation_flags,helpful_count,report_count,created_at,updated_at'
  union all
  select 'valeurs de review_status',
    (select string_agg(enumlabel, ',' order by enumsortorder) from pg_enum
      where enumtypid = 'public.review_status'::regtype),
    'published,pending,hidden,removed'
  union all
  select 'triggers de reviews',
    (select coalesce(string_agg(tgname, ',' order by tgname), '') from pg_trigger
      where tgrelid = 'public.reviews'::regclass and not tgisinternal),
    'reviews_set_updated_at'
  union all
  -- La vue est remplacée : sa liste de colonnes actuelle doit être celle attendue,
  -- sinon CREATE OR REPLACE VIEW échouerait (on ne peut qu'ajouter en fin).
  select 'colonnes de companies_with_stats',
    (select string_agg(column_name || ':' || data_type, ',' order by ordinal_position) from information_schema.columns
      where table_schema = 'public' and table_name = 'companies_with_stats'),
    'id:uuid,siren:text,siret:text,name:text,naf_code:text,sector:text,city:text,postal_code:text,employee_range:text,is_active:boolean,verified:boolean,created_at:timestamp with time zone,review_count:integer,avg_overall:double precision,avg_culture:double precision,avg_salary:double precision,avg_benefits:double precision,avg_management:double precision,avg_work_life:double precision,recommend_pct:integer'
  union all
  select 'propriétaire de companies_with_stats (lecture sans RLS, anonymat)',
    (select pg_get_userbyid(relowner) from pg_class
      where relnamespace = 'public'::regnamespace and relname = 'companies_with_stats'),
    'postgres'
  union all
  -- Objets qui dépendent de la vue : ils doivent rester compatibles avec une colonne en plus.
  select 'vues dépendant de companies_with_stats',
    (select count(distinct dep.relname) from pg_depend d
      join pg_rewrite rw on rw.oid = d.objid
      join pg_class dep on dep.oid = rw.ev_class
      where d.refobjid = 'public.companies_with_stats'::regclass and dep.oid <> d.refobjid)::text,
    '0'
  union all
  select 'fonctions renvoyant companies_with_stats',
    (select coalesce(string_agg(proname, ',' order by proname), '') from pg_proc
      where prorettype = 'public.companies_with_stats'::regtype),
    'search_companies'
  union all
  select 'search_companies sans corps BEGIN ATOMIC (colonnes résolues à l''exécution)',
    (select (prosqlbody is null)::text from pg_proc
      where proname = 'search_companies' and pronamespace = 'public'::regnamespace),
    'true'
  union all
  select 'companies_with_stats ou reviews publiées en Realtime',
    (select count(*) from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public'
        and tablename in ('companies_with_stats', 'reviews', 'company_watches'))::text,
    '0'
  union all
  select 'pg_trgm installée dans le schéma extensions (similarité des textes)',
    (select coalesce(string_agg(n.nspname, ','), 'absente') from pg_extension e
      join pg_namespace n on n.oid = e.extnamespace where e.extname = 'pg_trgm'),
    'extensions'
  union all
  select 'pg_cron installée (publication différée des avis)',
    exists (select 1 from pg_extension where extname = 'pg_cron')::text,
    'true'
  union all
  select 'colonnes de abuse_events (réseau partagé entre auteurs)',
    (select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns
      where table_schema = 'public' and table_name = 'abuse_events'),
    'id,action,user_id,ip_hash,created_at'
  union all
  select 'auth.users.created_at présente (ancienneté des comptes)',
    exists (select 1 from information_schema.columns
      where table_schema = 'auth' and table_name = 'users' and column_name = 'created_at')::text,
    'true'
  union all
  -- État actuel, informatif : false avant la migration, true si déjà appliquée (rejouable).
  select 'table company_watches déjà présente',
    (to_regclass('public.company_watches') is not null)::text,
    'true ou false'
  union all
  select 'fonctions de la migration déjà présentes (0 ou 4)',
    (select count(*) from pg_proc where pronamespace = 'public'::regnamespace
      and proname in ('company_activity_stats', 'open_company_watch', 'release_held_reviews', 'clear_review_hold'))::text,
    '0 ou 4'
  union all
  select 'tâche cron release-held-reviews déjà planifiée',
    (select count(*) from cron.job where jobname = 'release-held-reviews')::text,
    '0 ou 1'
  union all
  -- Volumétrie, informatif : les index créés sans CONCURRENTLY bloquent les écritures le temps du build.
  select 'nombre d''avis (index créés sans CONCURRENTLY)',
    (select count(*) from public.reviews)::text,
    'nombre'
  union all
  select 'avis actuellement en attente (relecture humaine, non touchés)',
    (select count(*) from public.reviews where status = 'pending')::text,
    'nombre'
)
select
  verification,
  valeur,
  attendu,
  case attendu
    when 'true ou false' then valeur in ('true', 'false')
    when '0 ou 4' then valeur in ('0', '4')
    when '0 ou 1' then valeur in ('0', '1')
    when 'nombre' then valeur ~ '^[0-9]+$'
    else valeur = attendu
  end as ok
from checks;
