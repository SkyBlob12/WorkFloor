import {
  accountAgeHours,
  assessCompanyActivity,
  decideHold,
  trustWeight,
  type CompanyActivityStats,
} from '@/supabase/functions/_shared/trust';

const NOW = new Date('2026-09-17T12:00:00Z');
const OLD_ACCOUNT = { ratingOverall: 3, accountAgeHours: 24 * 90 };

function stats(overrides: Partial<CompanyActivityStats> = {}): CompanyActivityStats {
  return {
    recent_count: 0,
    recent_new_accounts: 0,
    recent_extreme: 0,
    baseline_count: 0,
    max_similarity: 0,
    max_reviewers_per_network: 0,
    active_watch: false,
    ...overrides,
  };
}

describe('ancienneté et poids des comptes', () => {
  it('calcule l’âge du compte en heures, jamais négatif', () => {
    expect(accountAgeHours('2026-09-17T06:00:00Z', NOW)).toBe(6);
    expect(accountAgeHours('2026-09-18T06:00:00Z', NOW)).toBe(0);
    expect(accountAgeHours('pas une date', NOW)).toBe(0);
  });

  it('divise par deux le poids d’un compte de moins de 7 jours', () => {
    expect(trustWeight(24 * 6)).toBe(0.5);
    expect(trustWeight(24 * 7)).toBe(1);
  });
});

describe('assessCompanyActivity', () => {
  it('ne signale rien pour une activité habituelle', () => {
    expect(assessCompanyActivity(stats({ recent_count: 1, baseline_count: 12 }), OLD_ACCOUNT)).toEqual({
      surge: false,
      signals: [],
    });
  });

  it('ne gèle pas un pic seul, sans autre indice', () => {
    const result = assessCompanyActivity(stats({ recent_count: 4 }), OLD_ACCOUNT);
    expect(result).toEqual({ surge: false, signals: ['volume_spike'] });
  });

  it('gèle un pic porté par des comptes récents', () => {
    const result = assessCompanyActivity(stats({ recent_count: 4, recent_new_accounts: 3 }), {
      ratingOverall: 3,
      accountAgeHours: 2,
    });
    expect(result.surge).toBe(true);
    expect(result.signals).toEqual(['volume_spike', 'new_accounts']);
  });

  it('gèle un pic de notes extrêmes', () => {
    const result = assessCompanyActivity(stats({ recent_count: 5, recent_extreme: 5 }), {
      ratingOverall: 1,
      accountAgeHours: 24 * 90,
    });
    expect(result).toEqual({ surge: true, signals: ['volume_spike', 'extreme_ratings'] });
  });

  it('tient compte du rythme habituel de l’entreprise', () => {
    // 60 avis en 12 semaines : 5 par semaine, 6 cette semaine n'est pas un pic.
    const result = assessCompanyActivity(stats({ recent_count: 5, recent_new_accounts: 5, baseline_count: 60 }), {
      ratingOverall: 3,
      accountAgeHours: 1,
    });
    expect(result.surge).toBe(false);
    expect(result.signals).toEqual(['new_accounts']);
  });

  it('gèle un pic massif à lui seul', () => {
    const result = assessCompanyActivity(stats({ recent_count: 9 }), OLD_ACCOUNT);
    expect(result).toEqual({ surge: true, signals: ['volume_surge'] });
  });

  it('gèle un texte recopié même sans pic', () => {
    const result = assessCompanyActivity(stats({ recent_count: 1, max_similarity: 0.72 }), OLD_ACCOUNT);
    expect(result).toEqual({ surge: true, signals: ['similar_text'] });
  });

  it('exige plusieurs auteurs sur le même réseau avant de le signaler', () => {
    expect(assessCompanyActivity(stats({ max_reviewers_per_network: 2 }), OLD_ACCOUNT).signals).toEqual([]);
    const result = assessCompanyActivity(stats({ recent_count: 3, max_reviewers_per_network: 3 }), OLD_ACCOUNT);
    expect(result).toEqual({ surge: true, signals: ['volume_spike', 'shared_network'] });
  });

  it('garde en attente tant qu’une surveillance est ouverte', () => {
    expect(assessCompanyActivity(stats({ active_watch: true }), OLD_ACCOUNT)).toEqual({
      surge: true,
      signals: ['already_watched'],
    });
  });

  it('ignore les parts sur un avis isolé', () => {
    expect(assessCompanyActivity(stats(), { ratingOverall: 5, accountAgeHours: 1 }).signals).toEqual([]);
  });
});

describe('decideHold', () => {
  const base = { moderation: 'allow' as const, surge: false, accountCreatedAt: '2026-01-01T00:00:00Z', now: NOW };

  it('publie l’avis d’un compte ancien', () => {
    expect(decideHold(base)).toEqual({ status: 'published', holdReason: null, heldUntil: null });
  });

  it('diffère l’avis d’un compte récent jusqu’à ses 24 heures', () => {
    expect(decideHold({ ...base, accountCreatedAt: '2026-09-17T02:00:00Z' })).toEqual({
      status: 'pending',
      holdReason: 'new_account',
      heldUntil: '2026-09-18T02:00:00.000Z',
    });
  });

  it('retient l’avis quand l’entreprise est surveillée', () => {
    expect(decideHold({ ...base, surge: true })).toEqual({
      status: 'pending',
      holdReason: 'company_surge',
      heldUntil: null,
    });
  });

  it('laisse la relecture humaine primer, sans publication automatique', () => {
    expect(decideHold({ ...base, moderation: 'review', surge: true })).toEqual({
      status: 'pending',
      holdReason: null,
      heldUntil: null,
    });
  });
});
