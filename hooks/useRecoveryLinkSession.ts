import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import * as Linking from 'expo-linking';

import { restoreSessionFromUrl } from '@services/account';
import { parseAuthCallbackUrl } from '@utils/authCallback';
import { logger } from '@utils/logger';

function carriesSession(url: string | null): url is string {
  if (!url) return false;
  const params = parseAuthCallbackUrl(url);
  return Boolean(params.code || (params.accessToken && params.refreshToken));
}

/**
 * Mobile : enregistre la session portée par le lien « mot de passe oublié » qui a ouvert l'app.
 * Sur le web, supabase-js la lit lui-même dans l'URL. Renvoie `true` tant que la session est en cours d'enregistrement.
 */
export function useRecoveryLinkSession(): boolean {
  const url = Linking.useLinkingURL();
  const [handledUrl, setHandledUrl] = useState<string | null>(null);
  const pending = Platform.OS !== 'web' && carriesSession(url) && url !== handledUrl;

  useEffect(() => {
    if (!pending || !url) return;
    restoreSessionFromUrl(url)
      .catch((error: unknown) => logger.warn('Lien de réinitialisation inexploitable', error))
      .finally(() => setHandledUrl(url));
  }, [pending, url]);

  return pending;
}

export default useRecoveryLinkSession;
