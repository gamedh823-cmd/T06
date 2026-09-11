import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your Supabase project values."
  );
}

// One client per request, built from the caller's own session cookie. Every
// query made with this client runs as that person in Postgres (auth.uid()),
// so the RLS policies in supabase/schema.sql are what actually keep one
// account's rows out of another's reach (T07-C116..C126) — this client is
// just what carries "who is asking" down to them.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(url!, anonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, which can't write cookies —
          // middleware.ts already refreshes the session on every request.
        }
      },
    },
  });
}
