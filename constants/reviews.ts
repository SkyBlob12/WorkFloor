// Constantes structurelles : des clés stables, jamais de libellé (résolu via t() à l'affichage).

export const EMPLOYMENT_STATUSES = ['current', 'former'] as const;

export const CONTRACT_TYPES = [
  'cdi',
  'cdd',
  'interim',
  'internship',
  'apprenticeship',
  'freelance',
  'other',
] as const;

export const SALARY_PERIODS = ['year', 'month', 'hour'] as const;

export const REVIEW_STATUSES = ['published', 'pending', 'hidden', 'removed'] as const;

export const REPORT_REASONS = [
  'defamation',
  'personal_data',
  'harassment',
  'hate',
  'spam',
  'off_topic',
  'illegal',
  'other',
] as const;

/** Critères notés. Colonnes SQL : `rating_<critère>` (avis) et `avg_<critère>` (moyennes). */
export const RATING_CRITERIA = ['culture', 'salary', 'benefits', 'management', 'work_life'] as const;

export const REVIEW_SORTS = ['recent', 'helpful'] as const;

// À garder synchronisé avec supabase/functions/submit-review et les CHECK SQL.
export const REVIEW_LIMITS = {
  title: { min: 3, max: 120 },
  pros: { min: 20, max: 3000 },
  cons: { min: 20, max: 3000 },
  benefits: { min: 0, max: 1000 },
  job_title: { min: 0, max: 100 },
} as const;

export const REPORT_DETAILS_MAX = 1000;
export const REVIEWS_PAGE_SIZE = 10;
export const UNDO_DELAY_MS = 3000;
