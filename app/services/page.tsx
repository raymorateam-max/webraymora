import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { NicheIcon } from "@/components/ui/niche-icon";
import { PackageCard } from "@/components/ui/package-card";
import { Reveal } from "@/components/ui/reveal";
import { siteConfig } from "@/lib/config";
import { getPackages, fallbackCopy } from "@/lib/content";
import type { Database } from "@/types/database";

type PackageRow = Database["public"]["Tables"]["packages"]["Row"];

export const metadata: Metadata = {
  title: "Services & Pricing",
  description:
    "Fixed-scope web development packages — transparent pricing, a 45% deposit to book, and 55% on delivery. Graphic design, video editing, and copywriting launch soon.",
};

/**
 * Polished pre-seed packages shown whenever Supabase isn't configured or a
 * niche has no rows yet. Same shape as a `packages` row so PackageCard and the
 * /book tier prefill just work — holds this page together without live data.
 */
function fallbackPackages(niche: string): PackageRow[] {
  const tiers: {
    tier: PackageRow["tier"];
    name: string;
    features: string[];
    popular: boolean;
    sort: number;
  }[] = [
    {
      tier: "Starter",
      name: "Starter",
      features: [
        "One focused deliverable",
        "1 revision round included",
        "Delivered in 3–5 days",
        "Email support",
      ],
      popular: false,
      sort: 1,
    },
    {
      tier: "Standard",
      name: "Standard",
      features: [
        "Everything in Starter, plus extras",
        "2 revision rounds included",
        "Scope consultation call",
        "Priority delivery",
        "Post-delivery support",
      ],
      popular: true,
      sort: 2,
    },
    {
      tier: "Premium",
      name: "Premium",
      features: [
        "Everything in Standard",
        "Unlimited revisions",
        "Dedicated point of contact",
        "Fast-track turnaround",
        "30 days post-launch support",
      ],
      popular: false,
      sort: 3,
    },
  ];

  return tiers.map((t) => ({
    id: `${niche}-${t.tier.toLowerCase()}`,
    niche,
    tier: t.tier,
    name: t.name,
    price_min: null,
    price_max: null,
    features: t.features,
    popular: t.popular,
    sort: t.sort,
    created_at: "",
  }));
}

const PAYMENT_NOTE =
  "45% deposit to book, 55% on delivery. Custom quotes available for projects outside these tiers.";

export default async function ServicesPage() {
  // Fetch all four package lists in parallel, then fall back per-niche when empty.
  const packageLists = await Promise.all(siteConfig.niches.map((n) => getPackages(n.slug)));

  return (
    <div className="container-px py-16 sm:py-20">
      <SectionHeading
        eyebrow="Services & pricing"
        title="Fixed scope, transparent pricing"
        subtitle={fallbackCopy.servicesIntro}
      />

      {/* Payment note — chip-style, shown once near the top */}
      <p className="chip mt-8 w-fit text-sm" role="note">
        {PAYMENT_NOTE}
      </p>

      {/* One section per niche; each id is the niche slug so /services#<slug> anchors work */}
      {siteConfig.niches.map((niche, i) => {
        const fetched = packageLists[i];
        const pkgList = fetched.length > 0 ? fetched : fallbackPackages(niche.slug);
        const live = niche.status === "live";

        return (
          <section
            key={niche.slug}
            id={niche.slug}
            aria-label={`${niche.label} packages`}
            className="mt-16 scroll-mt-24"
          >
            <div className="flex items-center gap-4">
              <NicheIcon niche={niche.slug} className="h-9 w-9 shrink-0 text-accent-strong" />
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-base-100">{niche.label}</h2>
                <p className="mt-1 max-w-xl text-sm text-base-400">{niche.blurb}</p>
              </div>
              {!live && (
                <span className="chip ml-auto shrink-0 text-sm text-base-400">Coming soon</span>
              )}
            </div>

            {live ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {pkgList.map((pkg, j) => (
                  <Reveal key={pkg.id} delay={j * 80} className="h-full">
                    <PackageCard pkg={pkg} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal className="mt-6">
                <div className="surface flex flex-col items-start justify-between gap-4 rounded-2xl p-6 sm:flex-row sm:items-center sm:p-8">
                  <div>
                    <h3 className="font-semibold text-base-100">Getting early access</h3>
                    <p className="mt-1 max-w-md text-sm text-base-400">
                      {niche.label} launches soon. Book a call to get early access and lock founder
                      pricing before it opens wide.
                    </p>
                  </div>
                  <Link href="/book" className="btn-secondary shrink-0">
                    Get early access
                  </Link>
                </div>
              </Reveal>
            )}
          </section>
        );
      })}

      {/* Final CTA */}
      <section aria-label="Book a discovery call" className="mt-20">
        <Reveal className="surface flex flex-col items-start justify-between gap-6 rounded-2xl p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-base-100">Not sure which fits?</h2>
            <p className="mt-2 max-w-md text-base-400">
              Book a free discovery call and we&apos;ll scope it together.
            </p>
          </div>
          <Link href="/book" className="btn-primary inline-flex shrink-0 items-center justify-center gap-2">
            Book a discovery call
          </Link>
        </Reveal>
      </section>
    </div>
  );
}