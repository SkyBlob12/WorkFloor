/**
 * Langues disponibles. Ajouter une langue :
 * 1. déclarer l'entrée ici ;
 * 2. copier i18n/locales/fr/ vers i18n/locales/<code>/ et traduire ;
 * 3. l'enregistrer dans i18n/resources.ts.
 *
 * `nativeName` est l'endonyme de la langue : identique quelle que soit la langue de l'interface.
 */
export const LOCALES = [
  { code: 'fr', intlTag: 'fr-FR', nativeName: 'Français' },
  { code: 'en', intlTag: 'en-GB', nativeName: 'English' },
] as const;

export type AppLocale = (typeof LOCALES)[number]['code'];

export const DEFAULT_LOCALE: AppLocale = 'fr';

export function isAppLocale(value: string): value is AppLocale {
  return LOCALES.some((locale) => locale.code === value);
}
