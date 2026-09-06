-- ============================================================
-- Raymora agency website — initial schema
-- Content lives in Supabase so it's editable without redeploy.
-- Run via Supabase dashboard SQL editor, or `supabase db push`.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------------- Content tables ----------------

create table public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,                 -- e.g. 'hero', 'about_story', 'services_intro'
  title text,
  body text,
  extra jsonb,                              -- flexible per-key data
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  niche text not null,                      -- web | design | video | copy
  tier text not null check (tier in ('Starter', 'Standard', 'Premium', 'brochure', 'cms', 'ecommerce')),
  name text not null,
  price_min numeric,
  price_max numeric,
  price_usd_min numeric,                    -- USD equivalent for display
  price_usd_max numeric,
  features jsonb,                           -- array of feature strings
  timeline text,                            -- e.g. '3-5 days'
  stack text,                               -- e.g. 'Next.js / Tailwind CSS + Vercel (free tier)'
  popular boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  niche text not null,                      -- web | design | video | copy
  title text not null,
  slug text not null unique,
  summary text not null default '',
  problem text,
  solution text,
  result text,
  preview_url text,                         -- web dev: live/preview link (reuses Sheets tracker Preview URL)
  video_url text,                           -- video editing: embeddable preview
  image_urls jsonb,                         -- design: gallery; array of URLs
  before_after jsonb,                       -- design: { before: url, after: url }
  excerpt text,                             -- copywriting: short original sample
  published boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  name text not null,
  role text,
  niche text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------- Leads (source of truth, mirrored to Sheets) ----------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'Discovery & Deal',  -- pipeline stage
  name text,
  email text,
  whatsapp text,
  discord text,
  niche text,
  tier text,
  scope text,
  source text,                 -- 'booking' | 'contact_form' | 'existing_client'
  deposit_paid boolean not null default false,
  final_paid boolean not null default false,
  preview_url text,
  notes text
);

create table public.lead_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  stage text not null,
  created_at timestamptz not null default now()
);

-- ---------------- Row Level Security ----------------

-- Public read for content tables (needed if you ever enable anon access;
-- with service-role server-side reads this is defense-in-depth).
alter table public.site_content enable row level security;
alter table public.packages enable row level security;
alter table public.case_studies enable row level security;
alter table public.testimonials enable row level security;
alter table public.leads enable row level security;
alter table public.lead_events enable row level security;

