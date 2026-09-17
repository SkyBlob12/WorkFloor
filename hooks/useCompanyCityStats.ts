import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { isSupabaseConfigured } from '@lib/env';
import { queryKeys } from '@lib/queryKeys';
import { listCompanyCityStats } from '@services/sites';
import type { CityStat } from '@app-types/domain';

/** Villes d'une entreprise assez commentées pour être affichées (seuil d'anonymat appliqué en SQL). */
export function useCompanyCityStats(companyId: string | undefined): UseQueryResult<CityStat[]> {
  return useQuery({
    queryKey: queryKeys.companyCityStats(companyId ?? ''),
    queryFn: () => listCompanyCityStats(companyId ?? ''),
    enabled: isSupabaseConfigured && Boolean(companyId),
  });
}
