import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';

export type { SupabaseClient };

export function adminClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Utilisateur authentifié à partir du JWT de session envoyé par supabase-js. */
export async function getUser(req: Request, admin: SupabaseClient): Promise<User | null> {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user || data.user.is_anonymous) return null;
  return data.user;
}

export async function consumeRateLimit(
  admin: SupabaseClient,
  opts: { action: string; userId: string; ipHash: string | null; userMax: number; ipMax: number; window: string },
): Promise<boolean> {
  const { data, error } = await admin.rpc('consume_rate_limit', {
    p_action: opts.action,
    p_user_id: opts.userId,
    p_ip_hash: opts.ipHash,
    p_user_max: opts.userMax,
    p_ip_max: opts.ipMax,
    p_window: opts.window,
  });
  if (error) {
    console.error('consume_rate_limit', error);
    return false;
  }
  return data === true;
}
