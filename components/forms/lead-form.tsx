"use client";

import { useRef, useState } from "react";
import { siteConfig } from "@/lib/config";

export type LeadSource = "booking" | "contact_form" | "existing_client";

/**
 * The single lead form for the whole site. Submits to POST /api/lead,
 * which saves to Supabase and fires the n8n webhook -> Sheets mirror.
 *
 * Props make it reusable across Book and Contact:
 *  - source: which funnel the submission belongs to
 *  - presetNiche / presetTier: pre-filled from the Services -> Book flow
 *  - showScope: show the project-scope textarea (booking context)
 *  - showNiche: show the niche selector (contact context)
 *  - showDeposit: after success, surface the Meezan Bank deposit step (booking)
 */
export function LeadForm({
  source,
  presetNiche = "",
  presetTier = "",
  showScope = false,
  showNiche = false,
  showDeposit = false,
  submitLabel = "Submit",
  title,
  slot = "",
}: {
  source: LeadSource;
  presetNiche?: string;
  presetTier?: string;
  showScope?: boolean;
  showNiche?: boolean;
  showDeposit?: boolean;
  submitLabel?: string;
  title?: string;
  /** Pre-selected booking slot shown to the client and sent with the lead. */
  slot?: string;
}) {
  const honeypot = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Honeypot: if a bot filled the hidden field, silently succeed.
    if (honeypot.current?.value) {
      setStatus("done");
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    const isExisting = source === "existing_client";

    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: isExisting ? "" : data.get("email"),
          whatsapp: data.get("whatsapp") || "",
          discord: data.get("discord") || "",
          niche: data.get("niche") || presetNiche || "",
          tier: data.get("tier") || presetTier || "",
          scope: data.get("scope") || "",
          message: data.get("message") || "",
          source,
          notes: data.get("notes") || "",
          slot: slot || "",
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error ?? "Something went wrong - please try again.");
      }
      setLeadId(json.lead_id ?? null);
      setStatus("done");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong - please try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="surface p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-semibold text-base-100">
          {source === "existing_client" ? "Message received" : "You're in. What happens next:"}
        </h3>
        <ol className="mx-auto mt-4 max-w-sm space-y-2 text-left text-sm text-base-300">
          <li>1. We get your details instantly (they land straight in our pipeline).</li>
          <li>2. We reply within one business day.</li>
          {source === "booking" && <li>3. We confirm your discovery-call slot and share next steps.</li>}
        </ol>
        {leadId && <p className="mt-4 text-xs text-base-600">Reference: {leadId.slice(0, 8)}</p>}

        {slot && (
          <p className="chip mt-4 w-fit text-sm" role="note">
            Chosen slot: {slot}
          </p>
        )}

        {showDeposit && (
          <div className="mt-6 rounded-xl border border-accent-soft bg-accent-soft/40 p-5 text-left">
            <p className="text-sm font-semibold text-base-100">
              Ready to lock your slot? (45% deposit / 55% on delivery)
            </p>
            <p className="mt-1 text-sm text-base-300">
              Deposit to our Meezan Bank account below, then ping us on WhatsApp to verify.
            </p>
            {/* Meezan Bank receiving account — the two numbers a client pays to. */}
            <div className="mt-4 space-y-2 rounded-lg border border-base-700 bg-base-900/60 p-3 text-sm">
              <CopyRow label="Meezan Bank account" value={siteConfig.bank.meezanAccount} />
              <CopyRow label="Meezan Bank IBAN" value={siteConfig.bank.meezanIban} />
            </div>

            {/* Deposit → verify flow */}
            <ol className="mt-4 space-y-2 text-sm text-base-300">
              <li>1. Send the 45% deposit using either reference above (a bank transfer or Meezan&apos;s app).</li>
              <li>2. Take a screenshot of the deposit.</li>
              <li>3. Send the screenshot on WhatsApp and tell us what you need us to start.</li>
              <li>4. Our team verifies the money arrived.</li>
              <li>5. Once verified, you&apos;re added to the waiting list and your slot is reserved.</li>
            </ol>

            {siteConfig.meezanDepositLink ? (
              <a
                href={siteConfig.meezanDepositLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 w-full"
              >
                Send your deposit via Meezan Bank
              </a>
            ) : (
              <a
                href={siteConfig.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-4 w-full"
              >
                Send your deposit screenshot on WhatsApp
              </a>
            )}
          </div>
        )}

        <a href="/" className="btn-secondary mt-6 inline-flex">
          Back to home
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {title && <h3 className="text-lg font-semibold text-base-100">{title}</h3>}

      {slot && (
        <p className="chip w-fit text-sm" role="note">
          Selected slot: {slot}
        </p>
      )}

      {/* Honeypot - hidden from real users, catches bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input ref={honeypot} type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required>
          <input name="name" required autoComplete="name" placeholder="Jane Doe" className="input" />
        </Field>
        {source !== "existing_client" && (
          <Field label="Email" required>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="jane@company.com"
              className="input"
            />
          </Field>
        )}
        <Field label="WhatsApp (optional)">
          <input name="whatsapp" autoComplete="tel" placeholder="+1 555 000 0000" className="input" />
        </Field>
        <Field label="Discord (optional)">
          <input name="discord" placeholder="username" className="input" />
        </Field>
      </div>

      {showNiche && (
        <Field label="What do you need?">
          <select name="niche" defaultValue={presetNiche || ""} className="input">
            <option value="">Select a service...</option>
            {siteConfig.niches.map((n) => (
              <option key={n.slug} value={n.slug}>
                {n.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      {showScope && (
        <Field label="Tell us about the project (scope, timeline, budget)">
          <textarea
            name="scope"
            rows={4}
            placeholder="e.g. A 5-page marketing site for a SaaS, wanted in 3 weeks..."
            className="input"
          />
        </Field>
      )}

      {source === "existing_client" && (
        <Field label="Project reference / what do you need help with?" required>
          <textarea name="notes" rows={4} required placeholder="Project name or order # + what you need..." className="input" />
        </Field>
      )}

      {source === "contact_form" && (
        <Field label="Message">
          <textarea name="message" rows={4} placeholder="How can we help?" className="input" />
        </Field>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <button type="submit" disabled={status === "submitting"} className="btn-primary w-full disabled:opacity-60">
        {status === "submitting" ? "Sending..." : submitLabel}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-base-200">
        {label}
        {required && <span className="text-accent-strong"> *</span>}
      </span>
      {children}
    </label>
  );
}

/** A label + monospace value with a copy-to-clipboard button. */
function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard not available (e.g. non-secure context) — still flash feedback.
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
