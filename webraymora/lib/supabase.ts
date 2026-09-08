import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client.
 *
 * Uses the SERVICE ROLE key — full access, bypasses RLS. Must only ever
 * be imported by server components / route handlers / server actions.
 * NEVER import this into a client component (the key would leak).
 *
 * Note: not generic-parameterized against types/database.ts — regenerate
 * with `supabase gen types` once a live project exists, then pass
 * createClient<Database>. Row types are enforced at the data-access
 * boundary in lib/content.ts instead.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Throw at build/request time so a misconfigured env fails loudly,
    // but still allow pages that don't need data to render.
    throw new Error(
      "Missing Supabase env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** True when Supabase env vars are configured — lets pages degrade gracefully. */
export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
