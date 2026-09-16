import type { SireneCompany } from '@app-types/domain';

/** Forme (partielle) d'un résultat de l'API Recherche d'entreprises. */
export interface SireneApiResult {
  siren: string;
  nom_complet?: string | null;
  nom_raison_sociale?: string | null;
  nature_juridique?: string | null;
  activite_principale?: string | null;
  section_activite_principale?: string | null;
  tranche_effectif_salarie?: string | null;
  etat_administratif?: string | null;
  complements?: { est_entrepreneur_individuel?: boolean | null } | null;
  siege?: { siret?: string | null; code_postal?: string | null; libelle_commune?: string | null } | null;
}

/** Catégorie juridique INSEE « entrepreneur individuel ». */
const SOLE_PROPRIETOR_LEGAL_CATEGORY = '1000';

export function mapSireneResult(result: SireneApiResult): SireneCompany {
  return {
    siren: result.siren,
    siret: result.siege?.siret ?? null,
    name: result.nom_complet ?? result.nom_raison_sociale ?? result.siren,
    city: result.siege?.libelle_commune ?? null,
    postalCode: result.siege?.code_postal ?? null,
    nafCode: result.activite_principale ?? null,
    sectionCode: result.section_activite_principale ?? null,
    employeeRange: result.tranche_effectif_salarie ?? null,
    isActive: result.etat_administratif === 'A',
    isSoleProprietor:
      Boolean(result.complements?.est_entrepreneur_individuel) ||
      result.nature_juridique === SOLE_PROPRIETOR_LEGAL_CATEGORY,
  };
}

export function buildSireneSearchUrl(baseUrl: string, query: string, perPage = 10): string {
  return `${baseUrl}?q=${encodeURIComponent(query)}&per_page=${perPage}`;
}
