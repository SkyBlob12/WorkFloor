import { colors, navigationThemes, typography } from '@constants/theme';

// #RRGGBB ou #RRGGBBAA (couleurs translucides du verre).
const HEX_RE = /^#[0-9A-F]{6}([0-9A-F]{2})?$/i;

describe('thème', () => {
  it('définit les mêmes couleurs, au format hexadécimal, en clair et en sombre', () => {
    expect(Object.keys(colors.dark).sort()).toEqual(Object.keys(colors.light).sort());
    for (const scheme of ['light', 'dark'] as const) {
      for (const value of Object.values(colors[scheme])) expect(value).toMatch(HEX_RE);
    }
  });

  it('convertit la typographie en styles React Native', () => {
    expect(typography.title).toMatchObject({ fontSize: 22, fontWeight: '700' });
    expect(typography.body.letterSpacing).toBeUndefined();
  });

  it('aligne le thème de navigation sur la palette', () => {
    expect(navigationThemes.light.colors.primary).toBe(colors.light.primary);
    expect(navigationThemes.dark.colors.background).toBe(colors.dark.background);
    expect(navigationThemes.dark.dark).toBe(true);
  });
});
