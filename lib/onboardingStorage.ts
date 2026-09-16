import AsyncStorage from '@react-native-async-storage/async-storage';

import { ONBOARDING_STORAGE_KEY } from '@constants/onboarding';
import { parseStoredOnboarding, type StoredOnboarding } from '@utils/onboarding';

export async function readOnboarding(): Promise<StoredOnboarding> {
  try {
    return parseStoredOnboarding(await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY));
  } catch {
    return parseStoredOnboarding(null);
  }
}

export async function writeOnboarding(value: StoredOnboarding): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Stockage indisponible : l'onboarding sera proposé à nouveau au prochain lancement.
  }
}
