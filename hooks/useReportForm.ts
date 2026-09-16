import { useCallback, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ServiceError } from '@services/errors';
import { blockReviewAuthor, reportReview } from '@services/moderation';
import type { ReportReason } from '@app-types/domain';

export type ReportIssue = 'reasonRequired' | 'detailsRequired';

export interface ReportFormState {
  reason: ReportReason | null;
  setReason: (reason: ReportReason) => void;
  details: string;
  setDetails: (value: string) => void;
  issue: ReportIssue | null;
  submit: () => void;
  submitting: boolean;
  serviceError: Error | null;
  done: boolean;
  blockAuthor: () => void;
  blocking: boolean;
  blocked: boolean;
}

export function useReportForm(reviewId: string): ReportFormState {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [issue, setIssue] = useState<ReportIssue | null>(null);

  const report = useMutation<void, Error, void>({
    meta: { inlineError: true },
    mutationFn: async () => {
      try {
        await reportReview(reviewId, reason ?? 'other', details);
      } catch (error) {
        // Déjà signalé : du point de vue de l'utilisateur, c'est fait.
        if (error instanceof ServiceError && error.code === 'ALREADY_REPORTED') return;
        throw error;
      }
    },
  });

  const block = useMutation<void, Error, void>({
    mutationFn: () => blockReviewAuthor(reviewId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });

  const submit = useCallback(() => {
    const found: ReportIssue | null = !reason
      ? 'reasonRequired'
      : reason === 'other' && !details.trim()
        ? 'detailsRequired'
        : null;
    setIssue(found);
    if (!found) report.mutate();
  }, [reason, details, report]);

  return {
    reason,
    setReason,
    details,
    setDetails,
    issue,
    submit,
    submitting: report.isPending,
    serviceError: report.error,
    done: report.isSuccess,
    blockAuthor: () => block.mutate(),
    blocking: block.isPending,
    blocked: block.isSuccess,
  };
}
