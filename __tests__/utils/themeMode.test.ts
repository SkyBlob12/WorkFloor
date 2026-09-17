import { isThemeMode, parseThemeMode, resolveColorScheme } from '@utils/themeMode';

describe('themeMode', () => {
  it('reconnaît uniquement les modes proposés', () => {
    expect(isThemeMode('dark')).toBe(true);
    expect(isThemeMode('sepia')).toBe(false);
    expect(isThemeMode(null)).toBe(false);
  });

  it('retombe sur le mode système pour une valeur stockée inattendue', () => {
    expect(parseThemeMode('light')).toBe('light');
    expect(parseThemeMode('"dark"')).toBe('system');
    expect(parseThemeMode(null)).toBe('system');
  });

  it('applique le choix explicite, sinon suit l’appareil', () => {
    expect(resolveColorScheme('dark', 'light')).toBe('dark');
    expect(resolveColorScheme('light', 'dark')).toBe('light');
    expect(resolveColorScheme('system', 'dark')).toBe('dark');
    expect(resolveColorScheme('system', 'unspecified')).toBe('light');
    expect(resolveColorScheme('system', null)).toBe('light');
  });
});
