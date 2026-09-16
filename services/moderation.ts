import { supabase } from '@lib/supabase';
import type { ReportReason } from '@app-types/domain';

import { ServiceError } from './errors';

const UNIQUE_VIOLATION = '23505';

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
  const { count, error } = await supabase.from('user_blocks').select('*', { count: 'exact', head: true });
  if (error) throw new ServiceError('LOAD_FAILED');
  return count ?? 0;
}

export async function unblockAllAuthors(userId: string): Promise<void> {
  const { error } = await supabase.from('user_blocks').delete().eq('blocker_id', userId);
  if (error) throw new ServiceError('UNBLOCK_FAILED');
}
