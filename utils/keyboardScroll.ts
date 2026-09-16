/** Bande verticale (coordonnées fenêtre) : `top` inclus, `bottom` exclu. */
export interface VerticalBand {
  top: number;
  bottom: number;
}

/** Zone réellement visible du défilement : sous l'encoche, au-dessus du clavier. */
export function visibleBand(viewport: VerticalBand, keyboardTop: number, safeTop: number): VerticalBand {
  const top = Math.max(viewport.top, safeTop);
  return { top, bottom: Math.max(top, Math.min(viewport.bottom, keyboardTop)) };
}

/**
 * Marge basse à ajouter au contenu quand le clavier est ouvert : la part du défilement
 * cachée par le clavier, plus une demi-zone visible pour pouvoir centrer le dernier champ.
 * Si la fenêtre a déjà été redimensionnée (Android `adjustResize`), le recouvrement vaut 0.
 */
export function keyboardBottomInset(viewport: VerticalBand, keyboardTop: number, safeTop: number): number {
  const overlap = Math.max(0, viewport.bottom - keyboardTop);
  const visible = visibleBand(viewport, keyboardTop, safeTop);
  return Math.round(overlap + (visible.bottom - visible.top) / 2);
}

export interface CenteredOffsetInput {
  /** Défilement actuel. */
  scrollY: number;
  /** Position actuelle du champ (coordonnées fenêtre). */
  field: VerticalBand;
  visible: VerticalBand;
  /** Respiration gardée au-dessus d'un champ plus haut que la zone visible. */
  margin: number;
}

/** Défilement qui centre le champ dans la zone visible (ou aligne son haut s'il est trop grand). */
export function centeredScrollOffset({ scrollY, field, visible, margin }: CenteredOffsetInput): number {
  const fieldHeight = field.bottom - field.top;
  const visibleHeight = visible.bottom - visible.top;
  const delta =
    fieldHeight + 2 * margin > visibleHeight
      ? field.top - margin - visible.top
      : (field.top + field.bottom) / 2 - (visible.top + visible.bottom) / 2;
  return Math.max(0, Math.round(scrollY + delta));
}
