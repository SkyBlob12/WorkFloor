import { REVIEWS_PAGE_SIZE } from '@constants/reviews';
import { supabase } from '@lib/supabase';
import type {
  OwnReview,
  PublicReview,
  ReviewDraft,
  ReviewSort,
  ReviewsPage,
  SubmitReviewResult,
} from '@app-types/domain';

import { ServiceError } from './errors';
import { invokeFunction } from './functions';

const OWN_REVIEW_COLUMNS = '*, company:companies(name), site:company_sites!reviews_site_same_company(siret, city, postal_code)';
const UNIQUE_VIOLATION = '23505';

export async function listCompanyReviews(
  companyId: string,
  sort: ReviewSort,
  city: string | null = null,
  offset = 0,
  limit = REVIEWS_PAGE_SIZE,
): Promise<ReviewsPage> {
  let query = supabase.from('reviews_public').select('*').eq('company_id', companyId);
  if (city) query = query.eq('site_city', city);
  query =
    sort === 'helpful'
      ? query.order('helpful_count', { ascending: false }).order('published_month', { ascending: false })
      : query.order('published_month', { ascending: false }).order('helpful_count', { ascending: false });

  const { data, error } = await query.order('id').range(offset, offset + limit - 1);
  if (error) throw new ServiceError('LOAD_FAILED');
  const reviews = (data ?? []) as PublicReview[];
  return { reviews, nextOffset: reviews.length === limit ? offset + limit : null };
}

export async function getMyReviewForCompany(companyId: string): Promise<OwnReview | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select(OWN_REVIEW_COLUMNS)
    .eq('company_id', companyId)
    .maybeSingle();
  if (error) throw new ServiceError('LOAD_FAILED');
  return data as OwnReview | null;
}

export async function listMyReviews(): Promise<OwnReview[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(OWN_REVIEW_COLUMNS)
    .order('created_at', { ascending: false });
  if (error) throw new ServiceError('LOAD_FAILED');
  return (data ?? []) as OwnReview[];
}

export interface SubmitReviewInput {
  companyId: string;
  reviewId: string | null;
  draft: ReviewDraft;
  /** Attestation sur l'honneur d'avoir travaillé dans l'entreprise, exigée par le serveur. */
  attested: boolean;
  /** SIRET du site où l'auteur a travaillé, vérifié dans SIRENE par le serveur. */
  siteSiret: string | null;
}

export async function submitReview(input: SubmitReviewInput): Promise<SubmitReviewResult> {
  return invokeFunction('submit-review', {
    ...input.draft,
    company_id: input.companyId,
    site_siret: input.siteSiret,
    review_id: input.reviewId,
    attested: input.attested,
  });
}

export async function deleteMyReview(reviewId: string): Promise<void> {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) throw new ServiceError('DELETE_FAILED');
}

export async function setHelpfulVote(reviewId: string, voted: boolean): Promise<void> {
  const { error } = voted
    ? await supabase.from('review_votes').insert({ review_id: reviewId })
    : await supabase.from('review_votes').delete().eq('review_id', reviewId);
  if (error && error.code !== UNIQUE_VIOLATION) throw new ServiceError('VOTE_FAILED');
}
