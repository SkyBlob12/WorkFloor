import { supabase } from '@lib/supabase';
import type { ModerationDecision, ModerationItem, ReportReason } from '@app-types/domain';

import { ServiceError } from './errors';

const UNIQUE_VIOLATION = '23505';
const INSUFFICIENT_PRIVILEGE = '42501';
const NO_DATA_FOUND = 'P0002';

export async function reportReview(reviewId: string, reason: ReportReason, details: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .insert({ review_id: reviewId, reason, details: details.trim() || null });
  if (error?.code === UNIQUE_VIOLATION) throw new ServiceError('ALREADY_REPORTED');
  if (error) throw new ServiceError('REPORT_FAILED');
}

/** L'identité de l'auteur n'étant jamais exposée, le blocage passe par l'id d'un de ses avis. */
export async function blockReviewAuthor(reviewId: string): Promise<void> {
  const { error } = await supabase.rpc('block_review_author', { p_review_id: reviewId });
  if (error) throw new ServiceError('BLOCK_FAILED');
}

export async function countBlockedAuthors(): Promise<number> {
  // `blocked_user_id` n'est pas lisible (anonymat) : `select('*')` serait refusé.
  const { count, error } = await supabase.from('user_blocks').select('blocker_id', { count: 'exact', head: true });
  if (error) throw new ServiceError('LOAD_FAILED');
  return count ?? 0;
}

export async function unblockAllAuthors(userId: string): Promise<void> {
  const { error } = await supabase.from('user_blocks').delete().eq('blocker_id', userId);
  if (error) throw new ServiceError('UNBLOCK_FAILED');
}

/** Vrai si le compte connecté figure dans `moderators`. L'accès réel est vérifié par chaque fonction SQL. */
export async function checkIsModerator(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_moderator');
  if (error) return false;
  return data === true;
}

export async function listModerationQueue(): Promise<ModerationItem[]> {
  const { data, error } = await supabase.rpc('moderation_queue');
  if (error?.code === INSUFFICIENT_PRIVILEGE) throw new ServiceError('FORBIDDEN');
  if (error) throw new ServiceError('LOAD_FAILED');
  return (data ?? []) as ModerationItem[];
}

export async function moderateReview(reviewId: string, decision: ModerationDecision): Promise<void> {
  const { error } = await supabase.rpc('moderate_review', { p_review_id: reviewId, p_decision: decision });
  if (error?.code === INSUFFICIENT_PRIVILEGE) throw new ServiceError('FORBIDDEN');
  if (error?.code === NO_DATA_FOUND) throw new ServiceError('REVIEW_NOT_FOUND');
  if (error) throw new ServiceError('MODERATION_FAILED');
}
