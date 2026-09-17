import { SIRENE_SEARCH_URL, SITE_SEARCH_API_LIMIT } from '@constants/companies';
import { supabase } from '@lib/supabase';
import { buildSiteSearchUrl, parseSiteFilter, selectCompanySites, type SireneApiUnitWithSites } from '@utils/siteSearch';
import type { CityStat, CompanySite } from '@app-types/domain';

import { ServiceError } from './errors';

/** Établissements SIRENE d'une entreprise, filtrés par ville, code postal ou département. */
export async function searchCompanySites(
  company: { name: string; siren: string },
  query: string,
  signal?: AbortSignal,
): Promise<CompanySite[]> {
  const filter = parseSiteFilter(query);
  let response: Response;
  try {
    response = await fetch(buildSiteSearchUrl(SIRENE_SEARCH_URL, company.name, filter, SITE_SEARCH_API_LIMIT), {
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new ServiceError('NETWORK');
  }
  if (response.status === 429) throw new ServiceError('SIRENE_RATE_LIMITED');
  if (!response.ok) throw new ServiceError('SIRENE_UNAVAILABLE');

  const payload = (await response.json()) as { results?: SireneApiUnitWithSites[] };
  return selectCompanySites(payload.results ?? [], company.siren, filter);
}

/** Note par ville (seules les villes au-delà du seuil d'anonymat sont renvoyées). */
export async function listCompanyCityStats(companyId: string): Promise<CityStat[]> {
  const { data, error } = await supabase.rpc('company_city_stats', { p_company_id: companyId });
  if (error) throw new ServiceError('LOAD_FAILED');
  return (data ?? []) as CityStat[];
}
