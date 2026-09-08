# Agency Website — Design Spec

**Date:** 2026-09-05
**Status:** Approved for build (all open assumptions resolved)
**App:** `webraymora/` — Next.js 16 + React 19 + Tailwind v4 (App Router), TypeScript

---

## 1. Decisions locked with the client

| Decision | Choice |
|---|---|
| Build scope | **All phases 1–4** (Home, Portfolio, Services, Booking, Contact, Existing-Client path + dashboard-ready data layer) |
| Content model | **Structure + content slots** — real components/wiring, clearly marked slots the client fills |
| Stack | **Next.js / App Router on the existing `webraymora/` scaffold** |
| Backend | **Supabase** (Postgres), service-role key server-side only, never exposed to client |
| Content layer | **Content in Supabase tables** (packages, case_studies, testimonials, site_content) — editable without redeploy |
| Analytics | **Plausible or Umami** (PRD-rec'd privacy-friendly) |
| Design | **Dark premium** — near-black backgrounds, one strong accent, sharp typography |
| Booking calendar | **Cal.com** embed (free tier) |
| Live chat | **Tawk.to** widget (client-side, free tier) |
| n8n integration | **Env-driven webhook URL**; POST mirrors the existing tracker columns |

---

## 2. Architecture

```
Browser  ──▶  Next.js App Router (Vercel)
                │   ├── server components / route handlers
                ├── Supabase (service-role, server-side) ──▶ content + leads/events tables
                ├── POST /api/lead ──▶ n8n webhook ──▶ Google Sheets tracker (mirror)
                ├── Cal.com iframe embed (booking)
                ├── Tawk.to widget (chat)
                └── Plausible/Umami script (analytics)
```

**Key invariant:** the site's Supabase `leads` row is the source of truth the n8n webhook mirrors into the existing Google Sheets tracker (`Client / Stage / Niche / Scope / Deposit Paid / Final Paid / Preview URL`), landing the lead in "Discovery & Deal". Two systems, same `lead_id`, each the other's mirror — no separate silo.

**Security:** Supabase service-role key lives only in server-side route handlers / server components. Env-driven config via `.env.local` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `N8N_WEBHOOK_URL`). No client-side anon reads of full tables; public pages that need content fetch through server components.

---

## 3. Supabase schema

```sql
-- Content (editable via Supabase dashboard, no redeploy)
site_content(id uuid pk, key text unique, title text, body text, extra jsonb)
packages(id uuid pk, niche text, tier text, name text, price_min numeric,
         price_max numeric, features jsonb, popular boolean, sort int)
case_studies(id uuid pk, niche text, title text, slug text unique,
             summary text, problem text, solution text, result text,
             preview_url text, video_url text, image_urls jsonb,
             before_after jsonb, excerpt text, published boolean, sort int)
testimonials(id uuid pk, quote text, name text, role text, niche text, sort int)

-- Leads (source of truth mirrored to Sheets via n8n)
leads(id uuid pk default gen_random_uuid(), created_at timestamptz default now(),
      status text default 'Discovery & Deal',   -- pipeline stage
      name text, email text, whatsapp text, discord text,
      niche text, tier text, scope text, source text,
      deposit_paid boolean default false, final_paid boolean default false,
      preview_url text, notes text)

lead_events(id uuid pk, lead_id uuid fk → leads, stage text,
            created_at timestamptz default now())
```

---

## 4. Pages & routes

| Route | Page | Key content source |
|---|---|---|
| `/` | Home — hero (2 CTAs), 4 niche cards, featured case studies, testimonials, 5-stage process | `site_content`, `case_studies`, `testimonials` |
| `/portfolio` | Work — grid filterable by niche; case-study cards | `case_studies` |
| `/portfolio/[slug]` | Case study detail — problem/solution/result, preview/video/images | `case_studies` |
| `/services` | Services & Packages — tier cards per niche, "starting at" pricing | `packages` |
| `/services#pricing` | Package selection pre-fills booking | `packages` |
| `/book` | Booking flow — Cal.com embed + package pre-fill + day/scope capture | Cal.com, form |
| `/about` | Agency story + future team profiles | `site_content` |
| `/contact` | General form + Existing-Client path (separate) + WhatsApp/Discord + Tawk.to | form + static links |
| `/api/lead` | Route handler — writes lead to Supabase, POSTs to n8n webhook, returns `lead_id` | Supabase + webhook |

