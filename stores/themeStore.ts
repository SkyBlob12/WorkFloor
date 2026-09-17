import { Appearance, Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { DEFAULT_THEME_MODE, THEME_MODE_STORAGE_KEY, type ThemeMode } from '@constants/appearance';
import { parseThemeMode } from '@utils/themeMode';

interface ThemeState {
  mode: ThemeMode;
  hydrate: () => Promise<void>;
  setMode: (mode: ThemeMode) => void;
}

/** Aligne les éléments natifs (clavier, flou, Liquid Glass, feuilles système) sur le mode choisi. */
function applyNativeAppearance(mode: ThemeMode): void {
  if (Platform.OS === 'web') return;
  Appearance.setColorScheme(mode === 'system' ? 'unspecified' : mode);
}

/** Apparence choisie dans les paramètres, conservée sur l'appareil (jamais envoyée au serveur). */
export const useThemeStore = create<ThemeState>()((set) => ({
  mode: DEFAULT_THEME_MODE,
  hydrate: async () => {
    try {
      const mode = parseThemeMode(await AsyncStorage.getItem(THEME_MODE_STORAGE_KEY));
      applyNativeAppearance(mode);
      set({ mode });
    } catch {
      // Stockage indisponible : l'app suit l'appareil.
    }
  },
  setMode: (mode) => {
    applyNativeAppearance(mode);
    set({ mode });
    AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode).catch(() => undefined);
  },
}));
