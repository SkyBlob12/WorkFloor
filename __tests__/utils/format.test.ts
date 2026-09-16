import {
  departmentFromPostalCode,
  EMPTY_VALUE,
  formatInteger,
  formatMonth,
  formatRating,
  formatSiren,
  initialsOf,
} from '@utils/format';

describe('initialsOf', () => {
  it('prend les initiales des deux premiers mots', () => {
    expect(initialsOf('Crédit Agricole SA')).toBe('CA');
    expect(initialsOf('l’oréal')).toBe('LO');
    expect(initialsOf('decathlon')).toBe('D');
  });

  it('renvoie le tiret pour un nom vide', () => {
    expect(initialsOf('  ')).toBe(EMPTY_VALUE);
  });
});

describe('formatRating', () => {
  it('formate avec une décimale selon la locale', () => {
    expect(formatRating(4, 'fr-FR')).toBe('4,0');
    expect(formatRating(3.46, 'en-GB')).toBe('3.5');
  });

  it('affiche le tiret si la note est absente', () => {
    expect(formatRating(null, 'fr-FR')).toBe(EMPTY_VALUE);
  });
});

describe('formatMonth', () => {
  it('lit la date SQL en UTC (pas de glissement au mois précédent)', () => {
    expect(formatMonth('2026-03-01', 'fr-FR')).toBe('mars 2026');
    expect(formatMonth('2026-03-01', 'en-GB')).toBe('March 2026');
  });
});

describe('formatInteger', () => {
  it('sépare les milliers selon la locale', () => {
    expect(formatInteger(42000, 'en-GB')).toBe('42,000');
  });
});

describe('formatSiren', () => {
  it('groupe par 3 chiffres', () => {
    expect(formatSiren('306138900')).toBe('306 138 900');
  });
});

describe('departmentFromPostalCode', () => {
  it('extrait le département', () => {
    expect(departmentFromPostalCode('59650')).toBe('59');
    expect(departmentFromPostalCode(null)).toBeNull();
  });
});
