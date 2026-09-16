import { buildSireneSearchUrl, mapSireneResult } from '@utils/sirene';

describe('mapSireneResult', () => {
  it('normalise un résultat de l’API', () => {
    const company = mapSireneResult({
      siren: '306138900',
      nom_complet: 'DECATHLON',
      nature_juridique: '5800',
      activite_principale: '68.20B',
      section_activite_principale: 'L',
      etat_administratif: 'A',
      tranche_effectif_salarie: '52',
      siege: { siret: '30613890001294', code_postal: '59650', libelle_commune: "VILLENEUVE-D'ASCQ" },
    });
    expect(company).toEqual({
      siren: '306138900',
      siret: '30613890001294',
      name: 'DECATHLON',
      city: "VILLENEUVE-D'ASCQ",
      postalCode: '59650',
      nafCode: '68.20B',
      sectionCode: 'L',
      employeeRange: '52',
      isActive: true,
      isSoleProprietor: false,
    });
  });

  it('détecte un entrepreneur individuel et une entreprise fermée', () => {
    const company = mapSireneResult({ siren: '123456789', nature_juridique: '1000', etat_administratif: 'C' });
    expect(company.isSoleProprietor).toBe(true);
    expect(company.isActive).toBe(false);
    expect(company.name).toBe('123456789');
  });
});

describe('buildSireneSearchUrl', () => {
  it('encode la recherche', () => {
    expect(buildSireneSearchUrl('https://api.test/search', 'l’oréal & co')).toBe(
      'https://api.test/search?q=l%E2%80%99or%C3%A9al%20%26%20co&per_page=10',
    );
  });
});
