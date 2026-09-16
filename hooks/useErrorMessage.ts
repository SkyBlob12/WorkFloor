import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { toServiceErrorCode } from '@services/errors';

/** Traduit une erreur de service (code stable) au point d'affichage. */
export function useErrorMessage(): (error: unknown) => string {
  const { t } = useTranslation('common');
  return useCallback((error: unknown) => t(`serviceError.${toServiceErrorCode(error)}`), [t]);
}
