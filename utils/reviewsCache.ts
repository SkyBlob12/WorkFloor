import type { InfiniteData } from '@tanstack/react-query';

import type { ReviewsPage } from '@app-types/domain';

/** Applique un vote "utile" dans le cache des avis (mise à jour optimiste), sans muter l'original. */
export function applyHelpfulVote(
  data: InfiniteData<ReviewsPage>,
  reviewId: string,
  voted: boolean,
): InfiniteData<ReviewsPage> {
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      reviews: page.reviews.map((review) =>
        review.id === reviewId && review.voted_helpful !== voted
          ? { ...review, voted_helpful: voted, helpful_count: Math.max(0, review.helpful_count + (voted ? 1 : -1)) }
          : review,
      ),
    })),
  };
}
