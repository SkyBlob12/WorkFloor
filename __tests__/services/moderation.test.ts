import { mockSupabaseResult, resetSupabaseMock, supabase } from '../mocks/supabase';

import { toAuthError } from '@services/account';
import { countBlockedAuthors, reportReview } from '@services/moderation';

describe('services de modération', () => {
  beforeEach(() => resetSupabaseMock());

  it('traduit un double signalement en ALREADY_REPORTED', async () => {
    mockSupabaseResult({ error: { code: '23505' } });
    await expect(reportReview('r1', 'spam', '')).rejects.toMatchObject({ code: 'ALREADY_REPORTED' });
  });

  it('renvoie REPORT_FAILED pour toute autre erreur', async () => {
    mockSupabaseResult({ error: { code: '42501' } });
    await expect(reportReview('r1', 'spam', 'détail')).rejects.toMatchObject({ code: 'REPORT_FAILED' });
  });

  it('envoie les détails nettoyés', async () => {
    await reportReview('r1', 'other', '   ');
    const builder = supabase.from.mock.results[0].value as { insert: jest.Mock };
    expect(builder.insert).toHaveBeenCalledWith({ review_id: 'r1', reason: 'other', details: null });
  });

  it('compte les auteurs masqués', async () => {
    mockSupabaseResult({ count: 3 });
    await expect(countBlockedAuthors()).resolves.toBe(3);
  });
});

describe('toAuthError', () => {
  it('mappe les codes Supabase Auth et retombe sur AUTH_FAILED', () => {
    expect(toAuthError({ code: 'invalid_credentials' }).code).toBe('AUTH_INVALID_CREDENTIALS');
    expect(toAuthError({ code: 'something_new' }).code).toBe('AUTH_FAILED');
    expect(toAuthError({}).code).toBe('AUTH_FAILED');
  });
});
