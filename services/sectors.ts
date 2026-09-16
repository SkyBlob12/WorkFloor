import { supabase } from '@lib/supabase';
import { isNafSection } from '@utils/naf';
import type { SectorPhotos } from '@app-types/domain';

import { ServiceError } from './errors';

interface SectorPhotoRow {
  section: string;
  image_url: string;
}

/** Photos d'illustration des secteurs, indexées par section NAF. Les lignes inconnues sont ignorées. */
export async function listSectorPhotos(): Promise<SectorPhotos> {
  const { data, error } = await supabase.from('sector_photos').select('section, image_url');
  if (error) throw new ServiceError('LOAD_FAILED');
  const photos: SectorPhotos = {};
  for (const row of (data ?? []) as SectorPhotoRow[]) {
    if (isNafSection(row.section) && row.image_url) photos[row.section] = row.image_url;
  }
  return photos;
}
