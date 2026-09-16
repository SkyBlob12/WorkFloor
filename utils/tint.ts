import type { ColorName } from '@constants/theme';

/** Teinte douce d'une illustration : un fond pâle et la couleur lisible posée dessus. */
export interface Tint {
  background: ColorName;
  foreground: ColorName;
}

/** Les trois familles de la palette : terracotta, sauge, ambre. */
export const TINTS: readonly Tint[] = [
  { background: 'primaryMuted', foreground: 'primary' },
  { background: 'successMuted', foreground: 'success' },
  { background: 'ratingMuted', foreground: 'warning' },
];

/** Teinte à une position donnée (alternance régulière dans une liste). */
export function tintAt(index: number): Tint {
  const safe = Number.isFinite(index) ? Math.abs(Math.trunc(index)) : 0;
  return TINTS[safe % TINTS.length];
}

/** Teinte stable pour un texte : une même entreprise garde la même couleur partout. */
export function tintFor(seed: string): Tint {
  let hash = 0;
  for (const char of seed.trim().toLocaleLowerCase()) {
    hash = (hash * 31 + (char.codePointAt(0) ?? 0)) | 0;
  }
  return tintAt(hash);
}
