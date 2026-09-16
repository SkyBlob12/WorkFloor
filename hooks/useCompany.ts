import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { isSupabaseConfigured } from '@lib/env';
import { queryKeys } from '@lib/queryKeys';
import { getCompany } from '@services/companies';
import type { Company } from '@app-types/domain';

export function useCompany(id: string | undefined): UseQueryResult<Company | null> {
  return useQuery({
    queryKey: queryKeys.company(id ?? ''),
    queryFn: () => getCompany(id ?? ''),
    enabled: isSupabaseConfigured && Boolean(id),
  });
}
