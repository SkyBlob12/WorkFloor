import type { PropsWithChildren } from 'react';

import { ScrollViewStyleReset } from 'expo-router/html';

import { colors } from '@constants/theme';
import { DEFAULT_LOCALE } from '@/i18n/locales';
import commonFr from '@/i18n/locales/fr/common.json';

// Squelette HTML du site web (rendu statique, langue par défaut). Non utilisé sur mobile.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content={commonFr.meta.description} />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: backgroundCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const backgroundCss = `
body { background-color: ${colors.light.background}; }
@media (prefers-color-scheme: dark) { body { background-color: ${colors.dark.background}; } }
`;
