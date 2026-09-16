import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { queryKeys } from '@lib/queryKeys';
import { getMyReviewForCompany, listMyReviews } from '@services/reviews';
import type { OwnReview } from '@app-types/domain';

import { useAuthUser } from './useAuthUser';

/** Avis de l'utilisateur connecté sur une entreprise (null si aucun ou déconnecté). */
export function useMyReview(companyId: string | undefined): UseQueryResult<OwnReview | null> {
  const user = useAuthUser();
  return useQuery({
    queryKey: queryKeys.myReview(companyId ?? ''),
    queryFn: () => getMyReviewForCompany(companyId ?? ''),
    enabled: Boolean(user && companyId),
  });
}

export function useMyReviews(): UseQueryResult<OwnReview[]> {
  const user = useAuthUser();
  return useQuery({ queryKey: queryKeys.myReviews(), queryFn: listMyReviews, enabled: Boolean(user) });
}
