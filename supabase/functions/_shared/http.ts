export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Erreur renvoyée à l'app : un code stable, jamais de texte localisé.
 * Liste des codes : constants/serviceErrors.ts (traductions : common:serviceError.<CODE>).
 */
export function failure(code: string, status: number) {
  return json({ error: code }, status);
}

export function clientIp(req: Request): string | undefined {
  return (
    req.headers.get('cf-connecting-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    undefined
  );
}

/**
 * On ne stocke jamais l'IP en clair : hash salé, purgé à 30 jours
 * (cf. migration retention_cron et politique de confidentialité).
 */
export async function hashIp(ip: string | undefined): Promise<string | null> {
  if (!ip) return null;
  const salt = Deno.env.get('IP_HASH_SALT') ?? '';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}
