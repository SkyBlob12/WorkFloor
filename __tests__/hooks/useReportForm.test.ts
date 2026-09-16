import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useReportForm } from '@hooks/useReportForm';

import { createQueryWrapper } from '../helpers/queryWrapper';
import { mockSupabaseResult, resetSupabaseMock, supabase } from '../mocks/supabase';

async function renderForm() {
  const { wrapper } = createQueryWrapper();
  return renderHook(() => useReportForm('review-1'), { wrapper });
}

describe('useReportForm', () => {
  beforeEach(() => resetSupabaseMock());

  it('exige un motif, puis des détails pour « autre »', async () => {
    const { result } = await renderForm();
    await act(async () => result.current.submit());
    expect(result.current.issue).toBe('reasonRequired');

    await act(async () => result.current.setReason('other'));
    await act(async () => result.current.submit());
    expect(result.current.issue).toBe('detailsRequired');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('considère un double signalement comme abouti', async () => {
    mockSupabaseResult({ error: { code: '23505' } });
    const { result } = await renderForm();
    await act(async () => result.current.setReason('spam'));
    await act(async () => result.current.submit());

    await waitFor(() => expect(result.current.done).toBe(true));
    expect(result.current.serviceError).toBeNull();
  });

  it('expose une autre erreur sans marquer le signalement comme envoyé', async () => {
    mockSupabaseResult({ error: { code: '42501' } });
    const { result } = await renderForm();
    await act(async () => result.current.setReason('hate'));
    await act(async () => result.current.submit());

    await waitFor(() => expect(result.current.serviceError).toMatchObject({ code: 'REPORT_FAILED' }));
    expect(result.current.done).toBe(false);
  });

  it('masque aussi l’auteur sur demande', async () => {
    const { result } = await renderForm();
    await act(async () => result.current.blockAuthor());
    await waitFor(() => expect(result.current.blocked).toBe(true));
    expect(supabase.rpc).toHaveBeenCalledWith('block_review_author', { p_review_id: 'review-1' });
  });
});
