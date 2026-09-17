// Accès SQL de la détection des campagnes (migration 20260917000000_review_trust).
// En cas d'erreur, on laisse passer (fail-open) : les autres garde-fous restent actifs.
import type { SupabaseClient } from './supabase.ts';
import type { ActivitySignal, CompanyActivityStats } from './trust.ts';

export async function loadActivityStats(
  admin: SupabaseClient,
  opts: { companyId: string; userId: string; text: string },
): Promise<CompanyActivityStats | null> {
  const { data, error } = await admin.rpc('company_activity_stats', {
    p_company_id: opts.companyId,
    p_user_id: opts.userId,
    p_text: opts.text,
  });
  if (error || !data) {
    console.error('company_activity_stats', error);
    return null;
  }
  return data as CompanyActivityStats;
}

export async function openCompanyWatch(admin: SupabaseClient, companyId: string, signals: ActivitySignal[]) {
  const { error } = await admin.rpc('open_company_watch', { p_company_id: companyId, p_signals: signals });
  if (error) console.error('open_company_watch', error);
}
