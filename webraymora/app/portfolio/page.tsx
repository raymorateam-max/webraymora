import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ServiceCard } from "@/components/ui/service-card";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { FloatingOrbs } from "@/components/ui/floating-orbs";
import { PortfolioFilter } from "@/components/portfolio/portfolio-filter";
import { siteConfig } from "@/lib/config";
import { getCaseStudies, fallbackCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Portfolio — Real work, real results",
  description:
    "Browse real web projects, each with a real client, a real problem, and a real result — plus a look at the graphic design, video, and copy work coming soon.",
};

export default async function PortfolioPage() {
  const fetched = await getCaseStudies();
  // Shipped work is shown even before Supabase is seeded — same contract as /services.
  const studies = fetched.length > 0 ? fetched : fallbackCaseStudies();

  return (
    <div className="container-px page-enter relative py-16 sm:py-20">
      <FloatingOrbs count={2} />
      <SectionHeading
        eyebrow="Our work"
        title="Portfolio"
        subtitle="Filter by craft — every piece below has a real client, a real problem, and a real result."
      />

      <div className="mt-12">
        <PortfolioFilter items={studies} />

        {/* Polished fallback when no case studies are published yet —
            keeps the page rich without Supabase data. PortfolioFilter
            also shows its own empty-state card above this. */}
        {studies.length === 0 && (
          <section className="mt-14" aria-label="Work we do now and next">
            <h2 className="text-xl font-semibold text-base-100">What we make</h2>
            <p className="mt-2 max-w-xl text-sm text-base-400">
              In the meantime, here&apos;s a taste of what we ship — web builds live now, with
              design, video, and copy joining the roster soon.
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {siteConfig.niches.map((n, i) => (
                <Reveal key={n.slug} delay={i * 70} className="h-full">
                  <ServiceCard niche={n} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* CTA band */}
      <section aria-label="Book a call" className="mt-16">
        <Reveal className="surface flex flex-col items-start justify-between gap-6 rounded-2xl p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-base-100">
              Want work like this?
            </h2>
            <p className="mt-2 max-w-md text-base-400">
              Tell us what you&apos;re building — we&apos;ll scope it, price it up front, and show
              you real samples before you commit.
            </p>
          </div>
          <MagneticButton>
            <Link
              href="/book"
              className="btn-primary inline-flex shrink-0 items-center justify-center gap-2"
            >
              Book a call
            </Link>
          </MagneticButton>
        </Reveal>
      </section>
    </div>
  );
}