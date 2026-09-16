-- =============================================================================
-- PRÉ-VOL (lecture seule) : à lancer dans le SQL Editor AVANT les migrations
-- 20260915000000_init_schema et 20260915000100_retention_cron.
-- Ne modifie rien. Coller le résultat de chaque requête avant d'appliquer.
-- =============================================================================

-- 1. Extensions nécessaires : disponibles ? déjà installées ?
select name, default_version, installed_version
from pg_available_extensions
where name in ('pg_trgm', 'unaccent', 'pg_cron')
order by name;

-- 2. Tables et vues du projet déjà présentes (et RLS active ou non)
select c.relname, c.relkind, c.relrowsecurity as rls_active
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('companies', 'reviews', 'review_votes', 'reports', 'user_blocks', 'abuse_events',
                    'banned_terms', 'push_tokens', 'companies_with_stats', 'reviews_public')
order by c.relname;

-- 3. Types énumérés déjà présents (une valeur différente bloquerait l'app)
select t.typname, array_agg(e.enumlabel order by e.enumsortorder) as valeurs
from pg_type t
join pg_enum e on e.enumtypid = t.oid
where t.typnamespace = 'public'::regnamespace
group by t.typname
order by t.typname;

-- 4. Colonnes existantes (détecte un schéma antérieur divergent)
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('companies', 'reviews', 'review_votes', 'reports', 'user_blocks',
                     'abuse_events', 'banned_terms', 'push_tokens')
order by table_name, ordinal_position;

-- 5. Policies RLS existantes sur le schéma public
select tablename, policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 6. Index existants
select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;

-- 7. Volumétrie : des données réelles existent-elles déjà ?
select relname, n_live_tup
from pg_stat_user_tables
where schemaname = 'public'
order by relname;

-- 8. Aucune table du projet ne doit être publiée en Realtime (diffusion des lignes aux clients)
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime' and schemaname = 'public';

-- 9. pg_cron prêt, et tâches déjà planifiées
select to_regclass('cron.job') is not null as cron_installe;
-- Si true : select jobname, schedule, command from cron.job order by jobname;

-- 10. Utilisateurs existants (les FK vers auth.users seront créées avec on delete cascade)
select count(*) as nb_utilisateurs from auth.users;
