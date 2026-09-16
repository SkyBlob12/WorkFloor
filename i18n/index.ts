import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from './locales';
import { defaultNS, NAMESPACES, resources } from './resources';

// v2 : ignore les choix enregistrés avant le passage au français par défaut (anciennes installations restées en anglais).
const STORAGE_KEY = 'app-locale-v2';

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    // Français par défaut sur toutes les plateformes, quelle que soit la langue de l'appareil.
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    ns: [...NAMESPACES],
    defaultNS,
    interpolation: { escapeValue: false },
    initAsync: false,
  });
}

/** Applique la langue choisie explicitement par l'utilisateur, sinon le français. */
export async function restorePreferredLocale(): Promise<void> {
  let stored: string | null = null;
  try {
    stored = await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }
  const target = stored && isAppLocale(stored) ? stored : DEFAULT_LOCALE;
  if (target !== i18n.resolvedLanguage) await i18n.changeLanguage(target);
}

export async function setAppLocale(locale: AppLocale): Promise<void> {
  await i18n.changeLanguage(locale);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Stockage indisponible : le choix vaut pour la session.
  }
}

export default i18n;
