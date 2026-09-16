/** Logger conditionnel : silencieux en production (les erreurs y partent dans Sentry). */
export const logger = {
  error(...args: unknown[]): void {
    if (__DEV__) console.error(...args);
  },
  warn(...args: unknown[]): void {
    if (__DEV__) console.warn(...args);
  },
};
