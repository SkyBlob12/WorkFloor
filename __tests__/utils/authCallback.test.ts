import { parseAuthCallbackUrl } from '@utils/authCallback';

describe('parseAuthCallbackUrl', () => {
  it('lit les jetons du flux implicite dans le fragment', () => {
    expect(parseAuthCallbackUrl('workfloor://auth-callback#access_token=abc&refresh_token=def&type=bearer')).toEqual({
      code: null,
      accessToken: 'abc',
      refreshToken: 'def',
      error: null,
    });
  });

  it('lit le code du flux PKCE dans la query', () => {
    expect(parseAuthCallbackUrl('exp://192.168.1.2:8081/--/auth-callback?code=xyz').code).toBe('xyz');
  });

  it('remonte une erreur du fournisseur', () => {
    const url = 'https://site.fr/auth-callback?error=access_denied&error_code=user_cancelled&error_description=Nope+here';
    expect(parseAuthCallbackUrl(url).error).toBe('user_cancelled');
  });

  it('ignore une URL sans paramètres', () => {
    expect(parseAuthCallbackUrl('workfloor://auth-callback')).toEqual({
      code: null,
      accessToken: null,
      refreshToken: null,
      error: null,
    });
  });
});
