import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { isSupabaseConfigured } from '@lib/env';
import { queryKeys } from '@lib/queryKeys';
import { listCompanyDirectory } from '@services/companies';
import type { Company } from '@app-types/domain';

export function useCompanyDirectory(): UseQueryResult<Company[]> {
  return useQuery({
    queryKey: queryKeys.companyDirectory(),
    queryFn: () => listCompanyDirectory(),
    enabled: isSupabaseConfigured,
  });
}
