import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { useTranslation } from 'react-i18next';

import { getCurrentLocale } from '@/i18n/currentLocale';
import { size } from '@constants/theme';
import { env } from '@lib/env';

import type { TurnstileProps } from './Turnstile';

interface TurnstileApi {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('TURNSTILE_SCRIPT'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function Turnstile({ onToken }: TurnstileProps) {
  const { t } = useTranslation('common');
  const container = useRef<View>(null);
  const callback = useRef(onToken);

  useEffect(() => {
    callback.current = onToken;
  });

  useEffect(() => {
    let widgetId: string | undefined;
    let cancelled = false;
    loadScript()
      .then(() => {
        const element = container.current as unknown as HTMLElement | null;
        if (cancelled || !element || !window.turnstile) return;
        widgetId = window.turnstile.render(element, {
          sitekey: env.turnstileSiteKey,
          theme: 'auto',
          language: getCurrentLocale(),
          callback: (token: string) => callback.current(token),
          'expired-callback': () => callback.current(null),
          'error-callback': () => callback.current(null),
        });
      })
      .catch(() => callback.current(null));
    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, []);

  return <View ref={container} style={{ minHeight: size.captcha }} accessibilityLabel={t('captcha.label')} />;
}

export default Turnstile;
