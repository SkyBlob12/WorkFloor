import { useColorScheme } from 'react-native';

import { colors, type ColorScheme, type Palette } from '@constants/theme';

export function useColorSchemeName(): ColorScheme {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}

/** Couleurs brutes, pour les props qui n'acceptent pas de className (icônes, placeholders…). */
export function useThemeColors(): Palette {
  return colors[useColorSchemeName()];
}
