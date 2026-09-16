import {
  MAX_PRIORITIES,
  USER_PROFILES,
  type OnboardingStep,
  type PriorityCriterion,
  type UserProfile,
} from '@constants/onboarding';
import { RATING_CRITERIA } from '@constants/reviews';

import { isRecord } from './guards';

export interface OnboardingAnswers {
  profile: UserProfile | null;
  priorities: PriorityCriterion[];
  demoRating: number | null;
  anonymized: boolean;
}

export interface StoredOnboarding {
  completed: boolean;
  profile: UserProfile | null;
  priorities: PriorityCriterion[];
}

export type RatingFeedback = 'low' | 'mid' | 'high';

export const EMPTY_ANSWERS: OnboardingAnswers = { profile: null, priorities: [], demoRating: null, anonymized: false };
export const EMPTY_STORED: StoredOnboarding = { completed: false, profile: null, priorities: [] };

const isUserProfile = (value: unknown): value is UserProfile =>
  typeof value === 'string' && (USER_PROFILES as readonly string[]).includes(value);

const isCriterion = (value: unknown): value is PriorityCriterion =>
  typeof value === 'string' && (RATING_CRITERIA as readonly string[]).includes(value);

/** L'utilisateur a-t-il interagi avec l'étape ? */
export function canContinue(step: OnboardingStep, answers: OnboardingAnswers): boolean {
  switch (step) {
    case 'profile':
      return answers.profile !== null;
    case 'priorities':
      return answers.priorities.length > 0;
    case 'rating':
      return answers.demoRating !== null;
    case 'anonymity':
      return answers.anonymized;
    default:
      return true;
  }
}

/** Ajoute ou retire un critère, sans dépasser le maximum. */
export function togglePriority(
  priorities: readonly PriorityCriterion[],
  criterion: PriorityCriterion,
  max = MAX_PRIORITIES,
): PriorityCriterion[] {
  if (priorities.includes(criterion)) return priorities.filter((item) => item !== criterion);
  if (priorities.length >= max) return [...priorities];
  return [...priorities, criterion];
}

/** Critères prioritaires d'abord (dans l'ordre choisi), puis les autres dans leur ordre d'origine. */
export function sortCriteriaByPriority<T extends string>(criteria: readonly T[], priorities: readonly string[]): T[] {
  const first = priorities.filter((item): item is T => (criteria as readonly string[]).includes(item));
  return [...first, ...criteria.filter((criterion) => !first.includes(criterion))];
}

export function ratingFeedback(rating: number): RatingFeedback {
  if (rating <= 2) return 'low';
  return rating === 3 ? 'mid' : 'high';
}

/** Lecture tolérante du stockage local : toute valeur inattendue retombe sur l'état vierge. */
export function parseStoredOnboarding(raw: string | null): StoredOnboarding {
  if (!raw) return EMPTY_STORED;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value)) return EMPTY_STORED;
    return {
      completed: value.completed === true,
      profile: isUserProfile(value.profile) ? value.profile : null,
      priorities: Array.isArray(value.priorities) ? value.priorities.filter(isCriterion).slice(0, MAX_PRIORITIES) : [],
    };
  } catch {
    return EMPTY_STORED;
  }
}
