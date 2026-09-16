// Création d'une fiche entreprise à partir d'un SIREN vérifié dans la base SIRENE.
// Source : API Recherche d'entreprises (données INSEE/SIRENE, gratuite, sans clé).
// Le secteur n'est pas stocké en texte : l'app le déduit du code NAF et le traduit.
import { clientIp, corsHeaders, failure, hashIp, json } from '../_shared/http.ts';
import { adminClient, consumeRateLimit, getUser } from '../_shared/supabase.ts';

const SIRENE_SEARCH_URL = 'https://recherche-entreprises.api.gouv.fr/search';
const SOLE_PROPRIETOR_LEGAL_CATEGORY = '1000';

type SireneResult = {
  siren: string;
  nom_complet?: string | null;
  nom_raison_sociale?: string | null;
  nature_juridique?: string | null;
  activite_principale?: string | null;
  tranche_effectif_salarie?: string | null;
  etat_administratif?: string | null;
  complements?: { est_entrepreneur_individuel?: boolean | null } | null;
  siege?: { siret?: string | null; code_postal?: string | null; libelle_commune?: string | null } | null;
};

async function fetchSirene(siren: string): Promise<SireneResult | null> {
  const res = await fetch(`${SIRENE_SEARCH_URL}?q=${siren}&per_page=5`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`SIRENE ${res.status}`);
  const data = await res.json();
  return (data.results as SireneResult[] | undefined)?.find((r) => r.siren === siren) ?? null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return failure('INVALID_INPUT', 405);

  const admin = adminClient();
  const user = await getUser(req, admin);
  if (!user) return failure('NOT_AUTHENTICATED', 401);

  let siren: string;
  try {
    siren = String((await req.json()).siren ?? '').replace(/\s/g, '');
  } catch {
    return failure('INVALID_INPUT', 400);
  }
  if (!/^\d{9}$/.test(siren)) return failure('INVALID_SIREN', 400);

  // Doublon : la fiche existe déjà, on la renvoie simplement.
  const { data: existing } = await admin.from('companies').select('id').eq('siren', siren).maybeSingle();
  if (existing) return json({ id: existing.id, created: false });

  const allowed = await consumeRateLimit(admin, {
    action: 'create_company',
    userId: user.id,
    ipHash: await hashIp(clientIp(req)),
    userMax: 10,
    ipMax: 30,
    window: '24 hours',
  });
  if (!allowed) return failure('RATE_LIMITED_COMPANIES', 429);

  let result: SireneResult | null;
  try {
    result = await fetchSirene(siren);
  } catch (error) {
    console.error('sirene', error);
    return failure('SIRENE_UNAVAILABLE', 503);
  }
  if (!result) return failure('SIRENE_NOT_FOUND', 404);

  // Un entrepreneur individuel est une personne physique : avis nominatifs exclus (diffamation, RGPD).
  if (result.complements?.est_entrepreneur_individuel || result.nature_juridique === SOLE_PROPRIETOR_LEGAL_CATEGORY) {
    return failure('SOLE_PROPRIETOR', 422);
  }

  const { data, error } = await admin
    .from('companies')
    .insert({
      siren,
      siret: result.siege?.siret ?? null,
      name: (result.nom_complet ?? result.nom_raison_sociale ?? siren).slice(0, 200),
      naf_code: result.activite_principale ?? null,
      city: result.siege?.libelle_commune ?? null,
      postal_code: result.siege?.code_postal ?? null,
      employee_range: result.tranche_effectif_salarie ?? null,
      is_active: result.etat_administratif === 'A',
      verified: true,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (error?.code === '23505') {
    const { data: raced } = await admin.from('companies').select('id').eq('siren', siren).single();
    return json({ id: raced?.id, created: false });
  }
  if (error) {
    console.error('insert company', error);
    return failure('SERVER_ERROR', 500);
  }
  return json({ id: data.id, created: true }, 201);
});
