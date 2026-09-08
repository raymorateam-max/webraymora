import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { CaseStudyCard } from "@/components/ui/case-study-card";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { ServiceCard } from "@/components/ui/service-card";
import { Reveal } from "@/components/ui/reveal";
import { TextReveal } from "@/components/ui/text-reveal";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { FloatingOrbs } from "@/components/ui/floating-orbs";
import { CountUp } from "@/components/ui/count-up";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ParallaxSection } from "@/components/ui/parallax-section";
import { siteConfig } from "@/lib/config";
import {
  getCaseStudies,
  getTestimonials,
  getSiteContent,
  fallbackCopy,
  fallbackCaseStudies,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Raymora — Web development, built properly",
  description:
    "Raymora builds fast, high-converting websites — fixed price, real process, no handshake deals. Graphic design, video editing, and copywriting launch soon.",
};

/* Trust facts surfaced as chips in the hero strip. */
const trustFacts = [
  "Fixed pricing, up front",
  "45% deposit · 55% on delivery",
  "Every project follows a proven process",
  "Fast turnaround",
];

/* Stats for the animated counter section */
const stats = [
  { value: 5, suffix: "+", label: "Projects shipped" },
  { value: 100, suffix: "%", label: "On-time delivery" },
  { value: 5, suffix: "-star", label: "Client experience" },
  { value: 3, suffix: "–5", label: "Day avg. turnaround", prefix: "" },
];

const QUOTE_ICON = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M10 7H6a3 3 0 0 0-3 3v7h7v-7H6.5A2.5 2.5 0 0 1 9 7.5V7h1zm11 0h-4a3 3 0 0 0-3 3v7h7v-7h-3.5a2.5 2.5 0 0 1 2.5-2.5V7h1z" />
  </svg>
);

