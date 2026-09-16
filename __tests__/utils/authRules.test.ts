import { validateAuthForm, validateNewPassword } from '@utils/authRules';

const base = { mode: 'signin' as const, email: 'a@b.fr', password: 'motdepasse' };

describe('validateAuthForm', () => {
  it('refuse un email invalide', () => {
    expect(validateAuthForm({ ...base, email: 'pas-un-email' })).toEqual({ key: 'invalidEmail' });
  });

  it('exige un mot de passe assez long sauf en réinitialisation', () => {
    expect(validateAuthForm({ ...base, password: 'court' })).toEqual({ key: 'passwordTooShort', params: { count: 8 } });
    expect(validateAuthForm({ ...base, mode: 'reset', password: '' })).toBeNull();
  });

  it('accepte une inscription complète', () => {
    expect(validateAuthForm({ ...base, mode: 'signup' })).toBeNull();
  });
});

describe('validateNewPassword', () => {
  it('vérifie longueur puis concordance', () => {
    expect(validateNewPassword('court', 'court')).toEqual({ key: 'tooShort', params: { count: 8 } });
    expect(validateNewPassword('motdepasse', 'autrechose')).toEqual({ key: 'mismatch' });
    expect(validateNewPassword('motdepasse', 'motdepasse')).toBeNull();
  });
});