---

## 5. Booking flow (core feature)

1. Visitor selects package on `/services` (carries `?niche=&tier=`).
2. `/book` reads the query params, pre-fills niche/tier/scope.
3. Visitor fills name/email/whatsapp + picks a Cal.com slot (iframe embed).
4. On submit, an optional Payoneer Request-a-Payment "deposit" step (45% / 55% split) is presented per the PRD; Stripe retainer is the documented Future-phase plug-in.
5. Confirmation shows `lead_id` and what happens next.
6. Every submission → `POST /api/lead` → Supabase `leads` (stage "Discovery & Deal") + n8n webhook → Sheets row.
7. WhatsApp/Discord quick-contact links sit alongside as the low-friction parallel path.

---

## 6. Design system (dark premium)

- **Backgrounds:** near-black (e.g. `#0a0a0b`–`#111113`) layered surfaces.
- **Accent:** single strong color (e.g. electric violet or signal orange — content-slot, client-finalized).
- **Type:** sharp sans (Geist, already loaded) for headings; clean body.
- **Components (Tailwind v4):** site header/nav (sticky), footer, hero, niche-card grid, case-study card + detail, pricing card, testimonial strip, process/stage stepper, booking form, contact form, existing-client block, sticky CTA.
- **NFRs:** mobile-first, sub-3s load, WCAG AA-conformant contrast, basic SEO (per-page metadata + sitemap), no plaintext payment/contact data.

---

## 7. Environment variables (`.env.local`)

```
NEXT_PUBLIC_SITE_NAME=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_ANALYTICS_DOMAIN=
NEXT_PUBLIC_ANALYTICS_SCRIPT_URL=      # Plausible/Umami
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_URL=
NEXT_PUBLIC_CALCOM_URL=                 # https://cal.com/your-username
NEXT_PUBLIC_TAWKTO_PROPERTY_ID=
NEXT_PUBLIC_TAWKTO_WIDGET_ID=
NEXT_PUBLIC_WHATSAPP_LINK=
NEXT_PUBLIC_DISCORD_LINK=
NEXT_PUBLIC_PAYONEER_DEPOSIT_LINK=
```

Every integration key is a clearly-labeled env slot so the client can drop in real values before launch with zero code changes.

---

## 8. Phased rollout mapping (all built now)

- **Phase 1:** Home, Portfolio (+ detail), Services/Packages, Contact form, WhatsApp/Discord links, Cal.com booking.
- **Phase 2:** On-site Payoneer deposit step, Tawk.to live chat, n8n webhook → Sheets integration (env-driven).
- **Phase 3:** Existing-Client support path (distinct field/alias) on Contact.
- **Phase 4 (future-ready):** `leads`/`lead_events` schema + About page team-profile slots; a future dashboard reads the same tables.

---

## 9. Error handling & resilience

- **Webhook failure:** lead is still saved to Supabase first; if the n8n POST fails, the row remains and an error is logged (retry/harvest via Supabase is possible) — never lose a lead because the webhook hiccupped.
- **Supabase failure:** surfaces a friendly error, no lead lost silently.
- **Form validation:** server + client side; required fields enforced; basic spam field honeypot.
- **Migrations:** `supabase/` SQL migrations committed with the repo.

---

## 10. Out of scope (this pass)

- Public auth / client login (schema ready, UI deferred).
- Blog/CMS, multi-language.
- Stripe retainer (documented plug-in point only).
- Team member directory (slot structure on About, profiles not authored).