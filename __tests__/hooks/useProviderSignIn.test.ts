import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useProviderSignIn } from '@hooks/useProviderSignIn';
import { ServiceError } from '@services/errors';
import { signInWithProvider } from '@services/oauth';

import { createQueryWrapper } from '../helpers/queryWrapper';

jest.mock('@services/oauth', () => ({ signInWithProvider: jest.fn(() => Promise.resolve(true)) }));

async function renderProvider() {
  const { wrapper } = createQueryWrapper();
  return renderHook(() => useProviderSignIn(), { wrapper });
}

describe('useProviderSignIn', () => {
  beforeEach(() => jest.clearAllMocks());

  it('expose le fournisseur en cours puis le libère', async () => {
    let finish: (value: boolean) => void = () => undefined;
    jest.mocked(signInWithProvider).mockImplementationOnce(() => new Promise<boolean>((done) => (finish = done)));
    const { result } = await renderProvider();

    await act(async () => result.current.continueWith('apple'));
    await waitFor(() => expect(result.current.pending).toBe('apple'));
    expect(signInWithProvider).toHaveBeenCalledWith('apple');

    await act(async () => finish(true));
    await waitFor(() => expect(result.current.pending).toBeNull());
  });

  it('remonte l’erreur puis l’efface au reset', async () => {
    jest.mocked(signInWithProvider).mockRejectedValueOnce(new ServiceError('AUTH_FAILED'));
    const { result } = await renderProvider();

    await act(async () => result.current.continueWith('google'));
    await waitFor(() => expect(result.current.error).toMatchObject({ code: 'AUTH_FAILED' }));
    await act(async () => result.current.reset());
    await waitFor(() => expect(result.current.error).toBeNull());
  });
});
