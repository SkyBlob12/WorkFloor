import { useMemo } from 'react';
import { View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { getCurrentLocale } from '@/i18n/currentLocale';
import { size } from '@constants/theme';
import { useColorSchemeName } from '@hooks/useThemeColors';
import { env } from '@lib/env';
import { isRecord } from '@utils/guards';

export interface TurnstileProps {
  /** Jeton à usage unique, ou `null` s'il a expiré ou échoué. Remonter le composant (`key`) pour en obtenir un nouveau. */
  onToken: (token: string | null) => void;
}

function buildHtml(siteKey: string, theme: 'light' | 'dark', language: string) {
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>html,body{margin:0;padding:0;background:transparent;display:flex;justify-content:center}</style>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit" async defer></script>
</head><body><div id="widget"></div><script>
function post(message) { window.ReactNativeWebView.postMessage(JSON.stringify(message)); }
window.onTurnstileLoad = function () {
  turnstile.render('#widget', {
    sitekey: ${JSON.stringify(siteKey)},
    theme: '${theme}',
    language: '${language}',
    callback: function (token) { post({ type: 'token', token: token }); },
    'expired-callback': function () { post({ type: 'expired' }); },
    'error-callback': function () { post({ type: 'error' }); }
  });
};
</script></body></html>`;
}

/**
 * Mobile : le widget tourne dans une WebView dont l'origine (baseUrl) doit être
 * un domaine autorisé dans le dashboard Cloudflare Turnstile.
 */
export function Turnstile({ onToken }: TurnstileProps) {
  const { t } = useTranslation('common');
  const theme = useColorSchemeName();
  const language = getCurrentLocale();
  const html = useMemo(() => buildHtml(env.turnstileSiteKey, theme, language), [theme, language]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message: unknown = JSON.parse(event.nativeEvent.data);
      const token = isRecord(message) && message.type === 'token' ? message.token : null;
      onToken(typeof token === 'string' ? token : null);
    } catch {
      onToken(null);
    }
  };

  return (
    <View style={{ height: size.captcha, overflow: 'hidden' }} accessibilityLabel={t('captcha.label')}>
      <WebView
        originWhitelist={['*']}
        source={{ html, baseUrl: env.turnstileOrigin }}
        onMessage={handleMessage}
        scrollEnabled={false}
        style={{ backgroundColor: 'transparent' }}
      />
    </View>
  );
}

export default Turnstile;
