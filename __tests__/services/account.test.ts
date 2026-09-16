import { signUp } from '@services/account';

import { resetSupabaseMock, supabase } from '../mocks/supabase';

describe('signUp', () => {
  beforeEach(() => resetSupabaseMock());

  it('connecte directement, sans email de confirmation', async () => {
    await expect(signUp(' a@b.fr ', 'motdepasse', null)).resolves.toBeUndefined();
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.fr',
      password: 'motdepasse',
      options: { captchaToken: undefined },
    });
  });

  it('signale une configuration qui exige encore la confirmation', async () => {
    jest.mocked(supabase.auth.signUp).mockResolvedValueOnce({ data: { session: null }, error: null } as never);
    await expect(signUp('a@b.fr', 'motdepasse', null)).rejects.toMatchObject({ code: 'AUTH_EMAIL_NOT_CONFIRMED' });
  });

  it('traduit les erreurs Supabase en codes stables', async () => {
    jest
      .mocked(supabase.auth.signUp)
      .mockResolvedValueOnce({ data: { session: null }, error: { code: 'user_already_exists' } } as never);
    await expect(signUp('a@b.fr', 'motdepasse', null)).rejects.toMatchObject({ code: 'AUTH_USER_ALREADY_EXISTS' });
  });
});
