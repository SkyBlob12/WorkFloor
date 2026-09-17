import type { OwnReview, ReviewStatus } from '@app-types/domain';
import { authProviderOf, summarizeMyReviews } from '@utils/profile';

const review = (status: ReviewStatus, helpful_count: number): OwnReview =>
  ({ id: `${status}-${helpful_count}`, status, helpful_count }) as OwnReview;

describe('authProviderOf', () => {
  it('lit le fournisseur connu dans app_metadata', () => {
    expect(authProviderOf({ provider: 'google', providers: ['google'] })).toBe('google');
    expect(authProviderOf({ provider: 'email' })).toBe('email');
  });

  it('renvoie null pour une valeur absente ou inconnue', () => {
    expect(authProviderOf({ provider: 'github' })).toBeNull();
    expect(authProviderOf({})).toBeNull();
    expect(authProviderOf(undefined)).toBeNull();
  });
});

describe('summarizeMyReviews', () => {
  it('compte les avis publiés, en attente et les votes utiles des avis publiés', () => {
    const summary = summarizeMyReviews([
      review('published', 3),
      review('published', 2),
      review('pending', 0),
      review('hidden', 5),
      review('removed', 1),
    ]);
    expect(summary).toEqual({ published: 2, pending: 1, helpful: 5 });
  });

  it('renvoie des zéros sans données', () => {
    expect(summarizeMyReviews(undefined)).toEqual({ published: 0, pending: 0, helpful: 0 });
  });
});