-- Content is readable by anon (it's the public marketing site).
create policy "site_content public read" on public.site_content for select using (true);
create policy "packages public read" on public.packages for select using (true);
create policy "case_studies public read" on public.case_studies for select using (true);
create policy "testimonials public read" on public.testimonials for select using (true);

-- Leads are NEVER readable/writable by anon. Only the service-role key
-- (server-side) touches them. Inserts come via the /api/lead route handler.
create policy "leads no anon access" on public.leads for all using (false);
create policy "lead_events no anon access" on public.lead_events for all using (false);

-- ---------------- Seed content (placeholders to replace) ----------------

insert into public.site_content (key, title, body, extra) values
  ('hero', 'One agency. Four crafts. Zero handshake deals.', 'We design, build, edit, and write — with a real process from first call to final delivery.', '{"cta_primary": "Book a Call", "cta_secondary": "See Our Work"}'),
  ('services_intro', 'Services & Pricing', 'Fixed scope, transparent pricing, and a 45% deposit to lock your slot. Every project follows the same proven process.', null),
  ('about_story', 'Why Raymora exists', 'A multi-niche agency built on one idea: clients should get a real process, not a handshake deal. We started solo, grew a pipeline, and now run a studio across four crafts.', '{"team": [{"name": "Founder", "role": "Founder & Lead", "blurb": "Content-slot: add team profiles here as the agency scales."}]}');

insert into public.packages (niche, tier, name, price_min, price_max, price_usd_min, price_usd_max, features, timeline, stack, popular, sort) values
  ('web', 'brochure', 'Basic Brochure Site', 85000, 140000, 300, 500, '["1–3 pages", "Responsive UI", "Contact form", "Basic SEO"]', '3–5 days', 'Next.js / Tailwind CSS + Vercel (free tier)', false, 1),
  ('web', 'cms', 'CMS-Driven Business Site', 140000, 220000, 500, 800, '["Dynamic blog/portfolio", "Admin panel for client updates"]', '1–2 weeks', 'Next.js + free headless CMS (Sanity / TinaCMS)', true, 2),
  ('web', 'ecommerce', 'E-Commerce Store', 220000, 277300, 800, 1000, '["Simple product catalog", "Stripe checkout", "Order email alerts"]', '2–3 weeks', 'Next.js + Stripe Checkout / Payhip API', false, 3),
  ('design', 'Starter', 'Brand Kit', null, null, null, null, '["Logo + color palette", "Typography system", "2 revision rounds"]', null, null, false, 1),
  ('design', 'Standard', 'Social Media Kit', null, null, null, null, '["12 post templates", "Story + reel covers", "3 revision rounds"]', null, null, true, 2),
  ('design', 'Premium', 'Full Identity', null, null, null, null, '["Complete brand identity", "Brand guidelines doc", "4 revision rounds"]', null, null, false, 3),
  ('video', 'Starter', 'Short-Form Edit', null, null, null, null, '["1 short-form edit (reels/Shorts)", "Captions + music", "2 revision rounds"]', null, null, false, 1),
  ('video', 'Standard', 'Content Pack', null, null, null, null, '["5 short-form edits / month", "Platform-optimized", "3 revision rounds"]', null, null, true, 2),
  ('video', 'Premium', 'Long-Form Edit', null, null, null, null, '["Full-length video edit", "Color grading + sound", "3 revision rounds"]', null, null, false, 3),
  ('copy', 'Starter', 'Sales Page Copy', null, null, null, null, '["Full sales page copy", "2 revision rounds", "Conversion-focused"]', null, null, false, 1),
  ('copy', 'Standard', 'Launch Sequence', null, null, null, null, '["5-email launch sequence", "Subject line testing", "3 revision rounds"]', null, null, true, 2),
  ('copy', 'Premium', 'Content Engine', null, null, null, null, '["Monthly content calendar", "10 pieces / month", "Voice + positioning"]', null, null, false, 3);

insert into public.case_studies (niche, title, slug, summary, problem, solution, result, preview_url, published, sort) values
  ('web', 'Fintech landing page', 'fintech-landing', 'A landing page that turned cold traffic into booked demos.', 'The client had great product, but their site read like a spec sheet and converted poorly.', 'We rebuilt the narrative around the customer problem, cut the copy by half, and shipped a fast landing page with a single CTA.', 'Demo bookings up 3x in 6 weeks.', null, true, 1),
  ('web', 'SaaS marketing site', 'saas-marketing-site', 'A full marketing site for a B2B SaaS, CMS-ready.', 'Messy site, no clear pricing, slow load.', 'Structured pages, real pricing section, and a CMS so the team self-edits.', 'Page speed < 2s; self-serve edits without a developer.', null, true, 2),
  ('design', 'Brand refresh for a coaching brand', 'coaching-brand-refresh', 'A full identity that made a solo coach look like a company.', 'Generic logo and inconsistent socials.', 'New logo, palette, typography, and 12 social templates.', 'Client stopped needing Canva templates from scratch.', null, true, 1),
  ('video', 'Reels pack that grew an account', 'reels-growth-pack', 'Short-form edits that took an account from 2k to 40k followers.', 'Flat editing, no hook structure.', 'Hooks, pacing, captions, and platform-native formats.', '40k followers in 90 days.', null, true, 1),
  ('copy', 'Launch sequence for a course', 'course-launch-sequence', 'A 5-email sequence that carried a course launch.', 'Cold list, no relationship, low trust.', 'Story-led sequence with clear offer and urgency.', '14% open rate, 3.2% click, sold out launch.', null, true, 1),
  ('web', 'Portfolio Website', 'portfolio-website', 'A fast, clean portfolio site built to let the work speak first.', 'Needed an online portfolio that opens fast, feels effortless to browse, and looks sharp on any device.', 'A lightweight, image-first layout — minimal chrome, big crisp entries, no heavy scripts.', 'A portfolio you can hand to a client and have them see real work within seconds.', 'https://webraymora.vercel.app', true, 3),
  ('web', 'Swasthya Hospital', 'swasthya-hospital', 'A trustworthy hospital site that makes it easy for patients to find and book care.', 'Visitors needed clear departments, doctors, and contact paths without digging through clutter.', 'A calm, credible layout with departments, services, and a direct path to enquiries.', 'A site patients can navigate in seconds — online presence that matches real care.', 'https://swasthya-hospital.vercel.app', true, 4),
  ('web', 'Brightleaf School', 'brightleaf-schools', 'A warm, welcoming school site built to help parents explore programs and admissions.', 'Parents needed programs, admissions info, and contact details presented simply and invitingly.', 'A friendly, structured layout with clear sections for curriculum, admission, and updates.', 'An approachable online front door parents actually enjoy using.', 'https://brightleaf-schools.vercel.app', true, 5),
  ('web', 'Restaurant Website', 'restaurant-website', 'A mouth-watering restaurant site that turns visitors into reservations.', "The menu and vibe weren't coming across online, and bookings weren't making it to the phone.", 'A bold, appetite-driven design with the menu front and center and a clear call-to-contact.', 'A site that sells the food before the first bite — and keeps the phone ringing.', 'https://restaurant-website-red-pi.vercel.app', true, 6),
  ('web', 'Kamboja Salon', 'kamboja-salon', 'A polished salon site that brings the studio vibe online and books more clients.', "The salon's look and feel wasn't translating online, and clients had no easy way to reach out.", 'A stylish, on-brand layout with services, gallery feel, and a simple contact path.', 'A salon presence that looks as good as the chair-side experience.', 'https://kamboja-salon.vercel.app', true, 7);

insert into public.testimonials (quote, name, role, niche, sort) values
  ('They made the whole process feel professional. Clear stages, clear pricing, nothing ambiguous.', 'Client A', 'Founder, SaaS', 'web', 1),
  ('The edits grew our account faster than anything we tried before.', 'Client B', 'Creator', 'video', 2),
  ('Finally a designer who thinks about conversion, not just aesthetics.', 'Client C', 'Marketing Lead', 'design', 3);
