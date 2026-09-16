import { isEmployeeRange, isNafSection, nafSectionFromCode } from '@utils/naf';

describe('nafSectionFromCode', () => {
  it.each([
    ['70.10Z', 'M'],
    ['47.64Z', 'G'],
    ['01.11Z', 'A'],
    ['62.01Z', 'J'],
    ['99.00Z', 'U'],
  ])('%s appartient à la section %s', (code, section) => {
    expect(nafSectionFromCode(code)).toBe(section);
  });

  it.each([null, '', 'XX', '04.00Z'])('renvoie null pour %p', (code) => {
    expect(nafSectionFromCode(code)).toBeNull();
  });
});

describe('gardes de type', () => {
  it('reconnaît les sections et tranches valides', () => {
    expect(isNafSection('C')).toBe(true);
    expect(isNafSection('Z')).toBe(false);
    expect(isEmployeeRange('42')).toBe(true);
    expect(isEmployeeRange('99')).toBe(false);
    expect(isEmployeeRange(null)).toBe(false);
  });
});
