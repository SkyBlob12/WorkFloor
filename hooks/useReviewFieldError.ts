import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import type { ErrorDescriptor } from '@utils/reviewRules';

/** Traduit un descripteur d'erreur de champ (`reviews:formError.<key>`). */
export function useReviewFieldError(): (descriptor: ErrorDescriptor | undefined) => string | undefined {
  const { t } = useTranslation('reviews');
  return useCallback(
    (descriptor: ErrorDescriptor | undefined) =>
      descriptor ? t(`formError.${descriptor.key}`, { count: descriptor.params?.count ?? 0 }) : undefined,
    [t],
  );
}
