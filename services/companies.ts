import { DIRECTORY_LIMIT, SEARCH_RESULTS_LIMIT, SIRENE_SEARCH_URL } from '@constants/companies';
import { supabase } from '@lib/supabase';
import { buildSireneSearchUrl, mapSireneResult, type SireneApiResult } from '@utils/sirene';
import type { Company, SireneCompany } from '@app-types/domain';

import { ServiceError } from './errors';
import { invokeFunction } from './functions';

export async function searchCompanies(query: string, limit = SEARCH_RESULTS_LIMIT): Promise<Company[]> {
  const { data, error } = await supabase.rpc('search_companies', { p_query: query, p_limit: limit });
  if (error) throw new ServiceError('SEARCH_FAILED');
  return (data ?? []) as Company[];
}

/** Annuaire pour la page de découverte : les fiches les plus commentées d'abord. */
export async function listCompanyDirectory(limit = DIRECTORY_LIMIT): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies_with_stats')
    .select('*')
    .order('review_count', { ascending: false })
    .order('name')
    .limit(limit);
  if (error) throw new ServiceError('LOAD_FAILED');
  return (data ?? []) as Company[];
}

export async function getCompany(id: string): Promise<Company | null> {
  const { data, error } = await supabase.from('companies_with_stats').select('*').eq('id', id).maybeSingle();
  if (error) throw new ServiceError('LOAD_FAILED');
  return data as Company | null;
}

export async function createCompanyFromSiren(siren: string): Promise<{ id: string; created: boolean }> {
  return invokeFunction('create-company', { siren });
}

/** Répertoire SIRENE : API publique appelée directement (CORS ouvert, sans clé). */
export async function searchSirene(query: string, signal?: AbortSignal): Promise<SireneCompany[]> {
  let response: Response;
  try {
    response = await fetch(buildSireneSearchUrl(SIRENE_SEARCH_URL, query), {
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new ServiceError('NETWORK');
  }
  if (response.status === 429) throw new ServiceError('SIRENE_RATE_LIMITED');
  if (!response.ok) throw new ServiceError('SIRENE_UNAVAILABLE');

  const payload = (await response.json()) as { results?: SireneApiResult[] };
  return (payload.results ?? []).map(mapSireneResult);
}
