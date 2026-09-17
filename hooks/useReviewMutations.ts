import {
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryKey,
  type UseMutationResult,
} from '@tanstack/react-query';

import { queryKeys } from '@lib/queryKeys';
import { blockReviewAuthor } from '@services/moderation';
import { deleteMyReview, setHelpfulVote, submitReview, type SubmitReviewInput } from '@services/reviews';
import { applyHelpfulVote } from '@utils/reviewsCache';
import type { ReviewsPage, SubmitReviewResult } from '@app-types/domain';

export interface HelpfulVoteVariables {
  reviewId: string;
  voted: boolean;
}

interface HelpfulVoteContext {
  snapshot: [QueryKey, InfiniteData<ReviewsPage> | undefined][];
}

/** Vote "utile" avec mise à jour optimiste, annulée en cas d'échec. */
export function useHelpfulVote(
  companyId: string,
): UseMutationResult<void, Error, HelpfulVoteVariables, HelpfulVoteContext> {
  const queryClient = useQueryClient();
  const key = queryKeys.companyReviewsAll(companyId);
  return useMutation({
    mutationFn: ({ reviewId, voted }) => setHelpfulVote(reviewId, voted),
    onMutate: async ({ reviewId, voted }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const snapshot = queryClient.getQueriesData<InfiniteData<ReviewsPage>>({ queryKey: key });
      queryClient.setQueriesData<InfiniteData<ReviewsPage>>({ queryKey: key }, (data) =>
        data ? applyHelpfulVote(data, reviewId, voted) : data,
      );
      return { snapshot };
    },
    onError: (_error, _variables, context) => {
      context?.snapshot.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
    },
  });
}

export function useSubmitReview(): UseMutationResult<SubmitReviewResult, Error, SubmitReviewInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitReview,
    meta: { inlineError: true },
    onSuccess: (_data, { companyId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.companyReviewsAll(companyId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.company(companyId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.me() }),
      ]),
  });
}

export function useDeleteReview(companyId: string): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMyReview,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.companyReviewsAll(companyId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.company(companyId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.me() }),
      ]),
  });
}

export function useBlockAuthor(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: blockReviewAuthor,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['reviews'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.blockedAuthors() }),
      ]),
  });
}
