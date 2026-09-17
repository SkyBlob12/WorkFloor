import { REVIEW_LIMITS } from '@constants/reviews';
import type { ReviewDraft } from '@app-types/domain';

/**
 * Règles de validation d'un avis. Fonctions pures : elles renvoient des descripteurs
 * `{ key, params }` que l'écran traduit via `reviews:formError.<key>`.
 */
export type ReviewFormErrorKey =
  | 'required'
  | 'tooShort'
  | 'tooLong'
  | 'ratingRequired'
  | 'salaryInvalid'
  | 'salaryPeriodRequired'
  | 'personalData'
  | 'attestationRequired';

export interface ErrorDescriptor {
  key: ReviewFormErrorKey;
  params?: { count: number };
}

export type DraftErrors = Partial<Record<keyof ReviewDraft, ErrorDescriptor>>;

const EMAIL_RE = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[a-z]{2,}/iu;
const PHONE_RE = /(?:\+33|0033|\b0)\s?[1-9](?:[\s.-]?\d{2}){4}\b/;

export function emptyDraft(): ReviewDraft {
  return {
    rating_overall: 0,
    rating_culture: null,
    rating_salary: null,
    rating_benefits: null,
    rating_management: null,
    rating_work_life: null,
    recommends: null,
    title: '',
    pros: '',
    cons: '',
    benefits: null,
    job_title: null,
    employment_status: 'current',
    contract_type: null,
    salary_amount: null,
    salary_period: null,
  };
}

/** Extrait les champs éditables d'un avis existant (la ligne SQL contient aussi statut, compteurs…). */
export function pickDraft(source: ReviewDraft): ReviewDraft {
  const draft = emptyDraft();
  const keys = Object.keys(draft) as (keyof ReviewDraft)[];
  return Object.fromEntries(keys.map((key) => [key, source[key]])) as unknown as ReviewDraft;
}

export function containsPersonalData(text: string): boolean {
  return EMAIL_RE.test(text) || PHONE_RE.test(text);
}

/** `null` si vide, `'invalid'` si non numérique ou négatif, sinon un entier. */
export function parseSalaryInput(raw: string): number | null | 'invalid' {
  const normalized = raw.replace(/\s/g, '').replace(',', '.');
  if (!normalized) return null;
  const value = Math.round(Number(normalized));
  return Number.isFinite(value) && value > 0 ? value : 'invalid';
}

function checkLength(
  value: string | null,
  field: keyof typeof REVIEW_LIMITS,
  required: boolean,
): ErrorDescriptor | undefined {
  const text = value?.trim() ?? '';
  const { min, max } = REVIEW_LIMITS[field];
  if (!text) return required ? { key: 'required' } : undefined;
  if (text.length < min) return { key: 'tooShort', params: { count: min } };
  if (text.length > max) return { key: 'tooLong', params: { count: max } };
  return undefined;
}

export function validateDraft(draft: ReviewDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (draft.rating_overall < 1) errors.rating_overall = { key: 'ratingRequired' };

  const lengthChecks = {
    title: checkLength(draft.title, 'title', true),
    pros: checkLength(draft.pros, 'pros', true),
    cons: checkLength(draft.cons, 'cons', true),
    benefits: checkLength(draft.benefits, 'benefits', false),
    job_title: checkLength(draft.job_title, 'job_title', false),
  };
  for (const [field, error] of Object.entries(lengthChecks)) {
    if (error) errors[field as keyof typeof lengthChecks] = error;
  }

  if (draft.salary_amount != null && !draft.salary_period) {
    errors.salary_period = { key: 'salaryPeriodRequired' };
  }

  const allText = [draft.title, draft.pros, draft.cons, draft.benefits, draft.job_title].join('\n');
  if (containsPersonalData(allText) && !errors.pros) errors.pros = { key: 'personalData' };
  return errors;
}

/** Construit l'avis à envoyer depuis le brouillon et la saisie brute du salaire, avec ses erreurs. */
export function prepareSubmission(
  draft: ReviewDraft,
  salaryText: string,
): { candidate: ReviewDraft; errors: DraftErrors } {
  const salary = parseSalaryInput(salaryText);
  const amount = salary === 'invalid' ? null : salary;
  const candidate: ReviewDraft = {
    ...draft,
    salary_amount: amount,
    salary_period: amount ? draft.salary_period : null,
  };
  const errors = validateDraft(candidate);
  if (salary === 'invalid') errors.salary_amount = { key: 'salaryInvalid' };
  return { candidate, errors };
}

export function hasErrors(errors: DraftErrors): boolean {
  return Object.values(errors).some(Boolean);
}
