import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { SIRENE_MIN_QUERY_LENGTH } from '@constants/companies';
import { queryKeys } from '@lib/queryKeys';
import { searchSirene } from '@services/companies';
import type { SireneCompany } from '@app-types/domain';

const FIVE_MINUTES = 5 * 60_000;

export function useSireneSearch(term: string): UseQueryResult<SireneCompany[]> {
  return useQuery({
    queryKey: queryKeys.sireneSearch(term),
    queryFn: ({ signal }) => searchSirene(term, signal),
    enabled: term.length >= SIRENE_MIN_QUERY_LENGTH,
    staleTime: FIVE_MINUTES,
  });
}
