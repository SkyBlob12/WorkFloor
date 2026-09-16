import { StyleSheet } from 'react-native';

import { colors, type ColorScheme, type Palette } from '@constants/theme';

import { useColorSchemeName } from './useThemeColors';

/**
 * Déclare une feuille de styles dépendant de la palette. Les styles sont créés une fois par
 * mode (clair, sombre) puis mis en cache : aucun coût au rendu.
 *
 *   const useStyles = makeStyles((palette) => ({ card: { backgroundColor: palette.surface } }));
 *   const styles = useStyles();
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (palette: Palette) => T): () => T {
  const cache: Partial<Record<ColorScheme, T>> = {};
  return function useStyles(): T {
    const scheme = useColorSchemeName();
    const cached = cache[scheme] ?? StyleSheet.create(factory(colors[scheme]));
    cache[scheme] = cached;
    return cached;
  };
}
