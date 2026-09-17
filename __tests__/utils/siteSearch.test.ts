import { buildSiteSearchUrl, normalizePlace, parseSiteFilter, selectCompanySites } from '@utils/siteSearch';

describe('parseSiteFilter', () => {
  it('reconnaît un code postal, un département ou une ville', () => {
    expect(parseSiteFilter('69 003')).toEqual({ kind: 'postalCode', value: '69003' });
    expect(parseSiteFilter('69')).toEqual({ kind: 'department', value: '69' });
    expect(parseSiteFilter('2a')).toEqual({ kind: 'department', value: '2A' });
    expect(parseSiteFilter('974')).toEqual({ kind: 'department', value: '974' });
    expect(parseSiteFilter(' Saint-Étienne ')).toEqual({ kind: 'city', value: 'Saint-Étienne' });
  });
});

describe('buildSiteSearchUrl', () => {
  it('filtre côté API par code postal ou département, jamais par ville', () => {
    const base = 'https://api.test/search';
    expect(buildSiteSearchUrl(base, 'CARREFOUR HYPERMARCHES', { kind: 'postalCode', value: '69003' }, 100)).toBe(
      'https://api.test/search?q=CARREFOUR%20HYPERMARCHES&per_page=25&limite_matching_etablissements=100&code_postal=69003',
    );
    expect(buildSiteSearchUrl(base, 'ACME', { kind: 'department', value: '2A' }, 50)).toContain('&departement=2A');
    expect(buildSiteSearchUrl(base, 'ACME', { kind: 'city', value: 'Lyon' }, 50)).not.toContain('Lyon');
  });
});

describe('normalizePlace', () => {
  it('ignore casse, accents, tirets et apostrophes', () => {
    expect(normalizePlace("VILLENEUVE-D'ASCQ")).toBe('villeneuve d ascq');
    expect(normalizePlace('Saint-Étienne')).toBe(normalizePlace('SAINT ETIENNE'));
  });
});

describe('selectCompanySites', () => {
  const results = [
    { siren: '999999999', matching_etablissements: [{ siret: '99999999900011', libelle_commune: 'LYON' }] },
    {
      siren: '451321335',
      matching_etablissements: [
        { siret: '45132133500437', libelle_commune: 'LYON', code_postal: '69003', etat_administratif: 'F' },
        { siret: '45132133500023', libelle_commune: 'EVRY-COURCOURONNES', code_postal: '91000', etat_administratif: 'A', est_siege: true },
        { siret: '45132133501955', libelle_commune: 'FRANCHEVILLE', code_postal: '69340', etat_administratif: 'A', adresse: '1 RUE X' },
        { siret: null, libelle_commune: 'LYON' },
      ],
    },
  ];

  it('garde les établissements de l’entreprise, ouverts d’abord puis par ville', () => {
    const sites = selectCompanySites(results, '451321335', { kind: 'department', value: '69' });
    expect(sites.map((site) => site.siret)).toEqual(['45132133500023', '45132133501955', '45132133500437']);
    expect(sites[0]).toEqual({
      siret: '45132133500023',
      city: 'EVRY-COURCOURONNES',
      postalCode: '91000',
      address: null,
      isActive: true,
      isHeadquarters: true,
    });
  });

  it('filtre localement par ville', () => {
    const sites = selectCompanySites(results, '451321335', { kind: 'city', value: 'lyon' });
    expect(sites.map((site) => site.siret)).toEqual(['45132133500437']);
    expect(sites[0].isActive).toBe(false);
  });

  it('renvoie une liste vide si l’entreprise est absente de la réponse', () => {
    expect(selectCompanySites(results, '123456789', { kind: 'city', value: '' })).toEqual([]);
  });
});
