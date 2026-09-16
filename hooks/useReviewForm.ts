import { useCallback, useState } from 'react';

import {
  emptyDraft,
  hasErrors,
  pickDraft,
  prepareSubmission,
  type DraftErrors,
} from '@utils/reviewRules';
import type { OwnReview, ReviewDraft, ReviewStatus } from '@app-types/domain';

import { useSubmitReview } from './useReviewMutations';

export type ReviewFormError = { type: 'validation' } | { type: 'captcha' } | { type: 'service'; error: unknown };

export interface UseReviewFormOptions {
  companyId: string;
  initialReview: OwnReview | null;
}

export interface ReviewFormState {
  draft: ReviewDraft;
  salaryText: string;
  errors: DraftErrors;
  isEdit: boolean;
  update: <K extends keyof ReviewDraft>(key: K, value: ReviewDraft[K]) => void;
  setSalaryText: (value: string) => void;
  captchaKey: number;
  onCaptchaToken: (token: string | null) => void;
  submit: () => void;
  submitting: boolean;
  formError: ReviewFormError | null;
  result: ReviewStatus | null;
}

export function useReviewForm({ companyId, initialReview }: UseReviewFormOptions): ReviewFormState {
  const [draft, setDraft] = useState<ReviewDraft>(() => (initialReview ? pickDraft(initialReview) : emptyDraft()));
  const [salaryText, setSalaryTextState] = useState(() =>
    initialReview?.salary_amount ? String(initialReview.salary_amount) : '',
  );
  const [errors, setErrors] = useState<DraftErrors>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [formError, setFormError] = useState<ReviewFormError | null>(null);
  const [result, setResult] = useState<ReviewStatus | null>(null);
  const mutation = useSubmitReview();

  const update = useCallback(<K extends keyof ReviewDraft>(key: K, value: ReviewDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }, []);

  const setSalaryText = useCallback((value: string) => {
    setSalaryTextState(value);
    setErrors((current) => ({ ...current, salary_amount: undefined }));
  }, []);

  const submit = useCallback(() => {
    const { candidate, errors: found } = prepareSubmission(draft, salaryText);
    setErrors(found);
    if (hasErrors(found)) {
      setFormError({ type: 'validation' });
      return;
    }
    if (!captchaToken) {
      setFormError({ type: 'captcha' });
      return;
    }
    setFormError(null);
    mutation.mutate(
      { companyId, reviewId: initialReview?.id ?? null, draft: candidate, captchaToken },
      {
        onSuccess: (response) => setResult(response.status),
        onError: (error) => setFormError({ type: 'service', error }),
        // Un jeton Turnstile ne sert qu'une fois : on remonte le widget.
        onSettled: () => {
          setCaptchaToken(null);
          setCaptchaKey((key) => key + 1);
        },
      },
    );
  }, [draft, salaryText, captchaToken, companyId, initialReview, mutation]);

  return {
    draft,
    salaryText,
    errors,
    isEdit: initialReview !== null,
    update,
    setSalaryText,
    captchaKey,
    onCaptchaToken: setCaptchaToken,
    submit,
    submitting: mutation.isPending,
    formError,
    result,
  };
}
