import { DEFAULT_THEME_MODE, THEME_MODES, type ThemeMode } from '@constants/appearance';
import type { ColorScheme } from '@constants/theme';

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);
}

/** Lecture tolérante du stockage local : toute valeur inattendue retombe sur le mode système. */
export function parseThemeMode(raw: string | null): ThemeMode {
  return isThemeMode(raw) ? raw : DEFAULT_THEME_MODE;
}

/** Schéma effectif : le choix de l'utilisateur, sinon celui de l'appareil (clair par défaut). */
export function resolveColorScheme(mode: ThemeMode, system: string | null | undefined): ColorScheme {
  if (mode !== 'system') return mode;
  return system === 'dark' ? 'dark' : 'light';
}
