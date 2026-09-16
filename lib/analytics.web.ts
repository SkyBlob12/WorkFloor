import posthog from 'posthog-js';

import { env } from './env';

// Persistance mémoire : aucun cookie ni localStorage posé par PostHog.
let enabled = false;

export function enableAnalytics(): void {
  if (!env.posthogKey || enabled || typeof window === 'undefined') return;
  posthog.init(env.posthogKey, {
    api_host: env.posthogHost,
    persistence: 'memory',
    autocapture: false,
    capture_pageview: false,
    disable_session_recording: true,
    person_profiles: 'identified_only',
  });
  enabled = true;
}

export function disableAnalytics(): void {
  if (!enabled) return;
  posthog.opt_out_capturing();
  enabled = false;
}

export function trackScreen(path: string): void {
  if (enabled) posthog.capture('$pageview', { $current_url: window.location.href, path });
}

export function track(event: string, properties?: Record<string, string | number | boolean>): void {
  if (enabled) posthog.capture(event, properties);
}
