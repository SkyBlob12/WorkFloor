import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { translate } from '@/i18n/currentLocale';
import { toServiceErrorCode } from '@services/errors';

import { showErrorToast } from './toast';

export interface AppQueryMeta extends Record<string, unknown> {
  /** L'écran affiche l'erreur lui-même (ex. formulaire) : pas de toast global. */
  inlineError?: boolean;
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: AppQueryMeta;
    mutationMeta: AppQueryMeta;
  }
}

function notifyError(error: unknown, meta: AppQueryMeta | undefined): void {
  if (meta?.inlineError) return;
  if (error instanceof Error && error.name === 'AbortError') return;
  showErrorToast(translate(`common:serviceError.${toServiceErrorCode(error)}`));
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: (error, query) => notifyError(error, query.meta) }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => notifyError(error, mutation.meta),
  }),
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});
