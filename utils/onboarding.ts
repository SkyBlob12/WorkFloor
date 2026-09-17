import { MAX_PRIORITIES, USER_PROFILES, type PriorityCriterion, type UserProfile } from '@constants/onboarding';
import { RATING_CRITERIA } from '@constants/reviews';

import { isRecord } from './guards';

export interface StoredOnboarding {
  completed: boolean;
  profile: UserProfile | null;
  priorities: PriorityCriterion[];
}

export const EMPTY_STORED: StoredOnboarding = { completed: false, profile: null, priorities: [] };

const isUserProfile = (value: unknown): value is UserProfile =>
  typeof value === 'string' && (USER_PROFILES as readonly string[]).includes(value);

const isCriterion = (value: unknown): value is PriorityCriterion =>
  typeof value === 'string' && (RATING_CRITERIA as readonly string[]).includes(value);

/** Critères prioritaires d'abord (dans l'ordre choisi), puis les autres dans leur ordre d'origine. */
export function sortCriteriaByPriority<T extends string>(criteria: readonly T[], priorities: readonly string[]): T[] {
  const first = priorities.filter((item): item is T => (criteria as readonly string[]).includes(item));
  return [...first, ...criteria.filter((criterion) => !first.includes(criterion))];
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
