import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';

import { signInWithProvider } from '@services/oauth';

import { resetSupabaseMock, supabase } from '../mocks/supabase';

jest.mock('expo-linking', () => ({ createURL: jest.fn(() => 'workfloor://auth-callback') }));
jest.mock('expo-web-browser', () => ({ openAuthSessionAsync: jest.fn() }));
jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  signInAsync: jest.fn(),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));

const openAuthSession = jest.mocked(WebBrowser.openAuthSessionAsync);
const appleAvailable = jest.mocked(AppleAuthentication.isAvailableAsync);
const appleSignIn = jest.mocked(AppleAuthentication.signInAsync);

describe('signInWithProvider (navigateur)', () => {
  beforeEach(() => resetSupabaseMock());

  it('ouvre le fournisseur puis enregistre la session reçue', async () => {
    openAuthSession.mockResolvedValueOnce({
      type: 'success',
      url: 'workfloor://auth-callback#access_token=a&refresh_token=r',
    });

    await expect(signInWithProvider('google')).resolves.toBe(true);
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: 'workfloor://auth-callback', skipBrowserRedirect: true },
    });
    expect(openAuthSession).toHaveBeenCalledWith('https://auth.test/authorize', 'workfloor://auth-callback');
    expect(supabase.auth.setSession).toHaveBeenCalledWith({ access_token: 'a', refresh_token: 'r' });
  });

  it('échange le code du flux PKCE', async () => {
    openAuthSession.mockResolvedValueOnce({ type: 'success', url: 'workfloor://auth-callback?code=c0de' });
    await expect(signInWithProvider('google')).resolves.toBe(true);
    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('c0de');
  });

  it('ne fait rien si la fenêtre est fermée', async () => {
    openAuthSession.mockResolvedValueOnce({ type: 'cancel' } as never);
    await expect(signInWithProvider('google')).resolves.toBe(false);
    expect(supabase.auth.setSession).not.toHaveBeenCalled();
  });

  it('convertit une erreur de retour en code stable', async () => {
    openAuthSession.mockResolvedValueOnce({ type: 'success', url: 'workfloor://auth-callback?error=access_denied' });
    await expect(signInWithProvider('google')).rejects.toMatchObject({ code: 'AUTH_FAILED' });
  });
});

describe('signInWithProvider (Apple natif sur iPhone)', () => {
  beforeEach(() => {
    resetSupabaseMock();
    appleAvailable.mockResolvedValue(true);
  });

  it('transmet le jeton Apple à Supabase sans ouvrir de navigateur', async () => {
    appleSignIn.mockResolvedValueOnce({ identityToken: 'apple-jwt' } as never);
    await expect(signInWithProvider('apple')).resolves.toBe(true);
    expect(supabase.auth.signInWithIdToken).toHaveBeenCalledWith({ provider: 'apple', token: 'apple-jwt' });
    expect(openAuthSession).not.toHaveBeenCalled();
  });

  it('considère la fermeture de la feuille comme un abandon', async () => {
    appleSignIn.mockRejectedValueOnce({ code: 'ERR_REQUEST_CANCELED' });
    await expect(signInWithProvider('apple')).resolves.toBe(false);
  });

  it('refuse une réponse sans jeton', async () => {
    appleSignIn.mockResolvedValueOnce({ identityToken: null } as never);
    await expect(signInWithProvider('apple')).rejects.toMatchObject({ code: 'AUTH_FAILED' });
  });
});
