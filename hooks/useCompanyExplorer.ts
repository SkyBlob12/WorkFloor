import { useCallback, useMemo, useState } from 'react';

import {
  CITY_FACET_LIMIT,
  HOME_CAROUSEL_SIZE,
  MOST_REVIEWED_LIMIT,
  SEARCH_DEBOUNCE_MS,
  TOP_RATED_MIN_REVIEWS,
  WORST_RATED_MIN_REVIEWS,
} from '@constants/companies';
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
  type CompanyFilters,
  type DirectoryTotals,
  type Facet,
} from '@utils/companyDirectory';
import type { Company, NafSection } from '@app-types/domain';

import { useCompanyDirectory } from './useCompanyDirectory';
import { useCompanySearch } from './useCompanySearch';
import { useDebouncedValue } from './useDebouncedValue';

export interface CompanyExplorerState {
  query: string;
  setQuery: (value: string) => void;
  term: string;
  filters: CompanyFilters;
  toggleSector: (sector: NafSection) => void;
  toggleCity: (city: string) => void;
  clearFilters: () => void;
  /** `discover` : page d'accueil (sections) ; `results` : recherche ou filtre actif. */
  mode: 'discover' | 'results';
  sectors: Facet<NafSection>[];
  cities: Facet<string>[];
  topRated: Company[];
  worstRated: Company[];
  totals: DirectoryTotals;
  items: Company[];
  loading: boolean;
  /** Données reçues : un état vide peut être affiché. */
  ready: boolean;
}

const EMPTY: Company[] = [];

export function useCompanyExplorer(): CompanyExplorerState {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<CompanyFilters>(NO_FILTERS);
  const term = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const directory = useCompanyDirectory();
  const search = useCompanySearch(term, term.length > 0);
  const companies = directory.data ?? EMPTY;
  const mode = term || hasActiveFilters(filters) ? 'results' : 'discover';

  const discovery = useMemo(
    () => ({
      sectors: sectorFacets(companies),
      cities: cityFacets(companies, CITY_FACET_LIMIT),
      topRated: topRated(companies, TOP_RATED_MIN_REVIEWS, HOME_CAROUSEL_SIZE),
      worstRated: worstRated(companies, WORST_RATED_MIN_REVIEWS, HOME_CAROUSEL_SIZE),
      totals: directoryTotals(companies),
    }),
    [companies],
  );

  const items = useMemo(() => {
    if (mode === 'discover') return mostReviewed(companies, MOST_REVIEWED_LIMIT);
    return filterCompanies(term ? (search.data ?? EMPTY) : companies, filters);
  }, [mode, companies, term, search.data, filters]);

  const toggleSector = useCallback(
    (sector: NafSection) => setFilters((current) => ({ ...current, sector: current.sector === sector ? null : sector })),
    [],
  );
  const toggleCity = useCallback(
    (city: string) => setFilters((current) => ({ ...current, city: current.city === city ? null : city })),
    [],
  );
  const clearFilters = useCallback(() => setFilters(NO_FILTERS), []);

  return {
    query,
    setQuery,
    term,
    filters,
    toggleSector,
    toggleCity,
    clearFilters,
    mode,
    ...discovery,
    items,
    loading: term ? search.isFetching : directory.isFetching,
    ready: term ? search.data !== undefined : directory.data !== undefined,
  };
}
