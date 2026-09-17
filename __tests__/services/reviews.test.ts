import { getMyReviewForCompany, listMyReviews } from '@services/reviews';

import { mockSupabaseResult, resetSupabaseMock, supabase } from '../mocks/supabase';

describe('avis de l’utilisateur', () => {
  beforeEach(() => resetSupabaseMock());

  it('ne lit pas company_sites quand l’avis n’a pas de site', async () => {
    mockSupabaseResult({ data: { id: 'r1', site_id: null } });
    await expect(getMyReviewForCompany('c1')).resolves.toEqual({ id: 'r1', site_id: null, site: null });
    expect(supabase.from).toHaveBeenCalledTimes(1);
    expect(supabase.from).toHaveBeenCalledWith('reviews');
  });

  it('lit les sites séparément, sans jointure', async () => {
    mockSupabaseResult({ data: [{ id: 'r1', site_id: 's1' }] });
    await listMyReviews();
    expect(supabase.from).toHaveBeenLastCalledWith('company_sites');
    const reviewsQuery = jest.mocked(supabase.from).mock.results[0].value as { select: jest.Mock };
    expect(reviewsQuery.select.mock.calls[0][0]).not.toContain('company_sites');
  });

  it('renvoie null sans avis', async () => {
    mockSupabaseResult({ data: null });
    await expect(getMyReviewForCompany('c1')).resolves.toBeNull();
  });

  it('convertit une erreur en code stable', async () => {
    mockSupabaseResult({ error: { code: '42501' } });
    await expect(listMyReviews()).rejects.toMatchObject({ code: 'LOAD_FAILED' });
  });
});
