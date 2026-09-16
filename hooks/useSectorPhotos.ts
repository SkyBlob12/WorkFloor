import { useQuery } from '@tanstack/react-query';

import { SECTOR_PHOTOS_STALE_MS } from '@constants/companies';
import { isSupabaseConfigured } from '@lib/env';
import { queryKeys } from '@lib/queryKeys';
import { listSectorPhotos } from '@services/sectors';
import type { SectorPhotos } from '@app-types/domain';

const NO_PHOTOS: SectorPhotos = {};

/** Photos des cartes de secteur. Décoratives : en cas d'échec, les cartes gardent leur pictogramme, sans toast. */
export function useSectorPhotos(): SectorPhotos {
  const { data } = useQuery({
    queryKey: queryKeys.sectorPhotos(),
    queryFn: listSectorPhotos,
    enabled: isSupabaseConfigured,
    staleTime: SECTOR_PHOTOS_STALE_MS,
    retry: false,
    meta: { inlineError: true },
  });
  return data ?? NO_PHOTOS;
}
