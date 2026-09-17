// Établissement désigné par un avis : fonctions pures, sans import Deno (testées par Jest dans __tests__/supabase).

export interface SireneEstablishment {
  siret?: string | null;
  libelle_commune?: string | null;
  code_postal?: string | null;
  etat_administratif?: string | null;
}

export interface SireneUnit {
  siren: string;
  matching_etablissements?: SireneEstablishment[] | null;
}

export interface VerifiedSite {
  siret: string;
  city: string | null;
  postal_code: string | null;
  is_active: boolean;
}

export type SiteInput = { ok: true; siret: string | null } | { ok: false };

const SIRET_RE = /^\d{14}$/;
const POSTAL_CODE_RE = /^[0-9A-Z]{5}$/;
const CITY_MAX = 100;

/** `site_siret` absent ou null : avis sans site. Sinon 14 chiffres (espaces tolérés). */
export function parseSiteInput(value: unknown): SiteInput {
  if (value === null || value === undefined) return { ok: true, siret: null };
  if (typeof value !== 'string') return { ok: false };
  const siret = value.replace(/\s/g, '');
  return SIRET_RE.test(siret) ? { ok: true, siret } : { ok: false };
}

/** Un SIRET commence par le SIREN de son entreprise. */
export function siretBelongsTo(siret: string, siren: string | null): boolean {
  return Boolean(siren) && siret.startsWith(siren as string);
}

/** Retrouve l'établissement exact dans une réponse de l'API Recherche d'entreprises (`q=<siret>`). */
export function findVerifiedSite(results: SireneUnit[] | null | undefined, siren: string, siret: string): VerifiedSite | null {
  const unit = (results ?? []).find((result) => result.siren === siren);
  const site = unit?.matching_etablissements?.find((establishment) => establishment.siret === siret);
  if (!site) return null;
  const city = site.libelle_commune?.trim() || null;
  const postalCode = site.code_postal?.trim() ?? '';
  return {
    siret,
    city: city ? city.slice(0, CITY_MAX) : null,
    postal_code: POSTAL_CODE_RE.test(postalCode) ? postalCode : null,
    is_active: site.etat_administratif === 'A',
  };
}
