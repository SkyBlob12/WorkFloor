import { create } from 'zustand';

import type { PriorityCriterion, UserProfile } from '@constants/onboarding';
import { readOnboarding, writeOnboarding } from '@lib/onboardingStorage';

interface OnboardingState {
  hydrated: boolean;
  completed: boolean;
  profile: UserProfile | null;
  /** Critères mis en avant sur les fiches entreprise. */
  priorities: PriorityCriterion[];
  hydrate: () => Promise<void>;
  complete: (answers: { profile: UserProfile | null; priorities: PriorityCriterion[] }) => void;
}

/** Préférences locales issues de l'onboarding (jamais envoyées au serveur). */
export const useOnboardingStore = create<OnboardingState>()((set, get) => ({
  hydrated: false,
  completed: false,
  profile: null,
  priorities: [],
  hydrate: async () => {
    if (get().hydrated) return;
    const stored = await readOnboarding();
    set({ ...stored, hydrated: true });
  },
  complete: ({ profile, priorities }) => {
    set({ completed: true, profile, priorities });
    void writeOnboarding({ completed: true, profile, priorities });
  },
}));
