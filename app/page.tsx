import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { CaseStudyCard } from "@/components/ui/case-study-card";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { ServiceCard } from "@/components/ui/service-card";
import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/lib/config";
import { getCaseStudies, getTestimonials, getSiteContent, fallbackCopy } from "@/lib/content";

export const metadata: Metadata = {
  title: "Raymora — Web development, built properly",
  description:
    "Raymora builds fast, high-converting websites — fixed price, real process, no handshake deals. Graphic design, video editing, and copywriting launch soon.",
};

/* Trust facts surfaced as chips in the hero strip. */
const trustFacts = [
  "Fixed pricing, up front",
  "45% deposit · 55% on delivery",
  "Every project has a process",
  "Fast turnaround",
];

/* Fallback case-study-like cards shown when no case studies are published. */
function getFallbackStudies() {
  return siteConfig.niches.map((n) => ({
    key: `fallback-${n.slug}`,
    niche: n.label,
    title: n.status === "live" ? `${n.label} — live & booking` : `${n.label} — coming soon`,
    summary:
      n.status === "live"
        ? "Work is shipping now. Book a call to see live samples and talk about your project."
        : "This craft launches soon — book a call to be first in line.",
  }));
}

/* Fallback testimonials (on-brand, generic) shown when none are published. */
function getFallbackReviews() {
  return [
    {
      id: "f1",
      quote:
        "Fixed price quoted up front, nothing moved. The discovery call actually changed what we built — for the better.",
      name: "Verified client",
      role: "Web build",
    },
    {
      id: "f2",
      quote:
        "A real process from scope to delivery. I always knew what stage my project was at and what came next.",
      name: "Verified client",
      role: "Brand & launch",
    },
    {
      id: "f3",
      quote:
        "The process was the product. Fixed scope, fixed price, and a delivery that showed up exactly when it was promised.",
      name: "Verified client",
      role: "Design & marketing",
    },
  ];
}

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

  const hasStudies = studies.length > 0;
  const hasReviews = testimonials.length > 0;

  // Split hero title on sentence boundary: first sentence plain, remainder sparkles.
  const heroParts = heroTitle.split(". ");
  const heroLead = heroParts[0];
  const heroTail = heroParts.slice(1).join(". ");

  return (
    <div>
      {/* ---------------- HERO ---------------- */}
      <section
        aria-label="Intro"
        className="relative overflow-hidden border-b border-base-800 bg-base-950"
      >
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
              <Link href="/book" className="btn-primary">
                Book a Call
              </Link>
              <Link href="/portfolio" className="btn-secondary">
                See Our Work
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- TRUST STRIP ---------------- */}
      <section
        aria-label="What working with us is like"
        className="border-b border-base-800 bg-base-900"
      >
        <Reveal dir="none" className="container-px flex flex-wrap items-center gap-3 py-6">
          {trustFacts.map((fact) => (
            <span key={fact} className="chip text-base-300">
              {fact}
            </span>
          ))}
        </Reveal>
      </section>

      {/* ---------------- SERVICES ---------------- */}
      <section aria-label="Services" className="container-px py-16 sm:py-20">
        <SectionHeading
          eyebrow="What we do"
          title="Web development now — more crafts soon"
          subtitle={fallbackCopy.servicesIntro}
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {siteConfig.niches.map((n, i) => (
            <Reveal key={n.slug} delay={i * 70} className="h-full">
              <ServiceCard niche={n} />
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
            <SectionHeading eyebrow="Recent work" title="Proof, not promises" />
            <Link
              href="/portfolio"
              className="btn-secondary shrink-0"
              aria-label="View all work in the portfolio"
            >
              View all work
            </Link>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hasStudies ? (
              studies.slice(0, 6).map((item, i) => (
                <Reveal key={item.id} delay={i * 70} className="h-full">
                  <CaseStudyCard item={item} />
                </Reveal>
              ))
            ) : (
              getFallbackStudies().map((item, i) => (
                <Reveal key={item.key} delay={i * 70} className="h-full">
                  <div className="surface flex h-full flex-col p-6">
                    <span className="chip w-fit">{item.niche}</span>
                    <h3 className="mt-4 text-lg font-semibold text-base-100">{item.title}</h3>
                    <p className="mt-2 grow text-sm text-base-400">{item.summary}</p>
                    <Link
                      href="/book"
                      className="mt-6 text-sm font-semibold text-accent-strong"
                      aria-label={`Book a call about ${item.niche}`}
                    >
                      Book a call to see what we can build →
                    </Link>
                  </div>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ---------------- PROCESS ---------------- */}
      <section aria-label="How we work" className="container-px py-16 sm:py-20">
        <SectionHeading
          eyebrow="How it works"
          title="A real process, not a handshake deal"
          subtitle="Five stages, every project. You always know what's happening and what comes next."
        />
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
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-accent-soft bg-base-800 text-accent-strong">
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
      <section
        aria-label="Client testimonials"
        className="border-t border-base-800 bg-base-900 py-16 sm:py-20"
      >
        <div className="container-px">
          <SectionHeading eyebrow="Social proof" title="What clients say" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hasReviews ? (
              testimonials.map((item, i) => (
                <Reveal key={item.id} delay={i * 70} className="h-full">
                  <TestimonialCard item={item} />
                </Reveal>
              ))
            ) : (
              getFallbackReviews().map((item, i) => (
                <Reveal key={item.id} delay={i * 70} className="h-full">
                  <figure className="surface flex flex-col p-6">
                    <div className="text-accent-strong">{QUOTE_ICON}</div>
                    <blockquote className="mt-3 flex-1 text-base-200">“{item.quote}”</blockquote>
                    <figcaption className="mt-5">
                      <p className="font-semibold text-base-100">{item.name}</p>
                      {item.role && <p className="text-sm text-base-400">{item.role}</p>}
                    </figcaption>
                  </figure>
                </Reveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      <section aria-label="Get started" className="container-px py-16 sm:py-20">
        <Reveal dir="scale" className="surface flex h-full w-full flex-col items-center gap-6 rounded-2xl p-8 text-center sm:p-12">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-base-100 sm:text-4xl">
            Ready to start?
          </h2>
          <p className="max-w-xl text-base-400">
            Tell us what you&apos;re building. We&apos;ll scope it, price it up front, and
            walk you through the process — no handshake deals, no surprises.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/book" className="btn-primary">
              Book a free discovery call
            </Link>
            <Link
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              aria-label="Chat with us on WhatsApp"
            >
              Chat on WhatsApp
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}