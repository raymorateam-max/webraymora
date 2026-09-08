import type { Metadata } from "next";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import { NicheIcon } from "@/components/ui/niche-icon";
import { Reveal } from "@/components/ui/reveal";
import { LeadForm } from "@/components/forms/lead-form";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Raymora — start a new project, get support as an existing client, or ask a general question. Email, WhatsApp, or a free discovery call.",
};

const MAIL_ICON = (
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
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const CALENDAR_ICON = (
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
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </svg>
);

const PHONE_ICON = (
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
);

export default function ContactPage() {
  return (
    <div className="container-px page-enter py-16 sm:py-20">
      <SectionHeading
        eyebrow="Contact"
        title="Talk to us"
        subtitle={
          "Quick question, a new project, or you're already a client — here's the fastest path."
        }
      />

      {/* THREE PATHS — each route into the pipeline, one per card */}
      <Reveal className="mt-12 grid items-stretch gap-5 lg:grid-cols-3">
        {/* PATH 1 — NEW PROJECT */}
        <section
          aria-label="Start a new project"
          className="surface flex flex-col rounded-2xl p-6 sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
            Path 1 · New project
          </p>
          <p className="mt-2 text-sm text-base-400">
            Tell us what you&apos;re building — we&apos;ll scope it, price it up front, and reply
            within one business day.
          </p>
          <div className="mt-5 flex-1">
            <LeadForm
              source="contact_form"
              showNiche
              title="Start a new project"
              submitLabel="Send message"
            />
          </div>
          <div className="mt-6 border-t border-base-700 pt-5">
            <p className="text-sm font-medium text-base-200">Prefer instant chat?</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Link
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                aria-label="Message us on WhatsApp about a new project"
              >
                WhatsApp
              </Link>
            </div>
          </div>
        </section>

        {/* PATH 2 — EXISTING CLIENT (dedicated support path) */}
        <section
          aria-label="Existing client support"
          className="surface flex flex-col rounded-2xl p-6 sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
            Path 2 · Existing client
          </p>
          <div className="mt-3 rounded-xl border border-accent-soft bg-accent-soft/40 p-4" role="note">
            <p className="text-sm text-base-200">
              Already in the pipeline? Use this path so you land in the support queue, not the
              new-lead intake.
            </p>
          </div>
          <div className="mt-5 flex-1">
            <LeadForm
              source="existing_client"
              title="Existing client? Get support"
              submitLabel="Send support request"
            />
          </div>
          <p className="mt-6 border-t border-base-700 pt-5 text-sm text-base-300">
            Or email{" "}
            <a
              href={`mailto:${siteConfig.existingClientEmail}`}
              className="font-semibold text-accent-strong underline decoration-accent-soft underline-offset-4 hover:text-accent-strong"
              aria-label={`Email existing clients at ${siteConfig.existingClientEmail}`}
            >
              {siteConfig.existingClientEmail}
            </a>{" "}
            directly.
          </p>
        </section>

        {/* PATH 3 — OTHER / GENERAL */}
        <section
          aria-label="General enquiries"
          className="surface flex flex-col rounded-2xl p-6 sm:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
            Path 3 · General
          </p>
          <h3 className="mt-2 text-lg font-semibold text-base-100">Quick options</h3>
          <p className="mt-1 text-sm text-base-400">
            A question, a partnership idea, or something in between.
          </p>

          <ul className="mt-5 flex-1 space-y-3">
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-3 rounded-xl border border-base-700 bg-base-850 px-4 py-3 text-sm font-medium text-base-200 transition-colors hover:border-accent-soft hover:text-base-100"
                aria-label={`Email us at ${siteConfig.email}`}
              >
                <span className="text-accent-strong">{MAIL_ICON}</span>
                <span>Email us — {siteConfig.email}</span>
              </a>
            </li>
            <li>
              <a
                href={siteConfig.phoneHref}
                className="flex items-center gap-3 rounded-xl border border-base-700 bg-base-850 px-4 py-3 text-sm font-medium text-base-200 transition-colors hover:border-accent-soft hover:text-base-100"
                aria-label={`Call us at ${siteConfig.phoneIntl}`}
              >
                <span className="text-accent-strong">{PHONE_ICON}</span>
                <span>Call us — {siteConfig.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <Link
                href="/book"
                className="flex items-center gap-3 rounded-xl border border-base-700 bg-base-850 px-4 py-3 text-sm font-medium text-base-200 transition-colors hover:border-accent-soft hover:text-base-100"
              >
                <span className="text-accent-strong">{CALENDAR_ICON}</span>
                <span>Book a discovery call</span>
              </Link>
            </li>
          </ul>

          <div className="mt-6 border-t border-base-700 pt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-base-400">
              Or browse a service
            </p>
            <ul className="mt-3 space-y-1">
              {siteConfig.niches.map((n) => (
                <li key={n.slug}>
                  <Link
                    href={`/services#${n.slug}`}
                    className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-base-300 transition-colors hover:bg-base-800 hover:text-base-100"
                    aria-label={`${n.label} services`}
                  >
                    <NicheIcon niche={n.slug} className="h-4 w-4 text-accent-strong" />
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>

      {/* LIVE CHAT NOTE */}
      <p className="chip mx-auto mt-10 w-fit text-sm" role="note">
        Prefer live chat? Use the chat bubble in the corner.
      </p>

      {/* FINAL CTA */}
      <section aria-label="Not sure where to start?" className="mt-12">
        <Reveal className="surface flex flex-col items-start justify-between gap-6 rounded-2xl p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-base-100">Not sure where to start?</h2>
            <p className="mt-2 max-w-md text-base-400">
              Book a free discovery call and we&apos;ll point you to the right path.
            </p>
          </div>
          <Link href="/book" className="btn-primary shrink-0">
            Book a free discovery call
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
