/**
 * Lecture de l'URL de retour OAuth. Supabase renvoie soit un `code` (flux PKCE, dans la query),
 * soit les jetons (flux implicite, dans le fragment `#`), soit une erreur.
 */
export interface AuthCallbackParams {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
}

function parsePairs(segment: string, into: Map<string, string>): void {
  for (const pair of segment.split('&')) {
    if (!pair) continue;
    const [rawKey, ...rest] = pair.split('=');
    try {
      into.set(decodeURIComponent(rawKey), decodeURIComponent(rest.join('=').replace(/\+/g, ' ')));
    } catch {
      // Paire mal encodée : ignorée.
    }
  }
}

export function parseAuthCallbackUrl(url: string): AuthCallbackParams {
  const hashIndex = url.indexOf('#');
  const beforeHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex + 1);
  const queryIndex = beforeHash.indexOf('?');
  const params = new Map<string, string>();
  if (queryIndex !== -1) parsePairs(beforeHash.slice(queryIndex + 1), params);
  parsePairs(hash, params);

  return {
    code: params.get('code') ?? null,
    accessToken: params.get('access_token') ?? null,
    refreshToken: params.get('refresh_token') ?? null,
    error: params.get('error_code') ?? params.get('error') ?? null,
  };
}
