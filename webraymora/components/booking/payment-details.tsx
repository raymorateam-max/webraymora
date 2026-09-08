"use client";

import { useState } from "react";
import { siteConfig } from "@/lib/config";

/**
 * Payoneer payment details card. Shown on the booking flow so a client has
 * the exact numbers to pay the 45% deposit / 55% balance — with copy buttons.
 */
export function PaymentDetails() {
  return (
    <section
      aria-label="Payment details"
      className="surface flex flex-col gap-4 rounded-2xl p-6 sm:p-8"
    >
      <div>
        <h2 className="text-xl font-bold tracking-tight text-base-100">How to pay</h2>
        <p className="mt-1 text-sm text-base-400">
          Deposit locks your start date; balance is due on delivery. Pay by Payoneer using
          either reference below.
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-base-700 bg-base-900/60 p-4 text-sm">
        <Row label="Payoneer account" value={siteConfig.bank.payoneerAccount} />
        <Row label="International (IBAN)" value={siteConfig.bank.payoneerInternational} />
        <Row label="Holder name" value={siteConfig.name} />
      </div>

      <p className="text-xs text-base-400">
        Prefer to confirm first? Send the reference on WhatsApp and we&apos;ll match it to your
        project.
      </p>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard unavailable — flash feedback anyway */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-base-400">{label}</p>
        <p className="truncate font-mono text-sm text-base-100">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-md border border-base-600 px-2.5 py-1 text-xs font-medium text-base-300 transition-colors hover:border-accent-soft hover:text-base-100"
        aria-label={`Copy ${label}`}
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}