// Les variables EXPO_PUBLIC_* doivent être lues littéralement pour être inlinées au build.
// Uniquement des valeurs conçues pour être publiques : aucun secret ici.
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '',
  posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
};

export const isSupabaseConfigured = env.supabaseUrl.startsWith('https://') && env.supabaseKey.length > 0;
