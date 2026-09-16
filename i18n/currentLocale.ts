/**
 * Module feuille, utilisable hors React et dans Jest : ne dépend que de l'instance i18next.
 * - `translate` pour les services et le code sans hook ;
 * - `getIntlTag` pour formater dates et nombres (jamais de 'fr-FR' en dur).
 */
import i18n, { type ParseKeys, type TOptions } from 'i18next';

import { DEFAULT_LOCALE, LOCALES, type AppLocale } from './locales';
import type { Namespace } from './resources';

export function getCurrentLocale(): AppLocale {
  const code = i18n.resolvedLanguage;
  return LOCALES.find((locale) => locale.code === code)?.code ?? DEFAULT_LOCALE;
}

export function getIntlTag(): string {
  const code = getCurrentLocale();
  return (LOCALES.find((locale) => locale.code === code) ?? LOCALES[0]).intlTag;
}

type LooseTranslate = (key: string, options?: TOptions) => string;

/** La clé est vérifiée à l'appel (ParseKeys) ; l'appel interne évite les surcharges typées de i18n.t. */
export function translate(key: ParseKeys<Namespace[]>, params?: TOptions): string {
  return (i18n.t as LooseTranslate)(key, params);
}
