import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useResetPasswordForm } from '@hooks/useResetPasswordForm';

import { createQueryWrapper } from '../helpers/queryWrapper';
import { resetSupabaseMock, supabase } from '../mocks/supabase';

async function renderForm() {
  const { wrapper } = createQueryWrapper();
  return renderHook(() => useResetPasswordForm(), { wrapper });
}

describe('useResetPasswordForm', () => {
  beforeEach(() => resetSupabaseMock());

  it('signale deux mots de passe différents', async () => {
    const { result } = await renderForm();
    await act(async () => {
      result.current.setPassword('motdepasse');
      result.current.setConfirmation('autrechose');
    });
    await act(async () => result.current.submit());
    expect(result.current.issue).toEqual({ key: 'mismatch' });
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it('enregistre le nouveau mot de passe', async () => {
    const { result } = await renderForm();
    await act(async () => {
      result.current.setPassword('motdepasse');
      result.current.setConfirmation('motdepasse');
    });
    await act(async () => result.current.submit());

    await waitFor(() => expect(result.current.done).toBe(true));
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'motdepasse' });
  });
});
