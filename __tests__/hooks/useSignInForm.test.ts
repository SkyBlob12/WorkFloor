import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useSignInForm } from '@hooks/useSignInForm';
import { sendPasswordReset, signIn, signUp } from '@services/account';
import { ServiceError } from '@services/errors';
import { signInWithProvider } from '@services/oauth';

import { createQueryWrapper } from '../helpers/queryWrapper';

jest.mock('@services/account', () => ({
  signIn: jest.fn(() => Promise.resolve()),
  signUp: jest.fn(() => Promise.resolve()),
  sendPasswordReset: jest.fn(() => Promise.resolve()),
}));

jest.mock('@services/oauth', () => ({
  signInWithProvider: jest.fn(() => Promise.resolve(true)),
}));

async function renderForm(mode: 'signin' | 'signup' = 'signin') {
  const { wrapper } = createQueryWrapper();
  return renderHook(() => useSignInForm(mode), { wrapper });
}

describe('useSignInForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('bloque un email invalide sans appeler le service', async () => {
    const { result } = await renderForm();
    await act(async () => result.current.submit());
    expect(result.current.issue).toEqual({ key: 'invalidEmail' });
    expect(signIn).not.toHaveBeenCalled();
  });

  it('connecte puis régénère le jeton anti-robot', async () => {
    const { result } = await renderForm();
    await act(async () => {
      result.current.setEmail('a@b.fr');
      result.current.setPassword('motdepasse');
      result.current.onCaptchaToken('token');
    });
    await act(async () => result.current.submit());

    await waitFor(() => expect(result.current.captchaKey).toBe(1));
    expect(signIn).toHaveBeenCalledWith('a@b.fr', 'motdepasse', 'token');
    expect(result.current.issue).toBeNull();
  });

  it('crée le compte sans étape de confirmation', async () => {
    const { result } = await renderForm('signup');
    await act(async () => {
      result.current.setEmail('a@b.fr');
      result.current.setPassword('motdepasse');
    });
    await act(async () => result.current.submit());

    await waitFor(() => expect(result.current.captchaKey).toBe(1));
    expect(signUp).toHaveBeenCalledWith('a@b.fr', 'motdepasse', null);
    expect(result.current.notice).toBeNull();
    expect(result.current.mode).toBe('signup');
  });

  it('lance la connexion Google et expose le fournisseur en cours', async () => {
    let resolve: (value: boolean) => void = () => undefined;
    jest.mocked(signInWithProvider).mockImplementationOnce(
      () => new Promise<boolean>((done) => (resolve = done)),
    );
    const { result } = await renderForm();

    await act(async () => result.current.continueWith('google'));
    await waitFor(() => expect(result.current.providerPending).toBe('google'));
    expect(signInWithProvider).toHaveBeenCalledWith('google');

    await act(async () => resolve(true));
    await waitFor(() => expect(result.current.providerPending).toBeNull());
  });

  it('expose l’erreur du service et la réinitialise au changement de mode', async () => {
    jest.mocked(sendPasswordReset).mockRejectedValueOnce(new ServiceError('AUTH_RATE_LIMITED'));
    const { result } = await renderForm();
    await act(async () => {
      result.current.switchMode('reset');
      result.current.setEmail('a@b.fr');
    });
    await act(async () => result.current.submit());

    await waitFor(() => expect(result.current.serviceError).toMatchObject({ code: 'AUTH_RATE_LIMITED' }));
    await act(async () => result.current.switchMode('signin'));
    await waitFor(() => expect(result.current.serviceError).toBeNull());
  });
});
