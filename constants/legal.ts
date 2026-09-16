/** Documents légaux publiés sous /legal/<doc>. Contenu : namespace i18n `legal`. */
export const LEGAL_DOCS = ['terms', 'privacy', 'notice'] as const;

export type LegalDoc = (typeof LEGAL_DOCS)[number];

export function isLegalDoc(value: string | undefined): value is LegalDoc {
  return (LEGAL_DOCS as readonly string[]).includes(value ?? '');
}
