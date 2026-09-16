import { renderHook, waitFor } from '@testing-library/react-native';
import * as Linking from 'expo-linking';

import { useRecoveryLinkSession } from '@hooks/useRecoveryLinkSession';
import { restoreSessionFromUrl } from '@services/account';

jest.mock('expo-linking', () => ({ useLinkingURL: jest.fn() }));
jest.mock('@services/account', () => ({ restoreSessionFromUrl: jest.fn(() => Promise.resolve(true)) }));

const linkingUrl = jest.mocked(Linking.useLinkingURL);
const restore = jest.mocked(restoreSessionFromUrl);

describe('useRecoveryLinkSession', () => {
  beforeEach(() => jest.clearAllMocks());

  it("n'attend rien sans lien d'authentification", async () => {
    linkingUrl.mockReturnValue('workfloor://reset-password');
    const { result } = await renderHook(() => useRecoveryLinkSession());
    expect(result.current).toBe(false);
    expect(restore).not.toHaveBeenCalled();
  });

  it('enregistre la session du lien une seule fois', async () => {
    const url = 'workfloor://reset-password#access_token=a&refresh_token=r';
    linkingUrl.mockReturnValue(url);
    const { result, rerender } = await renderHook(() => useRecoveryLinkSession());

    await waitFor(() => expect(result.current).toBe(false));
    await rerender({});
    expect(restore).toHaveBeenCalledTimes(1);
    expect(restore).toHaveBeenCalledWith(url);
  });

  it('rend la main même si le lien est expiré', async () => {
    restore.mockRejectedValueOnce(new Error('AUTH_FAILED'));
    linkingUrl.mockReturnValue('workfloor://reset-password?code=c0de');
    const { result } = await renderHook(() => useRecoveryLinkSession());
    await waitFor(() => expect(result.current).toBe(false));
  });
});
