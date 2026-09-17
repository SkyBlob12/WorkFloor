/** Modes d'apparence proposés dans les paramètres. `system` suit le réglage de l'appareil. */
export const THEME_MODES = ['system', 'light', 'dark'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export const DEFAULT_THEME_MODE: ThemeMode = 'system';

export const THEME_MODE_STORAGE_KEY = 'theme-mode-v1';
