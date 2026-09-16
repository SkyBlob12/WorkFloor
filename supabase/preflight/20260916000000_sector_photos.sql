-- =============================================================================
-- PRÉ-VOL (lecture seule) de 20260916000000_sector_photos : npm run db:sector-photos:preflight
-- Une seule requête : chaque ligne est une vérification, `ok` doit valoir true
-- partout avant d'appliquer la migration. Ne modifie rien.
-- =============================================================================

with checks(verification, valeur, attendu) as (
  select 'schéma initial appliqué (create_policy_if_missing, set_updated_at)',
    (select count(*) from pg_proc
      where pronamespace = 'public'::regnamespace and proname in ('create_policy_if_missing', 'set_updated_at'))::text,
    '2'
  union all
  -- Absente (0) : première application. Présente (1) : la migration est rejouable, vérifier les colonnes ci-dessous.
  select 'table sector_photos déjà présente (0 ou 1)',
    (case when to_regclass('public.sector_photos') is null then 0 else 1 end)::text,
    '0 ou 1'
  union all
  select 'colonnes existantes de sector_photos (vide ou identique)',
    coalesce((select string_agg(column_name, ',' order by ordinal_position) from information_schema.columns
      where table_schema = 'public' and table_name = 'sector_photos'), ''),
    'vide ou section,image_url,source_url,updated_at'
  union all
  -- Une policy d'écriture exposerait la table à la modification par n'importe quel client.
  select 'policies autres que la lecture publique sur sector_photos',
    (select count(*) from pg_policies
      where schemaname = 'public' and tablename = 'sector_photos' and cmd <> 'SELECT')::text,
    '0'
  union all
  select 'sector_photos publiée en Realtime',
    (select count(*) from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'sector_photos')::text,
    '0'
)
select
  verification,
  valeur,
  attendu,
  case
    when attendu = '0 ou 1' then valeur in ('0', '1')
    when attendu like 'vide ou %' then valeur in ('', substr(attendu, 9))
    else valeur = attendu
  end as ok
from checks;
