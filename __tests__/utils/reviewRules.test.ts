import {
  containsPersonalData,
  emptyDraft,
  hasErrors,
  parseSalaryInput,
  pickDraft,
  prepareSubmission,
  validateDraft,
} from '@utils/reviewRules';
import type { OwnReview, ReviewDraft } from '@app-types/domain';

function validDraft(overrides: Partial<ReviewDraft> = {}): ReviewDraft {
  return {
    ...emptyDraft(),
    rating_overall: 4,
    title: 'Bonne équipe',
    pros: 'Des collègues bienveillants et des missions variées.',
    cons: 'Des process parfois lourds et peu de télétravail.',
    ...overrides,
  };
}

describe('validateDraft', () => {
  it('signale les champs obligatoires d’un brouillon vide', () => {
    const errors = validateDraft(emptyDraft());
    expect(errors.rating_overall).toEqual({ key: 'ratingRequired' });
    expect(errors.title).toEqual({ key: 'required' });
    expect(errors.pros).toEqual({ key: 'required' });
  });

  it('accepte un avis complet', () => {
    expect(hasErrors(validateDraft(validDraft()))).toBe(false);
  });

  it('renvoie la longueur minimale en paramètre', () => {
    expect(validateDraft(validDraft({ pros: 'Trop court' })).pros).toEqual({ key: 'tooShort', params: { count: 20 } });
  });

  it('renvoie la longueur maximale en paramètre', () => {
    expect(validateDraft(validDraft({ title: 'x'.repeat(121) })).title).toEqual({
      key: 'tooLong',
      params: { count: 120 },
    });
  });

  it('refuse les données personnelles', () => {
    const errors = validateDraft(validDraft({ cons: 'Écrivez-moi à jean.dupont@exemple.fr pour en parler.' }));
    expect(errors.pros).toEqual({ key: 'personalData' });
  });

  it('exige une période quand un salaire est saisi', () => {
    expect(validateDraft(validDraft({ salary_amount: 40000 })).salary_period).toEqual({
      key: 'salaryPeriodRequired',
    });
  });
});

describe('containsPersonalData', () => {
  it.each(['06 12 34 56 78', '+33 6 12 34 56 78', 'contact@societe.com'])('détecte %s', (text) => {
    expect(containsPersonalData(text)).toBe(true);
  });

  it('ignore un texte factuel', () => {
    expect(containsPersonalData('Une équipe de 12 personnes, 35 heures par semaine.')).toBe(false);
  });
});

describe('parseSalaryInput', () => {
  it.each([
    ['', null],
    ['42 000', 42000],
    ['12,5', 13],
    ['abc', 'invalid'],
    ['-10', 'invalid'],
  ])('« %s » donne %p', (input, expected) => {
    expect(parseSalaryInput(input)).toBe(expected);
  });
});

describe('prepareSubmission', () => {
  it('retire la période si aucun salaire n’est saisi', () => {
    const { candidate } = prepareSubmission(validDraft({ salary_period: 'year' }), '');
    expect(candidate.salary_amount).toBeNull();
    expect(candidate.salary_period).toBeNull();
  });

  it('signale un salaire invalide', () => {
    expect(prepareSubmission(validDraft(), 'beaucoup').errors.salary_amount).toEqual({ key: 'salaryInvalid' });
  });
});

describe('pickDraft', () => {
  it('ne garde que les champs éditables', () => {
    const own = { ...validDraft(), id: 'r1', status: 'published', helpful_count: 3 } as unknown as OwnReview;
    const draft = pickDraft(own);
    expect(draft).toEqual(validDraft());
    expect('status' in draft).toBe(false);
  });
});
