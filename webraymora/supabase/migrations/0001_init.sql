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
  tier text not null check (tier in ('Starter', 'Standard', 'Premium')),
  name text not null,
  price_min numeric,
  price_max numeric,
  features jsonb,                           -- array of feature strings
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

insert into public.packages (niche, tier, name, price_min, price_max, features, popular, sort) values
  ('web', 'Starter', 'Landing Page', 500, 900, '["Single landing page", "Mobile-first responsive", "2 revision rounds", "Basic SEO"]', false, 1),
  ('web', 'Standard', 'Marketing Site', 1200, 2400, '["Up to 5 pages", "CMS-ready", "3 revision rounds", "Analytics + SEO"]', true, 2),
  ('web', 'Premium', 'Web App', 3000, 8000, '["Custom web application", "Database + auth", "4 revision rounds", "Post-launch support"]', false, 3),
  ('design', 'Starter', 'Brand Kit', 400, 800, '["Logo + color palette", "Typography system", "2 revision rounds"]', false, 1),
  ('design', 'Standard', 'Social Media Kit', 600, 1200, '["12 post templates", "Story + reel covers", "3 revision rounds"]', true, 2),
  ('design', 'Premium', 'Full Identity', 1200, 3000, '["Complete brand identity", "Brand guidelines doc", "4 revision rounds"]', false, 3),
  ('video', 'Starter', 'Short-Form Edit', 150, 400, '["1 short-form edit (reels/Shorts)", "Captions + music", "2 revision rounds"]', false, 1),
  ('video', 'Standard', 'Content Pack', 500, 1200, '["5 short-form edits / month", "Platform-optimized", "3 revision rounds"]', true, 2),
  ('video', 'Premium', 'Long-Form Edit', 800, 2000, '["Full-length video edit", "Color grading + sound", "3 revision rounds"]', false, 3),
  ('copy', 'Starter', 'Sales Page Copy', 400, 900, '["Full sales page copy", "2 revision rounds", "Conversion-focused"]', false, 1),
  ('copy', 'Standard', 'Launch Sequence', 800, 1800, '["5-email launch sequence", "Subject line testing", "3 revision rounds"]', true, 2),
  ('copy', 'Premium', 'Content Engine', 1500, 4000, '["Monthly content calendar", "10 pieces / month", "Voice + positioning"]', false, 3);

insert into public.case_studies (niche, title, slug, summary, problem, solution, result, preview_url, published, sort) values
  ('web', 'Fintech landing page', 'fintech-landing', 'A landing page that turned cold traffic into booked demos.', 'The client had great product, but their site read like a spec sheet and converted poorly.', 'We rebuilt the narrative around the customer problem, cut the copy by half, and shipped a fast landing page with a single CTA.', 'Demo bookings up 3x in 6 weeks.', null, true, 1),
  ('web', 'SaaS marketing site', 'saas-marketing-site', 'A full marketing site for a B2B SaaS, CMS-ready.', 'Messy site, no clear pricing, slow load.', 'Structured pages, real pricing section, and a CMS so the team self-edits.', 'Page speed < 2s; self-serve edits without a developer.', null, true, 2),
  ('design', 'Brand refresh for a coaching brand', 'coaching-brand-refresh', 'A full identity that made a solo coach look like a company.', 'Generic logo and inconsistent socials.', 'New logo, palette, typography, and 12 social templates.', 'Client stopped needing Canva templates from scratch.', null, true, 1),
  ('video', 'Reels pack that grew an account', 'reels-growth-pack', 'Short-form edits that took an account from 2k to 40k followers.', 'Flat editing, no hook structure.', 'Hooks, pacing, captions, and platform-native formats.', '40k followers in 90 days.', null, true, 1),
  ('copy', 'Launch sequence for a course', 'course-launch-sequence', 'A 5-email sequence that carried a course launch.', 'Cold list, no relationship, low trust.', 'Story-led sequence with clear offer and urgency.', '14% open rate, 3.2% click, sold out launch.', null, true, 1);

insert into public.testimonials (quote, name, role, niche, sort) values
  ('They made the whole process feel professional. Clear stages, clear pricing, nothing ambiguous.', 'Client A', 'Founder, SaaS', 'web', 1),
  ('The edits grew our account faster than anything we tried before.', 'Client B', 'Creator', 'video', 2),
  ('Finally a designer who thinks about conversion, not just aesthetics.', 'Client C', 'Marketing Lead', 'design', 3);
