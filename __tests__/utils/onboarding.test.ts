import { EMPTY_STORED, parseStoredOnboarding, sortCriteriaByPriority } from '@utils/onboarding';

describe('sortCriteriaByPriority', () => {
  it('met les priorités en tête dans l’ordre choisi', () => {
    const criteria = ['culture', 'salary', 'benefits', 'management'] as const;
    expect(sortCriteriaByPriority(criteria, ['management', 'salary'])).toEqual(['management', 'salary', 'culture', 'benefits']);
    expect(sortCriteriaByPriority(criteria, [])).toEqual([...criteria]);
  });
});

describe('parseStoredOnboarding', () => {
  it('relit un état valide', () => {
    const raw = JSON.stringify({ completed: true, profile: 'jobSeeker', priorities: ['salary', 'nope'] });
    expect(parseStoredOnboarding(raw)).toEqual({ completed: true, profile: 'jobSeeker', priorities: ['salary'] });
  });

  it('retombe sur l’état vierge si le stockage est vide ou corrompu', () => {
    expect(parseStoredOnboarding(null)).toEqual(EMPTY_STORED);
    expect(parseStoredOnboarding('{pas du json')).toEqual(EMPTY_STORED);
    expect(parseStoredOnboarding('[1,2]')).toEqual(EMPTY_STORED);
  });
});
