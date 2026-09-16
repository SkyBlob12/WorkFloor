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

export type ReviewFormError = { type: 'validation' } | { type: 'service'; error: unknown };

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
    setFormError(null);
    mutation.mutate(
      { companyId, reviewId: initialReview?.id ?? null, draft: candidate },
      {
        onSuccess: (response) => setResult(response.status),
        onError: (error) => setFormError({ type: 'service', error }),
      },
    );
  }, [draft, salaryText, companyId, initialReview, mutation]);

  return {
    draft,
    salaryText,
    errors,
    isEdit: initialReview !== null,
    update,
    setSalaryText,
    submit,
    submitting: mutation.isPending,
    formError,
    result,
  };
}
