import {
  canContinue,
  EMPTY_ANSWERS,
  EMPTY_STORED,
  parseStoredOnboarding,
  ratingFeedback,
  sortCriteriaByPriority,
  togglePriority,
} from '@utils/onboarding';

describe('canContinue', () => {
  it('exige une interaction à chaque étape sauf la dernière', () => {
    expect(canContinue('profile', EMPTY_ANSWERS)).toBe(false);
    expect(canContinue('profile', { ...EMPTY_ANSWERS, profile: 'employee' })).toBe(true);
    expect(canContinue('priorities', { ...EMPTY_ANSWERS, priorities: ['salary'] })).toBe(true);
    expect(canContinue('rating', { ...EMPTY_ANSWERS, demoRating: 2 })).toBe(true);
    expect(canContinue('anonymity', EMPTY_ANSWERS)).toBe(false);
    expect(canContinue('auth', EMPTY_ANSWERS)).toBe(true);
  });
});

describe('togglePriority', () => {
  it('ajoute, retire et plafonne la sélection', () => {
    expect(togglePriority([], 'salary')).toEqual(['salary']);
    expect(togglePriority(['salary', 'culture'], 'salary')).toEqual(['culture']);
    expect(togglePriority(['salary', 'culture', 'benefits'], 'management')).toEqual(['salary', 'culture', 'benefits']);
  });
});

describe('sortCriteriaByPriority', () => {
  it('met les priorités en tête dans l’ordre choisi', () => {
    const criteria = ['culture', 'salary', 'benefits', 'management'] as const;
    expect(sortCriteriaByPriority(criteria, ['management', 'salary'])).toEqual(['management', 'salary', 'culture', 'benefits']);
    expect(sortCriteriaByPriority(criteria, [])).toEqual([...criteria]);
  });
});

describe('ratingFeedback', () => {
  it('classe la note d’essai', () => {
    expect(ratingFeedback(1)).toBe('low');
    expect(ratingFeedback(3)).toBe('mid');
    expect(ratingFeedback(5)).toBe('high');
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
