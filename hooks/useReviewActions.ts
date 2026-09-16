import { useCallback, useMemo, useState } from 'react';

import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { UNDO_DELAY_MS } from '@constants/reviews';
import type { PublicReview } from '@app-types/domain';
import type { IconName } from '@app-types/icons';

import { useRequireAuth } from './useRequireAuth';
import { useBlockAuthor, useDeleteReview, useHelpfulVote } from './useReviewMutations';
import { useUndoableAction } from './useUndoableAction';

export interface ReviewSheetAction {
  key: string;
  label: string;
  icon: IconName;
  destructive?: boolean;
  onPress: () => void;
}

export interface ReviewActions {
  sheetReview: PublicReview | null;
  sheetActions: ReviewSheetAction[];
  hiddenIds: ReadonlySet<string>;
  openSheet: (review: PublicReview) => void;
  closeSheet: () => void;
  toggleHelpful: (review: PublicReview) => void;
}

/** Actions sur les avis d'une fiche : vote, signalement, masquage d'auteur et suppression (avec annulation). */
export function useReviewActions(companyId: string): ReviewActions {
  const { t } = useTranslation(['reviews', 'common']);
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const [sheetReview, setSheetReview] = useState<PublicReview | null>(null);
  const helpful = useHelpfulVote(companyId);
  const block = useBlockAuthor();
  const remove = useDeleteReview(companyId);
  const { pendingIds, schedule } = useUndoableAction(UNDO_DELAY_MS);

  const toggleHelpful = useCallback(
    (review: PublicReview) => {
      if (requireAuth()) helpful.mutate({ reviewId: review.id, voted: !review.voted_helpful });
    },
    [requireAuth, helpful],
  );

  const sheetActions = useMemo<ReviewSheetAction[]>(() => {
    if (!sheetReview) return [];
    const review = sheetReview;
    const undoLabel = t('common:action.undo');
    if (review.is_mine) {
      return [
        { key: 'edit', label: t('actions.edit'), icon: 'edit-2', onPress: () => router.push(`/company/${companyId}/review`) },
        {
          key: 'delete',
          label: t('actions.delete'),
          icon: 'trash-2',
          destructive: true,
          onPress: () => schedule({ id: review.id, message: t('undo.deleted'), undoLabel, commit: () => remove.mutateAsync(review.id) }),
        },
      ];
    }
    return [
      { key: 'report', label: t('actions.report'), icon: 'flag', onPress: () => requireAuth() && router.push(`/report/${review.id}`) },
      {
        key: 'block',
        label: t('actions.blockAuthor'),
        icon: 'eye-off',
        onPress: () =>
          requireAuth() &&
          schedule({ id: review.id, message: t('undo.authorHidden'), undoLabel, commit: () => block.mutateAsync(review.id) }),
      },
    ];
  }, [sheetReview, t, router, companyId, schedule, remove, block, requireAuth]);

  return {
    sheetReview,
    sheetActions,
    hiddenIds: pendingIds,
    openSheet: setSheetReview,
    closeSheet: useCallback(() => setSheetReview(null), []),
    toggleHelpful,
  };
}
