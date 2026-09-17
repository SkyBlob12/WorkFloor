import type { HoldReason, ReviewStatus } from '@app-types/domain';

/** Clé de `reviews:status.*` : `scheduled` pour un avis publié automatiquement après le délai des comptes récents. */
export type ReviewStatusKey = ReviewStatus | 'scheduled';

export function reviewStatusKey(review: { status: ReviewStatus; hold_reason: HoldReason | null }): ReviewStatusKey {
  return review.status === 'pending' && review.hold_reason === 'new_account' ? 'scheduled' : review.status;
}
