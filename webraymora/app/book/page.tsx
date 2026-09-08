import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { BookingPanel } from "@/components/booking/booking-panel";
import { PaymentDetails } from "@/components/booking/payment-details";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Book a Call",
  description:
    "Book a free discovery call with Raymora. Tell us what you need, pick a slot, and you're in the pipeline. No charge to book — a 45% deposit locks your slot when you proceed.",
};

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ niche?: string; tier?: string }>;
}) {
  const sp = await searchParams;
  const niche = sp.niche?.trim() || undefined;
  const tier = sp.tier?.trim() || undefined;

  const matchedNiche = niche ? siteConfig.niches.find((n) => n.slug === niche) : undefined;
  const nicheLabel = matchedNiche?.label ?? niche ?? undefined;

  const hasSelection = Boolean(niche || tier);
  const chipText = ["Selected:", niche ? nicheLabel : null, niche && tier ? "—" : null, tier ?? null]
    .filter((part): part is string => Boolean(part))
    .join(" ");

  return (
    <div>
      <section className="container-px py-16 sm:py-20">
        <SectionHeading
          eyebrow="Book a call"
          title="Book your discovery call"
          subtitle={
            "Tell us what you need, pick a slot, and you're in the pipeline. We'll come to the call prepared."
          }
        />

        {/* Pre-filled selection from Services -> package select */}
        {hasSelection && (
          <Reveal dir="none">
            <p className="chip mt-8 w-fit text-sm" role="note">
              {chipText}
            </p>
          </Reveal>
        )}

        <Reveal className="mt-12">
          <BookingPanel presetNiche={niche} presetTier={tier} />
        </Reveal>

        {/* Payment details — exact numbers to pay, always visible */}
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <PaymentDetails />
          <Reveal delay={120}>
            <section
              aria-label="Prefer to just message us?"
              className="surface flex h-full flex-col items-start justify-between gap-6 rounded-2xl p-8 sm:p-10"
            >
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-base-100">
                  Prefer to just message us?
                </h2>
                <p className="mt-2 max-w-md text-base-400">
                  Skip the form and reach us directly — we&apos;ll reply within one business day.
                </p>
                <a
                  href={siteConfig.phoneHref}
                  className="mt-4 inline-flex items-center gap-2 text-base-100 hover:text-accent-strong"
                >
                  <span className="text-accent-strong">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>{" "}
                  {siteConfig.phoneDisplay}
                </a>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={siteConfig.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  aria-label="Message us on WhatsApp"
                >
                  WhatsApp
                </Link>
                <Link
                  href={siteConfig.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  aria-label="Message us on Discord"
                >
                  Discord
                </Link>
              </div>
            </section>
          </Reveal>
        </div>
      </section>
    </div>
  );
}