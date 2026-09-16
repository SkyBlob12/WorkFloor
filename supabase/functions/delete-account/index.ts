// Droit à l'effacement (RGPD art. 17) : supprime le compte Auth.
// Avis, votes, signalements, blocages et jetons push partent en cascade (FK on delete cascade).
import { corsHeaders, failure, json } from '../_shared/http.ts';
import { adminClient, getUser } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return failure('INVALID_INPUT', 405);

  const admin = adminClient();
  const user = await getUser(req, admin);
  if (!user) return failure('NOT_AUTHENTICATED', 401);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('delete user', error);
    return failure('ACCOUNT_DELETE_FAILED', 500);
  }
  return json({ deleted: true });
});
