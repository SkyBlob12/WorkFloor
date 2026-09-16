/**
 * Vérification Cloudflare Turnstile côté serveur.
 * Échoue fermé : sans TURNSTILE_SECRET_KEY configurée, aucune soumission ne passe.
 * En dev, utiliser la clé de test 1x0000000000000000000000000000000AA.
 */
export async function verifyTurnstile(token: unknown, ip?: string): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret) {
    console.error('TURNSTILE_SECRET_KEY manquante : soumission refusée');
    return false;
  }
  if (typeof token !== 'string' || token.length === 0) return false;

  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = await res.json();
    return data.success === true;
  } catch (error) {
    console.error('turnstile siteverify', error);
    return false;
  }
}
