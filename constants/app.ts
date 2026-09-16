// Boîte de réception uniquement : Tuta n'a pas de SMTP, les emails d'auth partent d'une autre adresse (LANCEMENT.md étape 4).
export const APP = {
  /** Nom propre : jamais traduit. */
  name: 'WorkFloor',
  /** Découpage du logotype de la barre de navigation. */
  wordmark: { start: 'Work', accent: 'Floor', end: '' },
  contactEmail: 'workfloor@tutamail.com',
  /** Adresse des notifications de contenus illicites (LCEN / DSA). */
  abuseEmail: 'workfloor@tutamail.com',
  /** Pages publiques (assistance, documents légaux) exigées par les stores : GitHub Pages. */
  publicSiteUrl: 'https://skyblob12.github.io/WorkFloor',
} as const;
