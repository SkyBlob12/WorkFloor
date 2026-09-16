import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { isSupabaseConfigured } from '@lib/env';
import { queryKeys } from '@lib/queryKeys';
import { searchCompanies } from '@services/companies';
import type { Company } from '@app-types/domain';

export function useCompanySearch(term: string, enabled = true): UseQueryResult<Company[]> {
  return useQuery({
    queryKey: queryKeys.companySearch(term),
    queryFn: () => searchCompanies(term),
    enabled: isSupabaseConfigured && enabled,
    placeholderData: keepPreviousData,
  });
}
