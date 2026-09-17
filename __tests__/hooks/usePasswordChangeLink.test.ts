import type { Session } from '@supabase/supabase-js';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { usePasswordChangeLink } from '@hooks/usePasswordChangeLink';
import { useAuthStore } from '@stores/authStore';

import { createQueryWrapper } from '../helpers/queryWrapper';
import { resetSupabaseMock, supabase } from '../mocks/supabase';

jest.mock('expo-linking', () => ({ createURL: jest.fn((path: string) => `workfloor://${path}`) }));

describe('usePasswordChangeLink', () => {
  beforeEach(() => {
    resetSupabaseMock();
    const session = { user: { id: 'user-1', email: 'moi@exemple.fr' } } as Session;
    useAuthStore.setState({ session, initializing: false });
  });

  it('envoie le lien de réinitialisation à l’adresse du compte', async () => {
    const { wrapper } = createQueryWrapper();
    const { result } = await renderHook(() => usePasswordChangeLink(), { wrapper });

    await act(async () => result.current.mutate());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('moi@exemple.fr', {
      redirectTo: 'workfloor://reset-password',
    });
  });
});
