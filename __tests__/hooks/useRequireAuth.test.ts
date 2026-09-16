import type { Session } from '@supabase/supabase-js';
import { act, renderHook } from '@testing-library/react-native';

import { useRequireAuth } from '@hooks/useRequireAuth';
import { useAuthStore } from '@stores/authStore';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush }) }));

describe('useRequireAuth', () => {
  beforeEach(() => {
    mockPush.mockClear();
    useAuthStore.setState({ session: null, initializing: false });
  });

  it('redirige vers la connexion quand personne n’est connecté', async () => {
    const { result } = await renderHook(() => useRequireAuth());
    let allowed = true;
    await act(async () => {
      allowed = result.current();
    });
    expect(allowed).toBe(false);
    expect(mockPush).toHaveBeenCalledWith('/sign-in');
  });

  it('laisse passer un utilisateur connecté', async () => {
    useAuthStore.setState({ session: { user: { id: 'user-1' } } as unknown as Session });
    const { result } = await renderHook(() => useRequireAuth());
    expect(result.current()).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
