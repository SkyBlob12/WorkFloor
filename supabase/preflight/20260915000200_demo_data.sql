-- =============================================================================
-- PRÉ-VOL (lecture seule) des données de démo : npm run db:demo:preflight
-- Une seule requête (lisible depuis le CLI) : chaque ligne est une vérification,
-- `ok` doit valoir true partout avant de lancer npm run db:demo:seed.
-- =============================================================================

with checks(verification, valeur, attendu, ok) as (
  select 'schéma appliqué (companies, reviews, vues)',
    (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname in ('companies', 'reviews', 'companies_with_stats', 'reviews_public'))::text,
    '4', null::boolean
  union all
  select 'colonnes auth.users utilisées par le seed',
    (select count(*) from information_schema.columns
      where table_schema = 'auth' and table_name = 'users'
        and column_name in ('instance_id', 'id', 'aud', 'role', 'email', 'encrypted_password', 'email_confirmed_at',
                            'raw_app_meta_data', 'raw_user_meta_data', 'created_at', 'updated_at',
                            'confirmation_token', 'recovery_token', 'email_change_token_new', 'email_change'))::text,
    '15', null
  union all
  select 'triggers personnalisés sur auth.users',
    (select count(*) from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal)::text,
    '0', null
  union all
  select 'SIREN de démo pris par une autre fiche',
    (select count(*) from public.companies
      where siren ~ '^00000000[1-9]$' and id::text not like 'dc000000-0000-4000-8000-%')::text,
    '0', null
  union all
  select 'email de démo pris par un autre compte',
    (select count(*) from auth.users
      where email like '%@demo.behindthedesk.invalid' and id::text not like 'da000000-0000-4000-8000-%')::text,
    '0', null
  union all
  select 'valeurs de contract_type',
    (select string_agg(e.enumlabel, ',' order by e.enumsortorder) from pg_enum e
      where e.enumtypid = 'public.contract_type'::regtype),
    'cdi,cdd,interim,internship,apprenticeship,freelance,other', null
  union all
  select 'avis de démo déjà présents (0 ou 30)',
    (select count(*) from public.reviews where company_id::text like 'dc000000-0000-4000-8000-%')::text,
    '0 ou 30', null
)
select
  verification,
  valeur,
  attendu,
  case when attendu = '0 ou 30' then valeur in ('0', '30') else valeur = attendu end as ok
from checks;
