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

/**
 * Real shipped projects. Shown on /portfolio whenever Supabase isn't
 * configured (or the table is empty) so the portfolio reads as live work,
 * not placeholders — same as how /services falls back to fixed packages.
 */
const FALLBACK_CASE_STUDIES: CaseStudy[] = [
  {
    id: "web-portfolio",
    niche: "web",
    slug: "portfolio-website",
    title: "Portfolio Website",
    summary: "A fast, clean portfolio site built to let the work speak first.",
    problem:
      "Needed an online portfolio that opens fast, feels effortless to browse, and looks sharp on any device.",
    solution:
      "A lightweight, image-first layout — minimal chrome, big crisp entries, no heavy scripts.",
    result: "A portfolio you can hand to a client and have them see real work within seconds.",
    preview_url: "https://webraymora.vercel.app",
    video_url: null,
    image_urls: null,
    before_after: null,
    excerpt: null,
    published: true,
    sort: 1,
    created_at: "",
  },
  {
    id: "web-swasthya-hospital",
    niche: "web",
    slug: "swasthya-hospital",
    title: "Swasthya Hospital",
    summary: "A trustworthy hospital site that makes it easy for patients to find and book care.",
    problem:
      "Visitors needed clear departments, doctors, and contact paths without digging through clutter.",
    solution:
      "A calm, credible layout with departments, services, and a direct path to enquiries.",
    result: "A site patients can navigate in seconds — online presence that matches real care.",
    preview_url: "https://swasthya-hospital.vercel.app",
    video_url: null,
    image_urls: null,
    before_after: null,
    excerpt: null,
    published: true,
    sort: 2,
    created_at: "",
  },
  {
    id: "web-brightleaf-schools",
    niche: "web",
    slug: "brightleaf-schools",
    title: "Brightleaf School",
    summary: "A warm, welcoming school site built to help parents explore programs and admissions.",
    problem:
      "Parents needed programs, admissions info, and contact details presented simply and invitingly.",
    solution:
      "A friendly, structured layout with clear sections for curriculum, admission, and updates.",
    result: "An approachable online front door parents actually enjoy using.",
    preview_url: "https://brightleaf-schools.vercel.app",
    video_url: null,
    image_urls: null,
    before_after: null,
    excerpt: null,
    published: true,
    sort: 3,
    created_at: "",
  },
  {
    id: "web-restaurant",
    niche: "web",
    slug: "restaurant-website",
    title: "Restaurant Website",
    summary: "A mouth-watering restaurant site that turns visitors into reservations.",
    problem:
      "The menu and vibe weren't coming across online, and bookings weren't making it to the phone.",
    solution:
      "A bold, appetite-driven design with the menu front and center and a clear call-to-contact.",
    result: "A site that sells the food before the first bite — and keeps the phone ringing.",
    preview_url: "https://restaurant-website-red-pi.vercel.app",
    video_url: null,
    image_urls: null,
    before_after: null,
    excerpt: null,
    published: true,
    sort: 4,
    created_at: "",
  },
  {
    id: "web-kamboja-salon",
    niche: "web",
    slug: "kamboja-salon",
    title: "Kamboja Salon",
    summary: "A polished salon site that brings the studio's vibe online and books more clients.",
    problem:
      "The salon's look and feel wasn't translating online, and clients had no easy way to reach out.",
    solution:
      "A stylish, on-brand layout with services, gallery feel, and a simple contact path.",
    result: "A salon presence that looks as good as the chair-side experience.",
    preview_url: "https://kamboja-salon.vercel.app",
    video_url: null,
    image_urls: null,
    before_after: null,
    excerpt: null,
    published: true,
    sort: 5,
    created_at: "",
  },
];

/** Stable, always-available case studies for pages that render without live data. */
export function fallbackCaseStudies(): CaseStudy[] {
  return FALLBACK_CASE_STUDIES;
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
