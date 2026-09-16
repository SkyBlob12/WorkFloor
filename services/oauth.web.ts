import { OAUTH_CALLBACK_PATH, type AuthProvider } from '@constants/auth';
import { supabase } from '@lib/supabase';

import { toAuthError } from './account';

/**
 * Web : redirection pleine page vers le fournisseur. Au retour sur /auth-callback,
 * supabase-js lit la session dans l'URL (detectSessionInUrl). La promesse ne se résout
 * qu'avant la redirection, d'où `false`.
 */
export async function signInWithProvider(provider: AuthProvider): Promise<boolean> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/${OAUTH_CALLBACK_PATH}` },
  });
  if (error) throw toAuthError(error);
  return false;
}
