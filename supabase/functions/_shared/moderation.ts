import type { SupabaseClient } from './supabase.ts';

export type ModerationOutcome =
  | { decision: 'allow'; flags: Record<string, unknown> | null }
  | { decision: 'review'; flags: Record<string, unknown> }
  | { decision: 'reject'; code: 'PERSONAL_DATA' | 'BANNED_TERM' | 'CONTENT_POLICY' };

type BannedTerm = { term: string; action: 'reject' | 'review' };

const EMAIL_RE = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[a-z]{2,}/iu;
const PHONE_RE = /(?:\+33|0033|\b0)\s?[1-9](?:[\s.-]?\d{2}){4}\b/;

/** Catégories OpenAI refusées d'emblée ; les autres signalements passent en relecture. */
const SEVERE_CATEGORIES = new Set([
  'harassment/threatening',
  'hate/threatening',
  'illicit/violent',
  'sexual/minors',
  'self-harm/instructions',
  'violence/graphic',
]);

let termsCache: { loadedAt: number; terms: BannedTerm[] } | null = null;

function normalize(text: string) {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function loadBannedTerms(admin: SupabaseClient): Promise<BannedTerm[]> {
  if (termsCache && Date.now() - termsCache.loadedAt < 5 * 60_000) return termsCache.terms;
  const { data, error } = await admin.from('banned_terms').select('term, action');
  if (error) {
    console.error('banned_terms', error);
    return termsCache?.terms ?? [];
  }
  termsCache = { loadedAt: Date.now(), terms: (data ?? []) as BannedTerm[] };
  return termsCache.terms;
}

async function openAiModeration(text: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return null;
  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: text }),
    });
    if (!res.ok) {
      console.error('openai moderation', res.status, await res.text());
      return null;
    }
    const result = (await res.json()).results?.[0];
    if (!result) return null;
    const categories = Object.entries(result.categories ?? {})
      .filter(([, flagged]) => flagged === true)
      .map(([name]) => name);
    return {
      flagged: result.flagged === true,
      severe: categories.some((name) => SEVERE_CATEGORIES.has(name)),
      categories,
    };
  } catch (error) {
    console.error('openai moderation', error);
    return null;
  }
}

/**
 * Modération légère :
 *  - donnée personnelle évidente (email, téléphone) : refus, l'auteur corrige
 *  - mot interdit "reject" ou catégorie IA grave : refus
 *  - mot interdit "review" ou signalement IA léger : publié en "pending" (relecture humaine)
 *  - sinon : publié
 * Si l'API OpenAI est indisponible, on publie quand même et on le note dans les flags.
 */
export async function moderate(admin: SupabaseClient, text: string): Promise<ModerationOutcome> {
  if (EMAIL_RE.test(text) || PHONE_RE.test(text)) return { decision: 'reject', code: 'PERSONAL_DATA' };

  const normalized = normalize(text);
  const hits = (await loadBannedTerms(admin)).filter(({ term }) =>
    new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(term)}($|[^\\p{L}\\p{N}])`, 'u').test(normalized),
  );
  if (hits.some((hit) => hit.action === 'reject')) return { decision: 'reject', code: 'BANNED_TERM' };

  const ai = await openAiModeration(text);
  if (ai?.severe) return { decision: 'reject', code: 'CONTENT_POLICY' };

  const flags = { banned_terms: hits.map((hit) => hit.term), openai: ai ? ai.categories : 'unavailable' };
  if (hits.length > 0 || ai?.flagged) return { decision: 'review', flags };
  return { decision: 'allow', flags: ai ? null : flags };
}
