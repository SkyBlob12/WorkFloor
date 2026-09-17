import { useCallback, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { UNDO_DELAY_MS } from '@constants/reviews';
import type { ModerationDecision, ModerationItem } from '@app-types/domain';

import { useModerateReview } from './useModeration';
import { useUndoableAction } from './useUndoableAction';

export interface ModerationDecisionsController {
  /** File sans les avis dont la décision attend la fin du délai d'annulation. */
  visibleItems: ModerationItem[];
  decide: (item: ModerationItem, decision: ModerationDecision) => void;
}

/** Décision différée : l'avis quitte la file tout de suite, la décision part après le délai « Annuler ». */
export function useModerationDecisions(items: ModerationItem[] | undefined): ModerationDecisionsController {
  const { t } = useTranslation(['account', 'common']);
  const { mutateAsync } = useModerateReview();
  const { pendingIds, schedule } = useUndoableAction(UNDO_DELAY_MS);

  const visibleItems = useMemo(
    () => (items ?? []).filter((item) => !pendingIds.has(item.review_id)),
    [items, pendingIds],
  );

  const decide = useCallback(
    (item: ModerationItem, decision: ModerationDecision) =>
      schedule({
        id: item.review_id,
        message: t(`account:moderation.done.${decision}`),
        undoLabel: t('common:action.undo'),
        commit: () => mutateAsync({ reviewId: item.review_id, decision }),
      }),
    [schedule, mutateAsync, t],
  );

  return { visibleItems, decide };
}
