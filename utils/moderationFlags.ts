import { isRecord } from './guards';

/** Indices relevés par submit-review (`reviews.moderation_flags`), normalisés pour l'écran de modération. */
export interface ModerationFlagSummary {
  bannedTerms: string[];
  aiCategories: string[];
  aiUnavailable: boolean;
  activitySignals: string[];
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function summarizeModerationFlags(flags: unknown): ModerationFlagSummary {
  if (!isRecord(flags)) return { bannedTerms: [], aiCategories: [], aiUnavailable: false, activitySignals: [] };
  return {
    bannedTerms: stringList(flags.banned_terms),
    aiCategories: stringList(flags.openai),
    aiUnavailable: flags.openai === 'unavailable',
    activitySignals: stringList(flags.activity_signals),
  };
}

export function hasModerationFlags(summary: ModerationFlagSummary): boolean {
  return (
    summary.bannedTerms.length > 0 ||
    summary.aiCategories.length > 0 ||
    summary.aiUnavailable ||
    summary.activitySignals.length > 0
  );
}
