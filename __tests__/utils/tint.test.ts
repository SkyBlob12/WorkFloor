import { TINTS, tintAt, tintFor } from '@utils/tint';

describe('tintAt', () => {
  it('alterne les teintes dans l’ordre', () => {
    expect(tintAt(0)).toBe(TINTS[0]);
    expect(tintAt(1)).toBe(TINTS[1]);
    expect(tintAt(TINTS.length)).toBe(TINTS[0]);
  });

  it.each([-1, -7, Number.NaN, Number.POSITIVE_INFINITY, 2.7])('reste dans la liste pour %p', (index) => {
    expect(TINTS).toContain(tintAt(index));
  });
});

describe('tintFor', () => {
  it('est stable pour un même nom, casse et espaces ignorés', () => {
    expect(tintFor('Acme Industries')).toBe(tintFor('  acme industries '));
  });

  it('accepte une chaîne vide', () => {
    expect(TINTS).toContain(tintFor(''));
  });

  it('répartit des noms différents sur plusieurs teintes', () => {
    const names = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel'];
    expect(new Set(names.map(tintFor)).size).toBeGreaterThan(1);
  });
});
