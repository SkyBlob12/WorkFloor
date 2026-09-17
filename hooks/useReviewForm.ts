import { useCallback, useState } from 'react';

import {
  emptyDraft,
  hasErrors,
  pickDraft,
  prepareSubmission,
  type DraftErrors,
  type ErrorDescriptor,
} from '@utils/reviewRules';
import type { OwnReview, ReviewDraft, SelectedSite, SubmitReviewResult } from '@app-types/domain';

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
  /** Établissement où l'auteur a travaillé (facultatif). */
  site: SelectedSite | null;
  setSite: (site: SelectedSite | null) => void;
  /** Attestation sur l'honneur, jamais pré-cochée : elle porte sur le contenu envoyé. */
  attested: boolean;
  setAttested: (value: boolean) => void;
  attestationError: ErrorDescriptor | undefined;
  submit: () => void;
  submitting: boolean;
  formError: ReviewFormError | null;
  result: SubmitReviewResult | null;
}

const ATTESTATION_REQUIRED: ErrorDescriptor = { key: 'attestationRequired' };

function initialSite(review: OwnReview | null): SelectedSite | null {
  const site = review?.site;
  return site ? { siret: site.siret, city: site.city, postalCode: site.postal_code } : null;
}

export function useReviewForm({ companyId, initialReview }: UseReviewFormOptions): ReviewFormState {
  const [draft, setDraft] = useState<ReviewDraft>(() => (initialReview ? pickDraft(initialReview) : emptyDraft()));
  const [salaryText, setSalaryTextState] = useState(() =>
    initialReview?.salary_amount ? String(initialReview.salary_amount) : '',
  );
  const [site, setSite] = useState<SelectedSite | null>(() => initialSite(initialReview));
  const [errors, setErrors] = useState<DraftErrors>({});
  const [attested, setAttestedState] = useState(false);
  const [attestationError, setAttestationError] = useState<ErrorDescriptor | undefined>();
  const [formError, setFormError] = useState<ReviewFormError | null>(null);
  const [result, setResult] = useState<SubmitReviewResult | null>(null);
  const mutation = useSubmitReview();

  const update = useCallback(<K extends keyof ReviewDraft>(key: K, value: ReviewDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }, []);

  const setSalaryText = useCallback((value: string) => {
    setSalaryTextState(value);
    setErrors((current) => ({ ...current, salary_amount: undefined }));
  }, []);

  const setAttested = useCallback((value: boolean) => {
    setAttestedState(value);
    setAttestationError(undefined);
  }, []);

  const submit = useCallback(() => {
    const { candidate, errors: found } = prepareSubmission(draft, salaryText);
    setErrors(found);
    setAttestationError(attested ? undefined : ATTESTATION_REQUIRED);
    if (hasErrors(found) || !attested) {
      setFormError({ type: 'validation' });
      return;
    }
    setFormError(null);
    mutation.mutate(
      { companyId, reviewId: initialReview?.id ?? null, draft: candidate, attested, siteSiret: site?.siret ?? null },
      {
        onSuccess: (response) => setResult(response),
        onError: (error) => setFormError({ type: 'service', error }),
      },
    );
  }, [draft, salaryText, attested, site, companyId, initialReview, mutation]);

  return {
    draft,
    salaryText,
    errors,
    isEdit: initialReview !== null,
    update,
    setSalaryText,
    site,
    setSite,
    attested,
    setAttested,
    attestationError,
    submit,
    submitting: mutation.isPending,
    formError,
    result,
  };
}
