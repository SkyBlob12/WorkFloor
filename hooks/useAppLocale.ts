import { useTranslation } from 'react-i18next';

import { setAppLocale } from '@/i18n';
import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from '@/i18n/locales';

export interface AppLocaleState {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => Promise<void>;
}

export function useAppLocale(): AppLocaleState {
  const { i18n } = useTranslation();
  const code = i18n.resolvedLanguage;
  return { locale: code && isAppLocale(code) ? code : DEFAULT_LOCALE, setLocale: setAppLocale };
}
