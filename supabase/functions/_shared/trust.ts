// Règles anti-faux avis : fonctions pures, sans import Deno (testées par Jest dans __tests__/supabase).
// Les fenêtres temporelles des statistiques sont calculées en SQL (company_activity_stats) :
// garder WINDOW_DAYS et BASELINE_WEEKS synchronisés avec la migration 20260917000000_review_trust.

export const TRUST_RULES = {
  /** Fenêtre observée pour détecter un pic (jours). */
  WINDOW_DAYS: 7,
  /** Historique de référence avant la fenêtre (semaines). */
  BASELINE_WEEKS: 12,
  /** Un compte plus jeune que ce délai voit son avis publié à la fin du délai. */
  NEW_ACCOUNT_HOLD_HOURS: 24,
  /** Un compte plus jeune que ce délai compte pour NEW_ACCOUNT_WEIGHT dans les moyennes. */
  NEW_ACCOUNT_WEIGHT_DAYS: 7,
  NEW_ACCOUNT_WEIGHT: 0.5,
  /** Pic : au moins SPIKE_MIN avis dans la fenêtre et SPIKE_FACTOR fois le rythme habituel. */
  SPIKE_MIN: 4,
  SPIKE_FACTOR: 3,
  /** Pic massif, suspect à lui seul. */
  SURGE_MIN: 10,
  SURGE_FACTOR: 5,
  NEW_ACCOUNT_SHARE: 0.6,
  EXTREME_SHARE: 0.8,
  /** Similarité trigramme (pg_trgm) à partir de laquelle deux avis sont jugés recopiés. */
  SIMILAR_TEXT: 0.5,
  /** Auteurs distincts derrière une même IP hachée (seuil haut : les réseaux mobiles partagent des IP). */
  SHARED_NETWORK: 3,
} as const;

/** Statistiques renvoyées par `company_activity_stats`, hors avis en cours d'envoi. */
export interface CompanyActivityStats {
  recent_count: number;
  recent_new_accounts: number;
  recent_extreme: number;
  baseline_count: number;
  max_similarity: number;
  max_reviewers_per_network: number;
  active_watch: boolean;
}

export interface IncomingReview {
  ratingOverall: number;
  accountAgeHours: number;
}

export type ActivitySignal =
  | 'already_watched'
  | 'volume_spike'
  | 'volume_surge'
  | 'new_accounts'
  | 'extreme_ratings'
  | 'similar_text'
  | 'shared_network';

export interface ActivityAssessment {
  surge: boolean;
  signals: ActivitySignal[];
}

export type HoldReason = 'new_account' | 'company_surge';

export interface HoldDecision {
  status: 'published' | 'pending';
  holdReason: HoldReason | null;
  heldUntil: string | null;
}

const HOUR_MS = 3_600_000;

export function accountAgeHours(createdAt: string, now: Date): number {
  const created = Date.parse(createdAt);
  return Number.isFinite(created) ? Math.max(0, (now.getTime() - created) / HOUR_MS) : 0;
}

export function trustWeight(ageHours: number): number {
  return ageHours < TRUST_RULES.NEW_ACCOUNT_WEIGHT_DAYS * 24 ? TRUST_RULES.NEW_ACCOUNT_WEIGHT : 1;
}

/** Évalue l'activité d'une entreprise en y ajoutant l'avis en cours d'envoi. */
export function assessCompanyActivity(stats: CompanyActivityStats, incoming: IncomingReview): ActivityAssessment {
  const total = stats.recent_count + 1;
  const weeklyBaseline = stats.baseline_count / TRUST_RULES.BASELINE_WEEKS;
  const isNew = incoming.accountAgeHours < TRUST_RULES.NEW_ACCOUNT_WEIGHT_DAYS * 24;
  const isExtreme = incoming.ratingOverall === 1 || incoming.ratingOverall === 5;

  const spike = total >= Math.max(TRUST_RULES.SPIKE_MIN, TRUST_RULES.SPIKE_FACTOR * weeklyBaseline);
  const massive = total >= Math.max(TRUST_RULES.SURGE_MIN, TRUST_RULES.SURGE_FACTOR * weeklyBaseline);
  const newShare = (stats.recent_new_accounts + (isNew ? 1 : 0)) / total;
  const extremeShare = (stats.recent_extreme + (isExtreme ? 1 : 0)) / total;
  const reviewersOnNetwork = stats.max_reviewers_per_network;

  const signals: ActivitySignal[] = [];
  if (stats.active_watch) signals.push('already_watched');
  if (massive) signals.push('volume_surge');
  else if (spike) signals.push('volume_spike');
  if (newShare >= TRUST_RULES.NEW_ACCOUNT_SHARE && total > 1) signals.push('new_accounts');
  if (extremeShare >= TRUST_RULES.EXTREME_SHARE && total > 1) signals.push('extreme_ratings');
  if (stats.max_similarity >= TRUST_RULES.SIMILAR_TEXT) signals.push('similar_text');
  if (reviewersOnNetwork >= TRUST_RULES.SHARED_NETWORK) signals.push('shared_network');

  const corroborated = signals.some((signal) =>
    ['new_accounts', 'extreme_ratings', 'shared_network'].includes(signal),
  );
  const surge =
    stats.active_watch ||
    massive ||
    signals.includes('similar_text') ||
    (spike && corroborated);

  return { surge, signals };
}

/**
 * Statut d'un nouvel avis. La relecture demandée par la modération prime (hold_reason nul :
 * jamais publié automatiquement), puis la surveillance de l'entreprise, puis l'âge du compte.
 */
export function decideHold(input: {
  moderation: 'allow' | 'review';
  surge: boolean;
  accountCreatedAt: string;
  now: Date;
}): HoldDecision {
  if (input.moderation === 'review') return { status: 'pending', holdReason: null, heldUntil: null };
  if (input.surge) return { status: 'pending', holdReason: 'company_surge', heldUntil: null };

  const ageHours = accountAgeHours(input.accountCreatedAt, input.now);
  if (ageHours < TRUST_RULES.NEW_ACCOUNT_HOLD_HOURS) {
    const releaseAt = input.now.getTime() + (TRUST_RULES.NEW_ACCOUNT_HOLD_HOURS - ageHours) * HOUR_MS;
    return { status: 'pending', holdReason: 'new_account', heldUntil: new Date(releaseAt).toISOString() };
  }
  return { status: 'published', holdReason: null, heldUntil: null };
}
