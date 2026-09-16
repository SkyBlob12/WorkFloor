import { RATING_CRITERIA } from './reviews';

/** Situation déclarée à l'onboarding : adapte les textes, jamais envoyée au serveur. */
export const USER_PROFILES = ['jobSeeker', 'employee', 'curious'] as const;
export type UserProfile = (typeof USER_PROFILES)[number];

export type PriorityCriterion = (typeof RATING_CRITERIA)[number];

/** Étapes dans l'ordre. Chacune demande une interaction avant de continuer (sauf la dernière). */
export const ONBOARDING_STEPS = ['profile', 'priorities', 'rating', 'anonymity', 'auth'] as const;
export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const MAX_PRIORITIES = 3;

export const ONBOARDING_STORAGE_KEY = 'onboarding-v1';
export const ONBOARDING_PATH = '/onboarding';
