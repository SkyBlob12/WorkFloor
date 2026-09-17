import type { Company, NafSection } from '@app-types/domain';

import { nafSectionFromCode } from './naf';

/** Calculs de la page de découverte, à partir de l'annuaire chargé une fois. */
export interface CompanyFilters {
  sector: NafSection | null;
  city: string | null;
}

export interface Facet<T extends string> {
  value: T;
  count: number;
}

export interface DirectoryTotals {
  companies: number;
  reviews: number;
}

export const NO_FILTERS: CompanyFilters = { sector: null, city: null };

const cityOf = (company: Company): string | null => company.city?.trim() || null;

function countBy<T extends string>(values: readonly (T | null)[]): Facet<T>[] {
  const counts = new Map<T, number>();
  for (const value of values) if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

/** Secteurs représentés, du plus fourni au moins fourni. */
export function sectorFacets(companies: readonly Company[]): Facet<NafSection>[] {
  return countBy(companies.map((company) => nafSectionFromCode(company.naf_code)));
}

export function cityFacets(companies: readonly Company[], limit: number): Facet<string>[] {
  return countBy(companies.map(cityOf)).slice(0, limit);
}

/** Meilleure note moyenne, avec un minimum d'avis pour éviter qu'un seul avis à 5 étoiles domine. */
export function topRated(companies: readonly Company[], minReviews: number, limit: number): Company[] {
  return companies
    .filter((company) => company.avg_overall !== null && company.review_count >= minReviews)
    .sort((a, b) => (b.avg_overall ?? 0) - (a.avg_overall ?? 0) || b.review_count - a.review_count)
    .slice(0, limit);
}

/** Moins bonne note moyenne, avec le même minimum d'avis que `topRated`. */
export function worstRated(companies: readonly Company[], minReviews: number, limit: number): Company[] {
  return companies
    .filter((company) => company.avg_overall !== null && company.review_count >= minReviews)
    .sort((a, b) => (a.avg_overall ?? 0) - (b.avg_overall ?? 0) || b.review_count - a.review_count)
    .slice(0, limit);
}

export function mostReviewed(companies: readonly Company[], limit: number): Company[] {
  return [...companies]
    .sort((a, b) => b.review_count - a.review_count || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function filterCompanies(companies: readonly Company[], filters: CompanyFilters): Company[] {
  return companies.filter(
    (company) =>
      (filters.sector === null || nafSectionFromCode(company.naf_code) === filters.sector) &&
      (filters.city === null || cityOf(company) === filters.city),
  );
}

export function hasActiveFilters(filters: CompanyFilters): boolean {
  return filters.sector !== null || filters.city !== null;
}

export function directoryTotals(companies: readonly Company[]): DirectoryTotals {
  return {
    companies: companies.length,
    reviews: companies.reduce((sum, company) => sum + company.review_count, 0),
  };
}
