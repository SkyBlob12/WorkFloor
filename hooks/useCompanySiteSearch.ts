import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { SITE_SEARCH_MIN_LENGTH } from '@constants/companies';
import { queryKeys } from '@lib/queryKeys';
import { searchCompanySites } from '@services/sites';
import type { CompanySite } from '@app-types/domain';

const FIVE_MINUTES = 5 * 60_000;

/** Établissements SIRENE d'une entreprise pour le choix du site d'un avis. */
export function useCompanySiteSearch(company: { name: string; siren: string }, term: string): UseQueryResult<CompanySite[]> {
  return useQuery({
    queryKey: queryKeys.siteSearch(company.siren, term),
    queryFn: ({ signal }) => searchCompanySites(company, term, signal),
    enabled: term.length >= SITE_SEARCH_MIN_LENGTH,
    staleTime: FIVE_MINUTES,
  });
}
