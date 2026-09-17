import { mockSupabaseResult, resetSupabaseMock, supabase } from '../mocks/supabase';

import { toAuthError } from '@services/account';
import {
  checkIsModerator,
  countBlockedAuthors,
  listModerationQueue,
  moderateReview,
  reportReview,
} from '@services/moderation';

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

  it('ne demande jamais la colonne de l’auteur bloqué', async () => {
    await countBlockedAuthors();
    const builder = supabase.from.mock.results[0].value as { select: jest.Mock };
    expect(builder.select).toHaveBeenCalledWith('blocker_id', { count: 'exact', head: true });
  });
});

describe('services de l’écran de modération', () => {
  beforeEach(() => resetSupabaseMock());

  it('ne reconnaît un modérateur que sur une réponse true', async () => {
    mockSupabaseResult({ data: true });
    await expect(checkIsModerator()).resolves.toBe(true);
    mockSupabaseResult({ data: null, error: { code: '42501' } });
    await expect(checkIsModerator()).resolves.toBe(false);
  });

  it('lit la file et traduit un refus en FORBIDDEN', async () => {
    mockSupabaseResult({ data: [{ review_id: 'r1' }] });
    await expect(listModerationQueue()).resolves.toEqual([{ review_id: 'r1' }]);
    mockSupabaseResult({ error: { code: '42501' } });
    await expect(listModerationQueue()).rejects.toMatchObject({ code: 'FORBIDDEN' });
    mockSupabaseResult({ error: { code: '500' } });
    await expect(listModerationQueue()).rejects.toMatchObject({ code: 'LOAD_FAILED' });
  });

  it('envoie la décision et traduit les erreurs', async () => {
    await moderateReview('r1', 'hide');
    expect(supabase.rpc).toHaveBeenCalledWith('moderate_review', { p_review_id: 'r1', p_decision: 'hide' });
    mockSupabaseResult({ error: { code: 'P0002' } });
    await expect(moderateReview('r1', 'keep')).rejects.toMatchObject({ code: 'REVIEW_NOT_FOUND' });
    mockSupabaseResult({ error: { code: '42501' } });
    await expect(moderateReview('r1', 'keep')).rejects.toMatchObject({ code: 'FORBIDDEN' });
    mockSupabaseResult({ error: { code: '22023' } });
    await expect(moderateReview('r1', 'remove')).rejects.toMatchObject({ code: 'MODERATION_FAILED' });
  });
});

describe('toAuthError', () => {
  it('mappe les codes Supabase Auth et retombe sur AUTH_FAILED', () => {
    expect(toAuthError({ code: 'invalid_credentials' }).code).toBe('AUTH_INVALID_CREDENTIALS');
    expect(toAuthError({ code: 'something_new' }).code).toBe('AUTH_FAILED');
    expect(toAuthError({}).code).toBe('AUTH_FAILED');
  });
});
