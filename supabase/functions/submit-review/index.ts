// Création ou édition d'un avis : auth, attestation, rate limit, validation, modération,
// site vérifié dans SIRENE, détection des campagnes, écriture.
// Les erreurs sont des codes stables (constants/serviceErrors.ts), traduits côté app.
import { resolveSite } from '../_shared/companySites.ts';
import { loadActivityStats, openCompanyWatch } from '../_shared/companyWatch.ts';
import { clientIp, corsHeaders, failure, hashIp, json } from '../_shared/http.ts';
import { moderate } from '../_shared/moderation.ts';
import { parseSiteInput } from '../_shared/siteRules.ts';
import { adminClient, consumeRateLimit, getUser } from '../_shared/supabase.ts';
import { accountAgeHours, assessCompanyActivity, decideHold, trustWeight } from '../_shared/trust.ts';

// À garder synchronisé avec constants/reviews.ts et les CHECK de la migration.
const TEXT_LIMITS = {
  title: { min: 3, max: 120, required: true },
  pros: { min: 20, max: 3000, required: true },
  cons: { min: 20, max: 3000, required: true },
  benefits: { min: 0, max: 1000, required: false },
  job_title: { min: 0, max: 100, required: false },
} as const;
const OPTIONAL_RATINGS = ['rating_culture', 'rating_salary', 'rating_benefits', 'rating_management', 'rating_work_life'] as const;
const EMPLOYMENT_STATUSES = ['current', 'former'];
const CONTRACT_TYPES = ['cdi', 'cdd', 'interim', 'internship', 'apprenticeship', 'freelance', 'other'];
const SALARY_PERIODS = ['year', 'month', 'hour'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Parsed =
  | { ok: true; reviewId: string | null; companyId: string; fields: Record<string, unknown> }
  | { ok: false; reason: string };

function isRating(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 5;
}

function parse(body: Record<string, unknown>): Parsed {
  const reviewId = body.review_id ?? null;
  if (reviewId !== null && (typeof reviewId !== 'string' || !UUID_RE.test(reviewId))) {
    return { ok: false, reason: 'review_id' };
  }
  if (typeof body.company_id !== 'string' || !UUID_RE.test(body.company_id)) return { ok: false, reason: 'company_id' };

  const fields: Record<string, unknown> = {};

  for (const [key, rule] of Object.entries(TEXT_LIMITS)) {
    const raw = body[key];
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (!value) {
      if (rule.required) return { ok: false, reason: key };
      fields[key] = null;
      continue;
    }
    if (value.length < rule.min || value.length > rule.max) return { ok: false, reason: key };
    fields[key] = value;
  }

  if (!isRating(body.rating_overall)) return { ok: false, reason: 'rating_overall' };
  fields.rating_overall = body.rating_overall;
  for (const key of OPTIONAL_RATINGS) {
    const value = body[key];
    if (value === null || value === undefined) fields[key] = null;
    else if (isRating(value)) fields[key] = value;
    else return { ok: false, reason: key };
  }

  if (!EMPLOYMENT_STATUSES.includes(body.employment_status as string)) return { ok: false, reason: 'employment_status' };
  fields.employment_status = body.employment_status;

  if (body.contract_type != null && !CONTRACT_TYPES.includes(body.contract_type as string)) {
    return { ok: false, reason: 'contract_type' };
  }
  fields.contract_type = body.contract_type ?? null;
  fields.recommends = typeof body.recommends === 'boolean' ? body.recommends : null;

  if (body.salary_amount != null) {
    const amount = body.salary_amount;
    if (!Number.isInteger(amount) || (amount as number) <= 0 || (amount as number) >= 10_000_000) {
      return { ok: false, reason: 'salary_amount' };
    }
    if (!SALARY_PERIODS.includes(body.salary_period as string)) return { ok: false, reason: 'salary_period' };
    fields.salary_amount = amount;
    fields.salary_period = body.salary_period;
  } else {
    fields.salary_amount = null;
    fields.salary_period = null;
  }

  return { ok: true, reviewId: reviewId as string | null, companyId: body.company_id, fields };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return failure('INVALID_INPUT', 405);

  const admin = adminClient();
  const user = await getUser(req, admin);
  if (!user) return failure('NOT_AUTHENTICATED', 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return failure('INVALID_INPUT', 400);
  }

  // Attestation sur l'honneur (CGU, article 4) : exigée à chaque envoi, horodatée.
  if (body.attested !== true) return failure('ATTESTATION_REQUIRED', 422);

  const parsed = parse(body);
  if (!parsed.ok) {
    console.warn('submit-review invalid field', parsed.reason);
    return failure('INVALID_INPUT', 400);
  }
  // Site facultatif. Clé absente (app antérieure) : le site existant d'un avis édité est conservé.
  const siteProvided = Object.hasOwn(body, 'site_siret');
  const siteInput = parseSiteInput(body.site_siret);
  if (!siteInput.ok) return failure('INVALID_SITE', 400);

  const ip = clientIp(req);
  const allowed = await consumeRateLimit(admin, {
    action: 'submit_review',
    userId: user.id,
    ipHash: await hashIp(ip),
    userMax: 5,
    ipMax: 15,
    window: '24 hours',
  });
  if (!allowed) return failure('RATE_LIMITED_REVIEWS', 429);

  const { fields } = parsed;
  const moderation = await moderate(
    admin,
    [fields.title, fields.job_title, fields.pros, fields.cons, fields.benefits].filter(Boolean).join('\n\n'),
  );
  if (moderation.decision === 'reject') return failure(moderation.code, 422);

  const now = new Date();
  const attestedAt = now.toISOString();

  if (parsed.reviewId) {
    const { data: existing, error: readError } = await admin
      .from('reviews')
      .select('id, company_id, status')
      .eq('id', parsed.reviewId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (readError) return failure('SERVER_ERROR', 500);
    if (!existing) return failure('REVIEW_NOT_FOUND', 404);
    if (existing.status === 'hidden' || existing.status === 'removed') return failure('REVIEW_LOCKED', 403);

    const site = siteProvided ? await resolveSite(admin, existing.company_id, siteInput.siret) : null;
    if (site && !site.ok) return failure(site.code, site.status);

    // Un avis mis en attente (signalements, relecture) ne se republie pas tout seul en l'éditant.
    // Une édition qui déclenche la modération passe en relecture humaine, même si l'avis
    // était seulement retenu (compte récent, entreprise surveillée).
    const needsReview = moderation.decision === 'review';
    const status = existing.status === 'published' ? (needsReview ? 'pending' : 'published') : existing.status;
    const { data: updated, error } = await admin
      .from('reviews')
      .update({
        ...fields,
        ...(site?.ok ? { site_id: site.siteId } : {}),
        status,
        moderation_flags: moderation.flags,
        attested_at: attestedAt,
        ...(needsReview ? { hold_reason: null, held_until: null } : {}),
      })
      .eq('id', existing.id)
      .select('id, status, hold_reason')
      .single();
    if (error) return failure('SERVER_ERROR', 500);
    return json(updated);
  }

  const { data: company } = await admin
    .from('companies')
    .select('id')
    .eq('id', parsed.companyId)
    .eq('is_hidden', false)
    .maybeSingle();
  if (!company) return failure('COMPANY_NOT_FOUND', 404);

  const site = await resolveSite(admin, parsed.companyId, siteInput.siret);
  if (!site.ok) return failure(site.code, site.status);

  const ageHours = accountAgeHours(user.created_at, now);
  const stats = await loadActivityStats(admin, {
    companyId: parsed.companyId,
    userId: user.id,
    text: `${fields.pros} ${fields.cons}`,
  });
  const activity = stats
    ? assessCompanyActivity(stats, { ratingOverall: fields.rating_overall as number, accountAgeHours: ageHours })
    : { surge: false, signals: [] };
  if (activity.surge && !stats?.active_watch) await openCompanyWatch(admin, parsed.companyId, activity.signals);

  const hold = decideHold({
    moderation: moderation.decision,
    surge: activity.surge,
    accountCreatedAt: user.created_at,
    now,
  });
  const moderationFlags =
    activity.signals.length > 0 ? { ...(moderation.flags ?? {}), activity_signals: activity.signals } : moderation.flags;

  const { data, error } = await admin
    .from('reviews')
    .insert({
      ...fields,
      company_id: parsed.companyId,
      site_id: site.siteId,
      user_id: user.id,
      status: hold.status,
      hold_reason: hold.holdReason,
      held_until: hold.heldUntil,
      trust_weight: trustWeight(ageHours),
      attested_at: attestedAt,
      moderation_flags: moderationFlags,
    })
    .select('id, status, hold_reason')
    .single();

  if (error?.code === '23505') return failure('ALREADY_REVIEWED', 409);
  if (error) {
    console.error('insert review', error);
    return failure('SERVER_ERROR', 500);
  }
  return json(data, 201);
});
