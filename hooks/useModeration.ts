import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import { queryKeys } from '@lib/queryKeys';
import { checkIsModerator, listModerationQueue, moderateReview } from '@services/moderation';
import type { ModerationDecision, ModerationItem } from '@app-types/domain';

import { useAuthUser } from './useAuthUser';

export interface ModerateReviewVariables {
  reviewId: string;
  decision: ModerationDecision;
}

export interface ModeratorStatus {
  isModerator: boolean;
  isLoading: boolean;
}

/** `isModerator` reste faux tant que la réponse n'est pas arrivée : l'accès n'apparaît jamais par défaut. */
export function useModeratorStatus(): ModeratorStatus {
  const user = useAuthUser();
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.isModerator(),
    queryFn: checkIsModerator,
    enabled: Boolean(user),
    staleTime: Infinity,
  });
  return { isModerator: Boolean(user) && data === true, isLoading: Boolean(user) && isLoading };
}

export function useModerationQueue(enabled: boolean): UseQueryResult<ModerationItem[]> {
  return useQuery({ queryKey: queryKeys.moderationQueue(), queryFn: listModerationQueue, enabled });
}

export function useModerateReview(): UseMutationResult<void, Error, ModerateReviewVariables> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, decision }: ModerateReviewVariables) => moderateReview(reviewId, decision),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.moderationQueue() }),
        queryClient.invalidateQueries({ queryKey: ['reviews'] }),
        queryClient.invalidateQueries({ queryKey: ['companies'] }),
      ]),
  });
}
