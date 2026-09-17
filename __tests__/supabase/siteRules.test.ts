import { findVerifiedSite, parseSiteInput, siretBelongsTo } from '@/supabase/functions/_shared/siteRules';

describe('parseSiteInput', () => {
  it('accepte l’absence de site', () => {
    expect(parseSiteInput(null)).toEqual({ ok: true, siret: null });
    expect(parseSiteInput(undefined)).toEqual({ ok: true, siret: null });
  });

  it('accepte un SIRET de 14 chiffres, espaces tolérés', () => {
    expect(parseSiteInput('451 321 335 00437')).toEqual({ ok: true, siret: '45132133500437' });
  });

  it('refuse tout le reste', () => {
    expect(parseSiteInput('4513213350043')).toEqual({ ok: false });
    expect(parseSiteInput(45132133500437)).toEqual({ ok: false });
    expect(parseSiteInput('')).toEqual({ ok: false });
  });
});

describe('siretBelongsTo', () => {
  it('vérifie que le SIRET commence par le SIREN de la fiche', () => {
    expect(siretBelongsTo('45132133500437', '451321335')).toBe(true);
    expect(siretBelongsTo('45132137601249', '451321335')).toBe(false);
    expect(siretBelongsTo('45132133500437', null)).toBe(false);
  });
});

describe('findVerifiedSite', () => {
  const results = [
    {
      siren: '451321335',
      matching_etablissements: [
        { siret: '45132133500437', libelle_commune: ' LYON ', code_postal: '69003', etat_administratif: 'A' },
      ],
    },
  ];

  it('retrouve l’établissement exact de la bonne entreprise', () => {
    expect(findVerifiedSite(results, '451321335', '45132133500437')).toEqual({
      siret: '45132133500437',
      city: 'LYON',
      postal_code: '69003',
      is_active: true,
    });
  });

  it('refuse un établissement absent ou rattaché à une autre entreprise', () => {
    expect(findVerifiedSite(results, '451321335', '45132133500023')).toBeNull();
    expect(findVerifiedSite(results, '999999999', '45132133500437')).toBeNull();
    expect(findVerifiedSite(undefined, '451321335', '45132133500437')).toBeNull();
  });

  it('écarte un code postal invalide plutôt que de rejeter le site', () => {
    const odd = [{ siren: '451321335', matching_etablissements: [{ siret: '45132133500437', code_postal: '6900' }] }];
    expect(findVerifiedSite(odd, '451321335', '45132133500437')).toMatchObject({ postal_code: null, city: null, is_active: false });
  });
});
