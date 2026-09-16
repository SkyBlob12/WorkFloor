import type { ColorScheme } from '@constants/theme';

/** Logo des stores détouré : noir sur fond clair, version crème en mode sombre. */
export const LOGO_MARK: Record<ColorScheme, number> = {
  light: require('@assets/images/logo-mark.png'),
  dark: require('@assets/images/logo-mark-light.png'),
};
