import type { OwnReview } from '@app-types/domain';

import { isRecord } from './guards';

export const AUTH_PROVIDERS = ['email', 'google', 'apple'] as const;

export type AuthProvider = (typeof AUTH_PROVIDERS)[number];

export interface ProfileSummary {
  published: number;
  pending: number;
  helpful: number;
}

/** Fournisseur de connexion d'un utilisateur Supabase (`app_metadata.provider`), `null` si inconnu. */
export function authProviderOf(appMetadata: unknown): AuthProvider | null {
  if (!isRecord(appMetadata)) return null;
  const { provider } = appMetadata;
  return typeof provider === 'string' && (AUTH_PROVIDERS as readonly string[]).includes(provider)
    ? (provider as AuthProvider)
    : null;
}

/** Chiffres du profil : avis publiés, avis pas encore visibles, votes « utile » reçus sur les avis publiés. */
export function summarizeMyReviews(reviews: readonly OwnReview[] | undefined): ProfileSummary {
  const summary: ProfileSummary = { published: 0, pending: 0, helpful: 0 };
  for (const review of reviews ?? []) {
    if (review.status === 'published') {
      summary.published += 1;
      summary.helpful += review.helpful_count;
    } else if (review.status === 'pending') {
      summary.pending += 1;
    }
  }
  return summary;
}
