// Formatage pur : la locale est toujours passée par l'appelant (getIntlTag()).

/** Affiché quand une valeur n'existe pas encore. */
export const EMPTY_VALUE = '-';

export function formatRating(value: number | null, intlTag: string): string {
  if (value == null) return EMPTY_VALUE;
  return new Intl.NumberFormat(intlTag, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
}

export function formatInteger(value: number, intlTag: string): string {
  return new Intl.NumberFormat(intlTag).format(value);
}

/** `published_month` est une date SQL (AAAA-MM-01) : lue en UTC pour ne pas glisser au mois précédent. */
export function formatMonth(isoDate: string, intlTag: string): string {
  return new Intl.DateTimeFormat(intlTag, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(isoDate),
  );
}

export function formatSiren(siren: string): string {
  return siren.replace(/(\d{3})(?=\d)/g, '$1 ');
}

/** Monogramme : initiales des deux premiers mots (« Crédit Agricole » → « CA »), première lettre sinon. */
export function initialsOf(name: string): string {
  const words = name
    .split(/[\s\-'’&.,()]+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);
  if (words.length === 0) return EMPTY_VALUE;
  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toLocaleUpperCase();
}

/** Département à partir du code postal (2 premiers caractères). */
export function departmentFromPostalCode(postalCode: string | null): string | null {
  return postalCode ? postalCode.slice(0, 2) : null;
}
