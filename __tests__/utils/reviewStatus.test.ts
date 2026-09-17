import { reviewStatusKey } from '@utils/reviewStatus';

describe('reviewStatusKey', () => {
  it('annonce une publication programmée pour un compte récent', () => {
    expect(reviewStatusKey({ status: 'pending', hold_reason: 'new_account' })).toBe('scheduled');
  });

  it('garde la relecture pour une entreprise surveillée ou la modération', () => {
    expect(reviewStatusKey({ status: 'pending', hold_reason: 'company_surge' })).toBe('pending');
    expect(reviewStatusKey({ status: 'pending', hold_reason: null })).toBe('pending');
  });

  it('renvoie le statut tel quel hors attente', () => {
    expect(reviewStatusKey({ status: 'published', hold_reason: null })).toBe('published');
    expect(reviewStatusKey({ status: 'removed', hold_reason: null })).toBe('removed');
  });
});
