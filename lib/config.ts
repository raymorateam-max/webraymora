/**
 * Site-wide configuration.
 *
 * Everything here is a content-slot: fill in the real agency values.
 * `SITE_NAME`, contact links, and social URLs are read from environment
 * variables (see .env.example) so nothing sensitive lives in the repo.
 */

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "Raymora",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://webraymora.com",
  tagline: "Web development — designed, built, and shipped in one place.",
  description:
    "Raymora builds fast, high-converting websites — fixed price, real process, no handshake deals. Graphic design, video editing, and copywriting launch soon.",

  // Contact links (content-slots — fill with the real values)
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_LINK ?? "https://wa.me/923712385700",
  discord: process.env.NEXT_PUBLIC_DISCORD_LINK ?? "https://discord.gg/placeholder",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "raymora.team@gmail.com",
  existingClientEmail: process.env.NEXT_PUBLIC_EXISTING_CLIENT_EMAIL ?? "raymora.team@gmail.com",

  // Direct contact phone (primary line)
  phoneDisplay: "0371 2385700",
  phoneIntl: "+92 371 2385700",
  phoneHref: "tel:+923712385700",

  // Meezan Bank receiving account — the two numbers a client needs to pay.
  // meezanAccount: 15-digit account number · meezanIban: IBAN.
  bank: {
    meezanAccount: "99130115860334",
    meezanIban: "PK66MEZN0099130115860334",
  },

  // Booking calendar (Cal.com embed URL) — empty = shows "not configured" state
  calcomUrl: process.env.NEXT_PUBLIC_CALCOM_URL ?? "",

  // Meezan Bank deposit link (45% deposit / 55% on delivery).
  // Reads the new NEXT_PUBLIC_MEEZAN_DEPOSIT_LINK; falls back to the old
  // Payoneer var so any value already set on Vercel keeps working.
  meezanDepositLink:
    process.env.NEXT_PUBLIC_MEEZAN_DEPOSIT_LINK ??
    process.env.NEXT_PUBLIC_PAYONEER_DEPOSIT_LINK ??
    "",

  // Analytics (Plausible or Umami)
  analyticsDomain: process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN ?? "",
  analyticsScriptUrl: process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL ?? "",

  // Live chat (Tawk.to)
  tawktoPropertyId: process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID ?? "",
  tawktoWidgetId: process.env.NEXT_PUBLIC_TAWKTO_WIDGET_ID ?? "",

  // The four niches the agency serves
  niches: [
    {
      slug: "web",
      label: "Web Development",
      status: "live",
      icon: "web",
      blurb: "Landing pages, marketing sites, and full web apps that load fast and convert.",
    },
    {
      slug: "design",
      label: "Graphic Design",
      status: "soon",
      icon: "design",
      blurb: "Branding, social media kits, and visual assets that make you look established.",
    },
    {
      slug: "video",
      label: "Video Editing",
      status: "soon",
      icon: "video",
      blurb: "Edits that keep attention — from short-form reels to polished long-form.",
    },
    {
      slug: "copy",
      label: "Copywriting / Content",
      status: "soon",
      icon: "copy",
      blurb: "Sales copy, email sequences, and content that sounds like your best customer.",
    },
  ] as const,

  // The 5-stage pipeline, simplified for clients (trust signal on Home)
  processStages: [
    { title: "Discovery", detail: "We learn your goal, audience, and constraints on a short call." },
    { title: "Scope & Deal", detail: "Fixed scope, timeline, and the 45% deposit to lock your slot." },
    { title: "Build", detail: "We produce the work in a shared preview you can follow along with." },
    { title: "Review & Harden", detail: "Revisions, QA, and polish until it’s right." },
    { title: "Delivery", detail: "Final handoff, final payment, and support after launch." },
  ],

  nav: [
    { href: "/", label: "Home" },
    { href: "/portfolio", label: "Work" },
    { href: "/services", label: "Services & Pricing" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

export type NicheSlug = (typeof siteConfig.niches)[number]["slug"];
