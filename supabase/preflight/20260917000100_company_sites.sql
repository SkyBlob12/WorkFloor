-- =============================================================================
-- PRÉ-VOL (lecture seule) de 20260917000100_company_sites :
-- npm run db:company-sites:preflight
-- Une seule requête : chaque ligne est une vérification, `ok` doit valoir true
-- partout avant d'écrire / appliquer la migration. Ne modifie rien.
--
-- Ce que prévoit la migration (entreprises présentes sur plusieurs villes) :
--   * une fiche reste une entité légale (SIREN) : aucun changement sur companies ;
--   * table company_sites : établissements vérifiés dans SIRENE (SIRET unique,
--     ville, code postal), écrite par Edge Function seulement ;
--   * reviews.site_id : colonne nullable (ADD COLUMN sans défaut, pas de réécriture),
--     les avis existants restent « site non précisé » ;
--   * reviews_public remplacée : colonnes site_city / site_postal_code ajoutées EN FIN,
--     renseignées seulement si le site compte au moins 3 avis publiés (anonymat) ;
--   * fonction company_site_stats(company_id) : moyennes par site, même seuil.
-- =============================================================================

with checks(verification, valeur, attendu) as (
  select 'version de Postgres >= 11 (ADD COLUMN sans réécriture)',
    (current_setting('server_version_num')::integer >= 110000)::text,
    'true'
  union all
  -- Informatif : indique si 20260917000000_review_trust est déjà appliquée
  -- (attested_at, hold_reason, held_until, trust_weight en fin de liste).
  select 'colonnes de reviews',
    (select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns
      where table_schema = 'public' and table_name = 'reviews'),
    'liste'
  union all
  select 'reviews.site_id déjà présente',
    exists (select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'reviews' and column_name = 'site_id')::text,
    'true ou false'
  union all
  select 'table company_sites déjà présente',
    (to_regclass('public.company_sites') is not null)::text,
    'true ou false'
  union all
  -- La vue est remplacée : on ne peut qu'ajouter des colonnes en fin.
  select 'colonnes de reviews_public',
    (select string_agg(column_name || ':' || data_type, ',' order by ordinal_position) from information_schema.columns
      where table_schema = 'public' and table_name = 'reviews_public'),
    'id:uuid,company_id:uuid,rating_overall:smallint,rating_culture:smallint,rating_salary:smallint,rating_benefits:smallint,rating_management:smallint,rating_work_life:smallint,recommends:boolean,title:text,pros:text,cons:text,benefits:text,job_title:text,employment_status:USER-DEFINED,contract_type:USER-DEFINED,salary_amount:integer,salary_period:USER-DEFINED,helpful_count:integer,published_month:date,is_edited:boolean,is_mine:boolean,voted_helpful:boolean'
  union all
  select 'propriétaire de reviews_public (lecture sans RLS, anonymat)',
    (select pg_get_userbyid(relowner) from pg_class
      where relnamespace = 'public'::regnamespace and relname = 'reviews_public'),
    'postgres'
  union all
  select 'reviews_public sans security_invoker',
    (select coalesce(not ('security_invoker=true' = any(coalesce(reloptions, '{}'))), true)::text from pg_class
      where relnamespace = 'public'::regnamespace and relname = 'reviews_public'),
    'true'
  union all
  select 'droits sur reviews_public',
    (select string_agg(grantee || ':' || privilege_type, ',' order by grantee, privilege_type)
      from information_schema.role_table_grants
      where table_schema = 'public' and table_name = 'reviews_public' and grantee in ('anon', 'authenticated')),
    'anon:SELECT,authenticated:SELECT'
  union all
  select 'vues dépendant de reviews_public',
    (select count(distinct dep.relname) from pg_depend d
      join pg_rewrite rw on rw.oid = d.objid
      join pg_class dep on dep.oid = rw.ev_class
      where d.refobjid = 'public.reviews_public'::regclass and dep.oid <> d.refobjid)::text,
    '0'
  union all
  select 'fonctions renvoyant reviews_public',
    (select coalesce(string_agg(proname, ',' order by proname), '') from pg_proc
      where prorettype = 'public.reviews_public'::regtype),
    'liste'
  union all
  select 'fonction company_site_stats déjà présente',
    exists (select 1 from pg_proc where pronamespace = 'public'::regnamespace and proname = 'company_site_stats')::text,
    'true ou false'
  union all
  select 'helper create_policy_if_missing présent',
    exists (select 1 from pg_proc where pronamespace = 'public'::regnamespace and proname = 'create_policy_if_missing')::text,
    'true'
  union all
  select 'reviews ou company_sites publiées en Realtime',
    (select count(*) from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public'
        and tablename in ('reviews', 'company_sites'))::text,
    '0'
  union all
  select 'policies existantes sur reviews',
    (select coalesce(string_agg(policyname || ':' || cmd, ',' order by policyname), '') from pg_policies
      where schemaname = 'public' and tablename = 'reviews'),
    'liste'
  union all
  -- Aucun trigger ne doit réagir à un UPDATE de site_id de façon inattendue.
  select 'triggers de reviews',
    (select coalesce(string_agg(tgname, ',' order by tgname), '') from pg_trigger
      where tgrelid = 'public.reviews'::regclass and not tgisinternal),
    'liste'
  union all
  -- Volumétrie, informatif : index créés sans CONCURRENTLY sur une petite table.
  select 'nombre d''avis',
    (select count(*) from public.reviews)::text,
    'nombre'
  union all
  select 'nombre d''entreprises',
    (select count(*) from public.companies)::text,
    'nombre'
  union all
  select 'entreprises avec SIRET du siège renseigné',
    (select count(*) from public.companies where siret is not null)::text,
    'nombre'
)
select
  verification,
  valeur,
  attendu,
  case attendu
    when 'true ou false' then valeur in ('true', 'false')
    when 'nombre' then valeur ~ '^[0-9]+$'
    when 'liste' then valeur is not null
    else valeur = attendu
  end as ok
from checks;
