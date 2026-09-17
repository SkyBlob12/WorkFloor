import type { CompanySite } from '@app-types/domain';

/** Établissement (partiel) renvoyé dans `matching_etablissements` par l'API Recherche d'entreprises. */
export interface SireneApiEstablishment {
  siret?: string | null;
  adresse?: string | null;
  code_postal?: string | null;
  libelle_commune?: string | null;
  etat_administratif?: string | null;
  est_siege?: boolean | null;
}

export interface SireneApiUnitWithSites {
  siren: string;
  matching_etablissements?: SireneApiEstablishment[] | null;
}

/**
 * Filtre saisi par l'utilisateur. Code postal et département sont filtrés par l'API (résultats
 * complets) ; un nom de ville est filtré localement parmi les établissements renvoyés.
 */
export type SiteFilter =
  | { kind: 'postalCode'; value: string }
  | { kind: 'department'; value: string }
  | { kind: 'city'; value: string };

const POSTAL_CODE_RE = /^\d{5}$/;
const DEPARTMENT_RE = /^(\d{2}|2[AB]|97\d)$/;

export function parseSiteFilter(query: string): SiteFilter {
  const compact = query.replace(/\s/g, '').toUpperCase();
  if (POSTAL_CODE_RE.test(compact)) return { kind: 'postalCode', value: compact };
  if (DEPARTMENT_RE.test(compact)) return { kind: 'department', value: compact };
  return { kind: 'city', value: query.trim() };
}

export function buildSiteSearchUrl(baseUrl: string, companyName: string, filter: SiteFilter, limit: number): string {
  const params = [`q=${encodeURIComponent(companyName)}`, 'per_page=25', `limite_matching_etablissements=${limit}`];
  if (filter.kind === 'postalCode') params.push(`code_postal=${filter.value}`);
  if (filter.kind === 'department') params.push(`departement=${filter.value}`);
  return `${baseUrl}?${params.join('&')}`;
}

/** Minuscules, sans accents, tirets et apostrophes remplacés par des espaces. */
export function normalizePlace(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function mapEstablishment(establishment: SireneApiEstablishment): CompanySite | null {
  if (!establishment.siret) return null;
  return {
    siret: establishment.siret,
    city: establishment.libelle_commune ?? null,
    postalCode: establishment.code_postal ?? null,
    address: establishment.adresse ?? null,
    isActive: establishment.etat_administratif === 'A',
    isHeadquarters: Boolean(establishment.est_siege),
  };
}

/** Établissements de l'entreprise `siren` correspondant au filtre : ouverts d'abord, puis par ville. */
export function selectCompanySites(
  results: readonly SireneApiUnitWithSites[],
  siren: string,
  filter: SiteFilter,
): CompanySite[] {
  const unit = results.find((result) => result.siren === siren);
  const sites = (unit?.matching_etablissements ?? []).map(mapEstablishment).filter((site) => site !== null);
  const needle = filter.kind === 'city' ? normalizePlace(filter.value) : '';
  return sites
    .filter((site) => !needle || normalizePlace(site.city ?? '').includes(needle))
    .sort(
      (a, b) =>
        Number(b.isActive) - Number(a.isActive) || (a.city ?? '').localeCompare(b.city ?? '') || a.siret.localeCompare(b.siret),
    );
}
