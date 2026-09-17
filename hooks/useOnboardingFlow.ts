import { useCallback, useState } from 'react';

import { ONBOARDING_STEPS, type OnboardingStep } from '@constants/onboarding';
import { useOnboardingStore } from '@stores/onboardingStore';

export interface OnboardingFlowState {
  step: OnboardingStep;
  stepIndex: number;
  stepCount: number;
  next: () => void;
  back: () => void;
  /** Saute les étapes de présentation et va directement à la connexion. */
  skip: () => void;
  /** Marque l'onboarding comme terminé, sans toucher aux préférences déjà enregistrées. */
  finish: () => void;
}

export function useOnboardingFlow(): OnboardingFlowState {
  const [stepIndex, setStepIndex] = useState(0);

  const next = useCallback(() => setStepIndex((index) => Math.min(index + 1, ONBOARDING_STEPS.length - 1)), []);
  const back = useCallback(() => setStepIndex((index) => Math.max(index - 1, 0)), []);
  const skip = useCallback(() => setStepIndex(ONBOARDING_STEPS.length - 1), []);

  const finish = useCallback(() => {
    const { complete, profile, priorities } = useOnboardingStore.getState();
    complete({ profile, priorities });
  }, []);

  return {
    step: ONBOARDING_STEPS[stepIndex],
    stepIndex,
    stepCount: ONBOARDING_STEPS.length,
    next,
    back,
    skip,
    finish,
  };
}
