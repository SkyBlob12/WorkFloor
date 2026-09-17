import { listCompanyCityStats, searchCompanySites } from '@services/sites';

import { mockSupabaseResult, resetSupabaseMock, supabase } from '../mocks/supabase';

const company = { name: 'CARREFOUR HYPERMARCHES', siren: '451321335' };
const fetchMock = jest.fn();

function respond(status: number, body: unknown = {}) {
  fetchMock.mockResolvedValueOnce({ ok: status < 400, status, json: () => Promise.resolve(body) });
}

describe('searchCompanySites', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock;
  });

  it('interroge l’API avec le filtre et renvoie les établissements de l’entreprise', async () => {
    respond(200, {
      results: [
        { siren: '451321335', matching_etablissements: [{ siret: '45132133500437', libelle_commune: 'LYON', code_postal: '69003' }] },
      ],
    });
    const sites = await searchCompanySites(company, '69003');
    expect(fetchMock.mock.calls[0][0]).toContain('code_postal=69003');
    expect(sites).toHaveLength(1);
    expect(sites[0]).toMatchObject({ siret: '45132133500437', city: 'LYON' });
  });

  it('convertit les échecs en codes stables', async () => {
    respond(429);
    await expect(searchCompanySites(company, 'Lyon')).rejects.toMatchObject({ code: 'SIRENE_RATE_LIMITED' });
    respond(500);
    await expect(searchCompanySites(company, 'Lyon')).rejects.toMatchObject({ code: 'SIRENE_UNAVAILABLE' });
    fetchMock.mockRejectedValueOnce(new TypeError('offline'));
    await expect(searchCompanySites(company, 'Lyon')).rejects.toMatchObject({ code: 'NETWORK' });
  });
});

describe('listCompanyCityStats', () => {
  beforeEach(() => resetSupabaseMock());

  it('appelle la fonction SQL de la fiche', async () => {
    mockSupabaseResult({ data: [{ city: 'LYON', review_count: 3, avg_overall: 4.2 }] });
    await expect(listCompanyCityStats('c1')).resolves.toEqual([{ city: 'LYON', review_count: 3, avg_overall: 4.2 }]);
    expect(supabase.rpc).toHaveBeenCalledWith('company_city_stats', { p_company_id: 'c1' });
  });

  it('convertit une erreur en code stable', async () => {
    mockSupabaseResult({ error: { code: 'XX000' } });
    await expect(listCompanyCityStats('c1')).rejects.toMatchObject({ code: 'LOAD_FAILED' });
  });
});
