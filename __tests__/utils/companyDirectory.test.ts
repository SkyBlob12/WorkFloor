import {
  cityFacets,
  directoryTotals,
  filterCompanies,
  hasActiveFilters,
  mostReviewed,
  NO_FILTERS,
  sectorFacets,
  topRated,
  worstRated,
} from '@utils/companyDirectory';
import type { Company } from '@app-types/domain';

function company(overrides: Partial<Company>): Company {
  return {
    id: overrides.name ?? 'id',
    siren: null,
    siret: null,
    name: 'Entreprise',
    naf_code: null,
    sector: null,
    city: null,
    postal_code: null,
    employee_range: null,
    is_active: true,
    verified: true,
    created_at: '2026-01-01',
    review_count: 0,
    avg_overall: null,
    avg_culture: null,
    avg_salary: null,
    avg_benefits: null,
    avg_management: null,
    avg_work_life: null,
    recommend_pct: null,
    under_review: false,
    ...overrides,
  };
}

const lumen = company({ name: 'Lumen', naf_code: '62.01Z', city: 'Lyon', review_count: 6, avg_overall: 4.3 });
const nordline = company({ name: 'Nordline', naf_code: '52.29B', city: 'Lille', review_count: 5, avg_overall: 2.4 });
const pixel = company({ name: 'Pixel', naf_code: '63.12Z', city: ' Lyon ', review_count: 1, avg_overall: 5 });
const pollen = company({ name: 'Pollen', naf_code: null, city: null });
const all = [pollen, pixel, nordline, lumen];

describe('facettes', () => {
  it('compte les secteurs et les villes, du plus fourni au moins fourni', () => {
    expect(sectorFacets(all)).toEqual([
      { value: 'J', count: 2 },
      { value: 'H', count: 1 },
    ]);
    expect(cityFacets(all, 1)).toEqual([{ value: 'Lyon', count: 2 }]);
  });
});

describe('classements', () => {
  it('exige un minimum d’avis pour les mieux notées', () => {
    expect(topRated(all, 2, 5).map((item) => item.name)).toEqual(['Lumen', 'Nordline']);
  });

  it('trie les plus commentées sans modifier la liste d’origine', () => {
    expect(mostReviewed(all, 3).map((item) => item.name)).toEqual(['Lumen', 'Nordline', 'Pixel']);
    expect(all[0]).toBe(pollen);
  });

  it('exige un minimum d’avis pour les moins bien notées', () => {
    expect(worstRated(all, 2, 5).map((item) => item.name)).toEqual(['Nordline', 'Lumen']);
  });
});

describe('filtres', () => {
  it('combine secteur et ville', () => {
    expect(filterCompanies(all, { sector: 'J', city: null }).map((item) => item.name)).toEqual(['Pixel', 'Lumen']);
    expect(filterCompanies(all, { sector: 'J', city: 'Lyon' })).toHaveLength(2);
    expect(filterCompanies(all, { sector: 'H', city: 'Lyon' })).toEqual([]);
    expect(hasActiveFilters(NO_FILTERS)).toBe(false);
    expect(hasActiveFilters({ sector: null, city: 'Lille' })).toBe(true);
  });

  it('additionne les totaux', () => {
    expect(directoryTotals(all)).toEqual({ companies: 4, reviews: 12 });
  });
});
