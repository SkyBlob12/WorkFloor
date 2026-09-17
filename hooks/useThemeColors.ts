import { useColorScheme } from 'react-native';

import { colors, type ColorScheme, type Palette } from '@constants/theme';
import { useThemeStore } from '@stores/themeStore';
import { resolveColorScheme } from '@utils/themeMode';

/** Schéma effectif : le mode choisi dans les paramètres, ou celui de l'appareil. */
export function useColorSchemeName(): ColorScheme {
  const system = useColorScheme();
  const mode = useThemeStore((state) => state.mode);
  return resolveColorScheme(mode, system);
}

/** Couleurs brutes, pour les props qui n'acceptent pas de className (icônes, placeholders…). */
export function useThemeColors(): Palette {
  return colors[useColorSchemeName()];
}
