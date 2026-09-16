import type { ReviewSort } from '@app-types/domain';

/** Clés TanStack Query. Tout ce qui dépend de l'utilisateur connecté vit sous `['me']`. */
export const queryKeys = {
  companySearch: (term: string) => ['companies', 'search', term] as const,
  companyDirectory: () => ['companies', 'directory'] as const,
  sectorPhotos: () => ['sectors', 'photos'] as const,
  company: (id: string) => ['companies', 'detail', id] as const,
  sireneSearch: (term: string) => ['sirene', term] as const,
  companyReviews: (companyId: string, sort: ReviewSort) => ['reviews', companyId, sort] as const,
  companyReviewsAll: (companyId: string) => ['reviews', companyId] as const,
  me: () => ['me'] as const,
  myReview: (companyId: string) => ['me', 'review', companyId] as const,
  myReviews: () => ['me', 'reviews'] as const,
  blockedAuthors: () => ['me', 'blocked-authors'] as const,
};
