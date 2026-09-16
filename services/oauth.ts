import { Platform } from 'react-native';

import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { OAUTH_CALLBACK_PATH, type AuthProvider } from '@constants/auth';
import { supabase } from '@lib/supabase';
import { parseAuthCallbackUrl } from '@utils/authCallback';
import { isRecord } from '@utils/guards';

import { toAuthError } from './account';
import { ServiceError } from './errors';

/** iPhone : feuille Apple native, jeton transmis à Supabase. `false` si l'utilisateur annule. */
async function signInWithAppleNative(): Promise<boolean> {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
    });
    if (!credential.identityToken) throw new ServiceError('AUTH_FAILED');
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken });
    if (error) throw toAuthError(error);
    return true;
  } catch (error) {
    if (isRecord(error) && error.code === 'ERR_REQUEST_CANCELED') return false;
    throw error instanceof ServiceError ? error : new ServiceError('AUTH_FAILED');
  }
}

/** Autres cas : fournisseur ouvert dans le navigateur système, session reçue par deep link. */
async function signInWithBrowser(provider: AuthProvider): Promise<boolean> {
  const redirectTo = Linking.createURL(OAUTH_CALLBACK_PATH);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw toAuthError(error);
  if (!data.url) throw new ServiceError('AUTH_FAILED');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;

  const params = parseAuthCallbackUrl(result.url);
  if (params.error) throw new ServiceError('AUTH_FAILED');

  if (params.code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
    if (exchangeError) throw toAuthError(exchangeError);
    return true;
  }
  if (params.accessToken && params.refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });
    if (sessionError) throw toAuthError(sessionError);
    return true;
  }
  throw new ServiceError('AUTH_FAILED');
}

/** Connexion Apple ou Google sur mobile. Renvoie `false` si l'utilisateur a abandonné. */
export async function signInWithProvider(provider: AuthProvider): Promise<boolean> {
  if (provider === 'apple' && Platform.OS === 'ios' && (await AppleAuthentication.isAvailableAsync())) {
    return signInWithAppleNative();
  }
  return signInWithBrowser(provider);
}
