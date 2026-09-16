import { restoreSessionFromUrl, sendPasswordReset, signUp } from '@services/account';

import { resetSupabaseMock, supabase } from '../mocks/supabase';

jest.mock('expo-linking', () => ({ createURL: jest.fn((path: string) => `workfloor://${path}`) }));

describe('sendPasswordReset', () => {
  beforeEach(() => resetSupabaseMock());

  it("renvoie vers l'app par deep link, sans site web", async () => {
    await sendPasswordReset(' a@b.fr ');
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('a@b.fr', {
      redirectTo: 'workfloor://reset-password',
    });
  });
});

describe('restoreSessionFromUrl', () => {
  beforeEach(() => resetSupabaseMock());

  it('enregistre les jetons du flux implicite', async () => {
    await expect(
      restoreSessionFromUrl('workfloor://reset-password#access_token=a&refresh_token=r&type=recovery'),
    ).resolves.toBe(true);
    expect(supabase.auth.setSession).toHaveBeenCalledWith({ access_token: 'a', refresh_token: 'r' });
  });

  it('échange le code du flux PKCE', async () => {
    await expect(restoreSessionFromUrl('workfloor://reset-password?code=c0de')).resolves.toBe(true);
    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('c0de');
  });

  it("ignore une URL sans session", async () => {
    await expect(restoreSessionFromUrl('workfloor://reset-password')).resolves.toBe(false);
    expect(supabase.auth.setSession).not.toHaveBeenCalled();
  });

  it('convertit un lien expiré en code stable', async () => {
    await expect(
      restoreSessionFromUrl('workfloor://reset-password#error=access_denied&error_code=otp_expired'),
    ).rejects.toMatchObject({ code: 'AUTH_FAILED' });
  });
});

describe('signUp', () => {
  beforeEach(() => resetSupabaseMock());

  it('connecte directement, sans email de confirmation', async () => {
    await expect(signUp(' a@b.fr ', 'motdepasse')).resolves.toBeUndefined();
    expect(supabase.auth.signUp).toHaveBeenCalledWith({ email: 'a@b.fr', password: 'motdepasse' });
  });

  it('signale une configuration qui exige encore la confirmation', async () => {
    jest.mocked(supabase.auth.signUp).mockResolvedValueOnce({ data: { session: null }, error: null } as never);
    await expect(signUp('a@b.fr', 'motdepasse')).rejects.toMatchObject({ code: 'AUTH_EMAIL_NOT_CONFIRMED' });
  });

  it('traduit les erreurs Supabase en codes stables', async () => {
    jest
      .mocked(supabase.auth.signUp)
      .mockResolvedValueOnce({ data: { session: null }, error: { code: 'user_already_exists' } } as never);
    await expect(signUp('a@b.fr', 'motdepasse')).rejects.toMatchObject({ code: 'AUTH_USER_ALREADY_EXISTS' });
  });
});
