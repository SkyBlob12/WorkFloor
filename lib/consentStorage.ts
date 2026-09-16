import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'analytics-consent-v1';

export type Consent = 'granted' | 'denied';

export async function readConsent(): Promise<Consent | null> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

export async function writeConsent(value: Consent): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, value);
  } catch {
    // Stockage indisponible (navigation privée…) : le choix vaut pour la session.
  }
}
