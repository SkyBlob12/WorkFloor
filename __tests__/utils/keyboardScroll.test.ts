import { centeredScrollOffset, keyboardBottomInset, visibleBand } from '@utils/keyboardScroll';

describe('visibleBand', () => {
  it('coupe la zone sous l’encoche et au-dessus du clavier', () => {
    expect(visibleBand({ top: 0, bottom: 800 }, 500, 50)).toEqual({ top: 50, bottom: 500 });
  });

  it('ne renvoie jamais une bande négative', () => {
    expect(visibleBand({ top: 100, bottom: 800 }, 50, 0)).toEqual({ top: 100, bottom: 100 });
  });
});

describe('keyboardBottomInset', () => {
  it('ajoute le recouvrement du clavier et une demi-zone visible', () => {
    // Recouvrement 300, zone visible 400 (100 → 500).
    expect(keyboardBottomInset({ top: 100, bottom: 800 }, 500, 0)).toBe(500);
  });

  it('ne compte aucun recouvrement si la fenêtre est déjà redimensionnée', () => {
    expect(keyboardBottomInset({ top: 0, bottom: 500 }, 500, 0)).toBe(250);
  });
});

describe('centeredScrollOffset', () => {
  const visible = { top: 100, bottom: 500 };

  it('centre le champ dans la zone visible', () => {
    const y = centeredScrollOffset({ scrollY: 200, field: { top: 600, bottom: 650 }, visible, margin: 16 });
    // Centre du champ 625, centre visible 300 : +325.
    expect(y).toBe(525);
  });

  it('aligne le haut d’un champ plus grand que la zone visible', () => {
    const y = centeredScrollOffset({ scrollY: 0, field: { top: 300, bottom: 800 }, visible, margin: 16 });
    expect(y).toBe(184);
  });

  it('ne défile jamais au-dessus du début du contenu', () => {
    expect(centeredScrollOffset({ scrollY: 0, field: { top: 110, bottom: 150 }, visible, margin: 16 })).toBe(0);
  });
});
