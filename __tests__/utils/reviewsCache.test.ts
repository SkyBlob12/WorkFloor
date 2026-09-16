import type { InfiniteData } from '@tanstack/react-query';

import { applyHelpfulVote } from '@utils/reviewsCache';
import type { PublicReview, ReviewsPage } from '@app-types/domain';

function page(reviews: Partial<PublicReview>[]): InfiniteData<ReviewsPage> {
  return {
    pages: [{ reviews: reviews as PublicReview[], nextOffset: null }],
    pageParams: [0],
  };
}

describe('applyHelpfulVote', () => {
  it('ajoute un vote sans muter les données d’origine', () => {
    const data = page([{ id: 'a', voted_helpful: false, helpful_count: 2 }]);
    const next = applyHelpfulVote(data, 'a', true);
    expect(next.pages[0].reviews[0]).toMatchObject({ voted_helpful: true, helpful_count: 3 });
    expect(data.pages[0].reviews[0]).toMatchObject({ voted_helpful: false, helpful_count: 2 });
  });

  it('ne descend jamais sous zéro et ignore les votes déjà appliqués', () => {
    const data = page([
      { id: 'a', voted_helpful: true, helpful_count: 0 },
      { id: 'b', voted_helpful: true, helpful_count: 5 },
    ]);
    expect(applyHelpfulVote(data, 'a', false).pages[0].reviews[0].helpful_count).toBe(0);
    expect(applyHelpfulVote(data, 'b', true).pages[0].reviews[1].helpful_count).toBe(5);
  });
});
