import PostHog from 'posthog-react-native';

import { env } from './env';

// Aucune identification : les événements ne sont jamais reliés à un compte (anonymat).
let client: PostHog | null = null;

export function enableAnalytics(): void {
  if (!env.posthogKey || client) return;
  client = new PostHog(env.posthogKey, { host: env.posthogHost, captureAppLifecycleEvents: true });
}

export function disableAnalytics(): void {
  client?.optOut();
  client = null;
}

export function trackScreen(path: string): void {
  client?.screen(path);
}

export function track(event: string, properties?: Record<string, string | number | boolean>): void {
  client?.capture(event, properties);
}
