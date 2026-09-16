import { useCallback, useState } from 'react';

import { ONBOARDING_STEPS, type OnboardingStep, type PriorityCriterion, type UserProfile } from '@constants/onboarding';
import { useOnboardingStore } from '@stores/onboardingStore';
import { canContinue, EMPTY_ANSWERS, togglePriority, type OnboardingAnswers } from '@utils/onboarding';

export interface OnboardingFlowState {
  step: OnboardingStep;
  stepIndex: number;
  stepCount: number;
  answers: OnboardingAnswers;
  canContinue: boolean;
  next: () => void;
  back: () => void;
  /** Saute les étapes interactives et va directement à la connexion. */
  skip: () => void;
  setProfile: (profile: UserProfile) => void;
  togglePriority: (criterion: PriorityCriterion) => void;
  setDemoRating: (rating: number | null) => void;
  anonymize: () => void;
  /** Enregistre les réponses et marque l'onboarding comme terminé. */
  finish: () => void;
}

export function useOnboardingFlow(): OnboardingFlowState {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY_ANSWERS);
  const step = ONBOARDING_STEPS[stepIndex];
  const allowed = canContinue(step, answers);

  const next = useCallback(() => {
    if (!allowed) return;
    setStepIndex((index) => Math.min(index + 1, ONBOARDING_STEPS.length - 1));
  }, [allowed]);

  const back = useCallback(() => setStepIndex((index) => Math.max(index - 1, 0)), []);

  const skip = useCallback(() => setStepIndex(ONBOARDING_STEPS.length - 1), []);

  const finish = useCallback(() => {
    useOnboardingStore.getState().complete({ profile: answers.profile, priorities: answers.priorities });
  }, [answers.profile, answers.priorities]);

  return {
    step,
    stepIndex,
    stepCount: ONBOARDING_STEPS.length,
    answers,
    canContinue: allowed,
    next,
    back,
    skip,
    setProfile: (profile) => setAnswers((current) => ({ ...current, profile })),
    togglePriority: (criterion) =>
      setAnswers((current) => ({ ...current, priorities: togglePriority(current.priorities, criterion) })),
    setDemoRating: (demoRating) => setAnswers((current) => ({ ...current, demoRating })),
    anonymize: () => setAnswers((current) => ({ ...current, anonymized: true })),
    finish,
  };
}
