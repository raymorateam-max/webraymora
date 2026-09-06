import "server-only";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";
import type { Database } from "@/types/database";
import { siteConfig } from "@/lib/config";

type CaseStudy = Database["public"]["Tables"]["case_studies"]["Row"];
type PackageRow = Database["public"]["Tables"]["packages"]["Row"];
type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

/**
 * Content data-access layer (server-side only).
 *
 * Every getter falls back to a built-in default when Supabase isn't
 * configured (no .env.local yet) or the table is empty — so the site
 * builds and renders out of the box, and content appears once the
 * client applies the migration and seeds their real data.
 */

export async function getCaseStudies(niche?: string): Promise<CaseStudy[]> {
  if (!isSupabaseConfigured()) return [];
  const client = createAdminClient();
  let query = client.from("case_studies").select("*").eq("published", true).order("sort");
  if (niche) query = query.eq("niche", niche);
  const { data, error } = await query;
  if (error) {
    console.error("[content] case_studies:", error.message);
    return [];
  }
  return (data as CaseStudy[]) ?? [];
}

export async function getCaseStudyBySlug(slug: string): Promise<CaseStudy | null> {
  if (!isSupabaseConfigured()) return null;
  const client = createAdminClient();
  const { data, error } = await client
    .from("case_studies")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) {
    console.error("[content] case_study:", error.message);
    return null;
  }
  return (data as CaseStudy | null) ?? null;
}

export async function getPackages(niche?: string): Promise<PackageRow[]> {
  if (!isSupabaseConfigured()) return [];
  const client = createAdminClient();
  let query = client.from("packages").select("*").order("sort");
  if (niche) query = query.eq("niche", niche);
  const { data, error } = await query;
  if (error) {
    console.error("[content] packages:", error.message);
    return [];
  }
  return (data as PackageRow[]) ?? [];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured()) return [];
  const client = createAdminClient();
  const { data, error } = await client.from("testimonials").select("*").order("sort");
  if (error) {
    console.error("[content] testimonials:", error.message);
    return [];
  }
  return (data as Testimonial[]) ?? [];
}

export async function getSiteContent(key: string): Promise<{
  title: string | null;
  body: string | null;
  extra: Record<string, unknown> | null;
} | null> {
  if (!isSupabaseConfigured()) return null;
  const client = createAdminClient();
  const { data, error } = await client
    .from("site_content")
    .select("*")
    .eq("key", key)
    .maybeSingle();
  if (error) {
    console.error("[content] site_content:", error.message);
    return null;
  }
  if (!data) return null;
  return {
    title: (data as { title: string | null }).title,
    body: (data as { body: string | null }).body,
    extra: (data as { extra: Record<string, unknown> | null }).extra ?? null,
  };
}

/** Default copy so pages render a sensible, on-brand message pre-seed. */
export const fallbackCopy = {
  hero: {
    title: "Web development. Built properly. Zero handshake deals.",
    subtitle:
      "Fast, high-converting websites — designed, built, and shipped through one proven process. Graphic design, video, and copy join the roster soon.",
  },
  servicesIntro:
    "Web development is live today — fixed scope, transparent pricing, and a 45% deposit to lock your slot. Every project follows the same proven process.",
  aboutStory:
    "We started with one promise: a real process, not a handshake deal. Today Raymora ships web development end-to-end with a fixed scope and a fixed price — and graphic design, video, and copy rounds are building for launch.",
  niches: siteConfig.niches,
} as const;