export default async function Home() {
  const [studies, testimonials, heroContent] = await Promise.all([
    getCaseStudies(),
    getTestimonials(),
    getSiteContent("hero"),
  ]);

  // Hero copy: prefer CMS "hero" content when present, else built-in fallback.
  const heroTitle = heroContent?.title ?? fallbackCopy.hero.title;
  const heroSubtitle = heroContent?.body ?? fallbackCopy.hero.subtitle;

  // Featured work: real shipped projects always render (DB rows or the static
  // fallback) — never the old "shipping now — book a call" placeholder cards.
  const work = studies.length > 0 ? studies : fallbackCaseStudies();
  // Testimonials: only render when real ones exist. Anonymous placeholders
  // are no longer invented.
  const hasReviews = testimonials.length > 0;

  // Split hero title on sentence boundary: first sentence plain, remainder sparkles.
  const heroParts = heroTitle.split(". ");
  const heroLead = heroParts[0];
  const heroTail = heroParts.slice(1).join(". ");

  return (
    <div className="page-enter">
      <ScrollProgress />

      {/* ---------------- HERO ---------------- */}
      <section
        aria-label="Intro"
        className="relative overflow-hidden border-b border-base-800 bg-base-950"
      >
        {/* Floating background orbs for depth */}
        <FloatingOrbs count={3} />

        {/* Subtle radial accent glow behind the copy (lights gently). */}
        <div
          aria-hidden="true"
          className="hero-glow pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(143, 109, 255, 0.28), transparent 70%)",
          }}
        />
        <div className="container-px relative pb-20 pt-24 sm:pb-28 sm:pt-32">
          <div className="max-w-3xl">
            <span className="chip hero-anim" style={{ animationDelay: "80ms" }}>
              Web development agency
            </span>
            <h1
              className="hero-anim mt-6 text-4xl font-extrabold leading-tight tracking-tight text-base-100 sm:text-6xl"
              style={{ animationDelay: "180ms" }}
            >
              {heroTail ? `${heroLead}.` : heroLead}
              {heroTail && (
                <>
                  {" "}
                  <span className="accent-text">{heroTail}</span>
                </>
              )}
            </h1>
            <p
              className="hero-anim mt-5 max-w-xl text-lg text-base-400 sm:text-xl"
              style={{ animationDelay: "300ms" }}
            >
              {heroSubtitle}
            </p>
            <div
              className="hero-anim mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "420ms" }}
            >
              <MagneticButton>
                <Link href="/book" className="btn-primary">
                  Book a Call
                </Link>
              </MagneticButton>
              <MagneticButton>
                <Link href="/portfolio" className="btn-secondary">
                  See Our Work
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- TRUST STRIP ---------------- */}
      <section
        aria-label="What working with us is like"
        className="border-b border-base-800 bg-base-900"
      >
        <Reveal dir="none" className="container-px flex flex-wrap items-center gap-3 py-6 stagger-parent">
          {trustFacts.map((fact) => (
            <span key={fact} className="chip text-base-300">
              {fact}
            </span>
          ))}
        </Reveal>
      </section>

      {/* ---------------- STATS ---------------- */}
      <section aria-label="Stats" className="border-b border-base-800 bg-base-950">
        <div className="container-px grid grid-cols-2 gap-6 py-12 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} dir="up" className="text-center">
              <div className="text-3xl font-extrabold text-base-100 sm:text-4xl">
                <CountUp target={stat.value} suffix={stat.suffix} prefix={stat.prefix} duration={1800 + i * 200} />
              </div>
              <p className="mt-2 text-sm text-base-400">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- SERVICES ---------------- */}
      <section aria-label="Services" className="container-px py-16 sm:py-20">
        <TextReveal
          text="Web development now — more crafts soon"
          as="h2"
          className="text-3xl font-bold tracking-tight text-base-100 sm:text-4xl"
        />
        <Reveal delay={200} dir="none">
          <p className="mt-4 max-w-xl text-base-400">{fallbackCopy.servicesIntro}</p>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {siteConfig.niches.map((n, i) => (
            <Reveal key={n.slug} delay={i * 70} className="h-full">
              <div className="card-tilt h-full">
                <ServiceCard niche={n} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- FEATURED WORK ---------------- */}
      <section
        aria-label="Featured work"
        className="border-t border-base-800 bg-base-900 py-16 sm:py-20"
      >
        <div className="container-px">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <TextReveal
              text="Proof, not promises"
              as="h2"
              className="text-3xl font-bold tracking-tight text-base-100 sm:text-4xl"
            />
            <Reveal delay={300} dir="none">
              <Link
                href="/portfolio"
                className="btn-secondary shrink-0"
                aria-label="View all work in the portfolio"
              >
                View all work
              </Link>
            </Reveal>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {work.slice(0, 6).map((item, i) => (
              <Reveal key={item.id} delay={i * 70} className="h-full">
                <div className="card-tilt h-full">
                  <CaseStudyCard item={item} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PROCESS ---------------- */}
      <section aria-label="How we work" className="container-px py-16 sm:py-20">
        <TextReveal
          text="Five stages, every project"
          as="h2"
          className="text-3xl font-bold tracking-tight text-base-100 sm:text-4xl"
        />
        <Reveal delay={200} dir="none">
          <p className="mt-4 max-w-xl text-base-400">
            You always know what&apos;s happening and what comes next — from discovery to delivery.
          </p>
        </Reveal>
        <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {siteConfig.processStages.map((stage, i) => (
            <Reveal as="li" key={stage.title} delay={i * 90} className="relative">
              {/* Connector line between steps (hidden on mobile, stacks vertically). */}
              {i < siteConfig.processStages.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute right-[-1.5rem] top-6 hidden h-px w-6 bg-base-700 lg:block"
                />
              )}
              <div className="flex items-start gap-4 lg:flex-col lg:gap-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent-soft bg-base-800 text-accent-strong gradient-border">
                  <span className="font-bold" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="sr-only">{`Step ${i + 1}`}</span>
                </div>
                <div className="lg:mt-4">
                  <h3 className="font-semibold text-base-100">{stage.title}</h3>
                  <p className="mt-1 text-sm text-base-400">{stage.detail}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      {/* Only shown when real, attributed testimonials exist. Anonymous
          placeholders are never rendered (trust signal — see review #4). */}
      {hasReviews && (
        <section
          aria-label="Client testimonials"
          className="border-t border-base-800 bg-base-900 py-16 sm:py-20"
        >
          <div className="container-px">
            <TextReveal
              text="What clients say"
              as="h2"
              className="text-3xl font-bold tracking-tight text-base-100 sm:text-4xl"
            />
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((item, i) => (
                <Reveal key={item.id} delay={i * 70} className="h-full">
                  <div className="card-tilt h-full">
                    <TestimonialCard item={item} />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- FINAL CTA ---------------- */}
      <section aria-label="Get started" className="container-px py-16 sm:py-20">
        <Reveal dir="scale" className="surface flex h-full w-full flex-col items-center gap-6 rounded-2xl p-8 text-center sm:p-12">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-base-100 sm:text-4xl">
            Ready to start?
          </h2>
          <p className="max-w-xl text-base-400">
            Tell us what you&apos;re building. We&apos;ll scope it together, give you a clear price, and walk you through every stage — no surprises.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <MagneticButton>
              <Link href="/book" className="btn-primary">
                Book a free discovery call
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                aria-label="Chat with us on WhatsApp"
              >
                Chat on WhatsApp
              </Link>
            </MagneticButton>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
