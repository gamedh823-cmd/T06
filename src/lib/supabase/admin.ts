import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Two things need the admin API rather than the anon/user session key,
// because neither is something a plain signed-in user is allowed to do:
// creating an account with email_confirm pre-set (src/lib/auth-actions.ts
// signup — there is no real email behind the synthetic address to send a
// confirmation link to) and deleting an auth.users row so "delete my
// account" cascades to every table that references it
// (src/app/api/account/route.ts). The service role key this needs must
// stay server-only (never NEXT_PUBLIC_*, never sent to the browser), and
// the delete path only ever acts on whichever user's own session called it
// — never an id supplied by the request.
export function createAdminClient() {
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL). Add SUPABASE_SERVICE_ROLE_KEY to .env.local / your Vercel project's env vars — find it in the Supabase dashboard under Project Settings > API > service_role."
    );
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
