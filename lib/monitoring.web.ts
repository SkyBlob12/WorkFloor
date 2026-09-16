import * as Sentry from '@sentry/react';

import { logger } from '@utils/logger';

import { env } from './env';

export function initMonitoring(): void {
  if (!env.sentryDsn || typeof window === 'undefined') return;
  Sentry.init({
    dsn: env.sentryDsn,
    sendDefaultPii: false,
    tracesSampleRate: 0.2,
    enabled: !__DEV__,
  });
}

export function captureError(error: unknown): void {
  if (env.sentryDsn) Sentry.captureException(error);
  else logger.error(error);
}
