import { hasModerationFlags, summarizeModerationFlags } from '@utils/moderationFlags';

describe('summarizeModerationFlags', () => {
  it('renvoie un résumé vide pour une valeur absente ou mal formée', () => {
    const summary = summarizeModerationFlags(null);
    expect(summary).toEqual({ bannedTerms: [], aiCategories: [], aiUnavailable: false, activitySignals: [] });
    expect(hasModerationFlags(summary)).toBe(false);
    expect(hasModerationFlags(summarizeModerationFlags('texte'))).toBe(false);
  });

  it('lit les mots surveillés, les catégories IA et les signaux d’activité', () => {
    const summary = summarizeModerationFlags({
      banned_terms: ['arnaque', 3],
      openai: ['harassment'],
      activity_signals: ['volume_spike'],
    });
    expect(summary).toEqual({
      bannedTerms: ['arnaque'],
      aiCategories: ['harassment'],
      aiUnavailable: false,
      activitySignals: ['volume_spike'],
    });
    expect(hasModerationFlags(summary)).toBe(true);
  });

  it('signale une analyse IA indisponible', () => {
    const summary = summarizeModerationFlags({ banned_terms: [], openai: 'unavailable' });
    expect(summary.aiUnavailable).toBe(true);
    expect(summary.aiCategories).toEqual([]);
    expect(hasModerationFlags(summary)).toBe(true);
  });
});
