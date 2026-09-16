import { create } from 'zustand';

import { disableAnalytics, enableAnalytics } from '@lib/analytics';
import { readConsent, writeConsent, type Consent } from '@lib/consentStorage';

interface ConsentState {
  consent: Consent | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setConsent: (value: Consent) => void;
}

/** Mesure d'audience en opt-in (recommandation CNIL). */
export const useConsentStore = create<ConsentState>()((set, get) => ({
  consent: null,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) return;
    const value = await readConsent();
    set({ consent: value, hydrated: true });
    if (value === 'granted') enableAnalytics();
  },
  setConsent: (value) => {
    set({ consent: value });
    void writeConsent(value);
    if (value === 'granted') enableAnalytics();
    else disableAnalytics();
  },
}));
