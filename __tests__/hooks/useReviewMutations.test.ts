import type { InfiniteData } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';

import { useHelpfulVote } from '@hooks/useReviewMutations';
import { queryKeys } from '@lib/queryKeys';
import type { PublicReview, ReviewsPage } from '@app-types/domain';

import { createQueryWrapper } from '../helpers/queryWrapper';
import { mockSupabaseResult, resetSupabaseMock } from '../mocks/supabase';

const key = queryKeys.companyReviews('company-1', 'recent');

function seed(): InfiniteData<ReviewsPage> {
  const review = { id: 'r1', voted_helpful: false, helpful_count: 1 } as PublicReview;
  return { pages: [{ reviews: [review], nextOffset: null }], pageParams: [0] };
}

describe('useHelpfulVote', () => {
  beforeEach(() => resetSupabaseMock());

  it('met à jour le cache avant la réponse du serveur', async () => {
    const { client, wrapper } = createQueryWrapper();
    client.setQueryData(key, seed());
    const { result } = await renderHook(() => useHelpfulVote('company-1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ reviewId: 'r1', voted: true });
    });

    const data = client.getQueryData<InfiniteData<ReviewsPage>>(key);
    expect(data?.pages[0].reviews[0]).toMatchObject({ voted_helpful: true, helpful_count: 2 });
  });

  it('restaure le cache si le vote échoue', async () => {
    mockSupabaseResult({ error: { code: '42501' } });
    const { client, wrapper } = createQueryWrapper();
    client.setQueryData(key, seed());
    const { result } = await renderHook(() => useHelpfulVote('company-1'), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync({ reviewId: 'r1', voted: true })).rejects.toMatchObject({
        code: 'VOTE_FAILED',
      });
    });

    const data = client.getQueryData<InfiniteData<ReviewsPage>>(key);
    expect(data?.pages[0].reviews[0]).toMatchObject({ voted_helpful: false, helpful_count: 1 });
  });
});
