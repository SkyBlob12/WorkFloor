import { useMemo } from 'react';

import { useInfiniteQuery } from '@tanstack/react-query';

import { isSupabaseConfigured } from '@lib/env';
import { queryKeys } from '@lib/queryKeys';
import { listCompanyReviews } from '@services/reviews';
import type { PublicReview, ReviewSort } from '@app-types/domain';

export interface CompanyReviewsResult {
  reviews: PublicReview[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function useCompanyReviews(companyId: string, sort: ReviewSort): CompanyReviewsResult {
  const query = useInfiniteQuery({
    queryKey: queryKeys.companyReviews(companyId, sort),
    queryFn: ({ pageParam }) => listCompanyReviews(companyId, sort, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: isSupabaseConfigured && Boolean(companyId),
  });

  const reviews = useMemo(() => query.data?.pages.flatMap((page) => page.reviews) ?? [], [query.data]);

  return {
    reviews,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => void query.fetchNextPage(),
  };
}
