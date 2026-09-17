// Résolution du site d'un avis : SIRET vérifié dans SIRENE puis enregistré dans company_sites.
import { findVerifiedSite, siretBelongsTo, type SireneUnit } from './siteRules.ts';
import type { SupabaseClient } from './supabase.ts';

const SIRENE_SEARCH_URL = 'https://recherche-entreprises.api.gouv.fr/search';

export type SiteResolution = { ok: true; siteId: string | null } | { ok: false; code: string; status: number };

export async function resolveSite(
  admin: SupabaseClient,
  companyId: string,
  siret: string | null,
): Promise<SiteResolution> {
  if (!siret) return { ok: true, siteId: null };

  const { data: company } = await admin.from('companies').select('siren').eq('id', companyId).maybeSingle();
  if (!company) return { ok: false, code: 'COMPANY_NOT_FOUND', status: 404 };
  if (!siretBelongsTo(siret, company.siren)) return { ok: false, code: 'INVALID_SITE', status: 422 };

  const { data: known } = await admin
    .from('company_sites')
    .select('id, company_id')
    .eq('siret', siret)
    .maybeSingle();
  if (known) {
    return known.company_id === companyId ? { ok: true, siteId: known.id } : { ok: false, code: 'INVALID_SITE', status: 422 };
  }

  let results: SireneUnit[] | undefined;
  try {
    const res = await fetch(`${SIRENE_SEARCH_URL}?q=${siret}&per_page=5`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`SIRENE ${res.status}`);
    results = (await res.json()).results;
  } catch (error) {
    console.error('sirene site', error);
    return { ok: false, code: 'SIRENE_UNAVAILABLE', status: 503 };
  }

  const site = findVerifiedSite(results, company.siren, siret);
  if (!site) return { ok: false, code: 'SITE_NOT_FOUND', status: 404 };

  // Course entre deux avis sur le même site : on relit la ligne gagnante.
  const { error } = await admin
    .from('company_sites')
    .upsert({ ...site, company_id: companyId }, { onConflict: 'siret', ignoreDuplicates: true });
  if (error) {
    console.error('insert site', error);
    return { ok: false, code: 'SERVER_ERROR', status: 500 };
  }
  const { data: saved } = await admin.from('company_sites').select('id, company_id').eq('siret', siret).single();
  if (!saved || saved.company_id !== companyId) return { ok: false, code: 'INVALID_SITE', status: 422 };
  return { ok: true, siteId: saved.id };
}
