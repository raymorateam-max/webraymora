import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase";

/**
 * POST /api/lead
 *
 * The single intake point for every lead that comes through the site:
 *   - booking submissions (Book page)
 *   - general contact form (Contact page)
 *   - existing-client support requests (Contact page)
 *
 * Behavior:
 *   1. Save the lead to Supabase `leads` (stage "Discovery & Deal") —
 *      the site's source of truth.
 *   2. Fire the n8n webhook so the lead lands in the existing Google
 *      Sheets tracker with the same columns (Client/Stage/Niche/Scope/
 *      Deposit Paid/Final Paid/Preview URL).
 *   3. Record a `lead_events` row for the intake.
 *   4. Email a notification to the agency inbox via Resend.
 *      Recipient = LEAD_NOTIFY_EMAIL, falling back to the site contact email.
 *      Set RESEND_API_KEY in your Vercel env.
 *
 * Steps 2-4 are best-effort: if any of them fails, the lead is still
 * saved and the response still succeeds — an integration hiccup never
 * loses a lead.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  // ---- Validate required fields ----
  const name = str(payload.name);
  const email = str(payload.email);
  const source = str(payload.source) || "booking";

  if (!name) {
    return NextResponse.json({ ok: false, error: "name is required" }, { status: 400 });
  }
  if (source !== "existing_client" && !email) {
    return NextResponse.json({ ok: false, error: "email is required" }, { status: 400 });
  }

  // ---- 1. Save lead to Supabase ----
  let leadId: string | null = null;
  if (isSupabaseConfigured()) {
    try {
      const client = createAdminClient();
      const { data, error } = await client
        .from("leads")
        .insert({
          name,
          email: email || null,
          whatsapp: str(payload.whatsapp) || null,
          niche: str(payload.niche) || null,
          tier: str(payload.tier) || null,
          scope: str(payload.scope) || null,
          source,
          notes: slotToNotes(str(payload.slot), str(payload.notes) || str(payload.message)),
          status: "Discovery & Deal",
        })
        .select("id")
        .single();
      if (error) throw error;
      leadId = data.id;

      // Record intake event (best-effort; failure is not fatal)
      await client.from("lead_events").insert({ lead_id: leadId, stage: "Discovery & Deal" });
    } catch (err) {
      console.error("[api/lead] Supabase insert failed:", err);
    }
  }

  // ---- 2. Fire n8n webhook (best-effort mirror to Google Sheets) ----
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  let webhookSent = false;
  if (webhookUrl) {
    try {
      const webhookPayload = {
        lead_id: leadId,
        client: name,
        email: email || "",
        stage: "Discovery & Deal",
        niche: str(payload.niche) || "",
        scope: str(payload.tier)
          ? `${str(payload.tier)}${str(payload.scope) ? " — " + str(payload.scope) : ""}`
          : str(payload.scope) || "",
        source,
        deposit_paid: false,
        final_paid: false,
        preview_url: str(payload.preview_url) || "",
        whatsapp: str(payload.whatsapp) || "",
        notes: slotToNotes(str(payload.slot), str(payload.notes) || str(payload.message)),
      };
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
        signal: AbortSignal.timeout(8000),
      });
      webhookSent = res.ok;
      if (!res.ok) {
        console.error("[api/lead] n8n webhook non-2xx:", res.status, await res.text().catch(() => ""));
      }
    } catch (err) {
      console.error("[api/lead] n8n webhook failed (lead still saved):", err);
    }
  }

  // ---- 3. Email the notification to the agency inbox (best-effort) ----
  // Sent through Resend (resend.com). Set RESEND_API_KEY in your Vercel env.
  // If the env isn't set, this step is skipped entirely and the lead is still
  // saved. From-address must match your verified Resend domain (defaults to
  // the onboarding sandbox until you verify a domain).
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM ?? "Raymora <onboarding@resend.dev>";
  const notifyEmail =
    process.env.LEAD_NOTIFY_EMAIL ?? process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
  let emailSent = false;
  if (apiKey && notifyEmail) {
    const resend = new Resend(apiKey);
    const slot = str(payload.slot);
    const niche = str(payload.niche);
    const tier = str(payload.tier);
    const scope = str(payload.scope);
    const message = str(payload.notes) || str(payload.message);
    const leadLine = getLeadLine(source, niche, tier, name);

    const text = [
      leadLine,
      `Name: ${name}`,
      `Email: ${email || "—"}`,
      str(payload.whatsapp) ? `WhatsApp: ${str(payload.whatsapp)}` : "",
      scope ? `Scope: ${scope}` : "",
      slot ? `Chosen slot: ${slot}` : "",
      message ? `Message:\n${message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const html = [
      `<p><strong>${escapeHtml(leadLine)}</strong></p>`,
      "<table>",
      row("Name", name),
      row("Email", email || "—"),
      row("WhatsApp", str(payload.whatsapp)),
      row("Scope", scope),
      row("Chosen slot", slot),
      row("Message", message),
      "</table>",
    ].join("");

    const { data, error } = await resend.emails.send(
      {
        from: fromAddress,
        to: [notifyEmail],
        replyTo: email || undefined,
        subject: leadLine,
        text,
        html,
      },
      { idempotencyKey: `lead-notify/${leadId ?? `${Date.now()}-${name}`}` }
    );

    if (error) {
      console.error("[api/lead] Resend email send failed (lead still saved):", error.message);
    } else {
      emailSent = true;
    }
  }

  return NextResponse.json({
    ok: true,
    lead_id: leadId,
    webhook_sent: webhookSent,
    email_sent: emailSent,
  });
}

/**
 * One-line summary of the lead for the email subject line.
 * e.g. "BOOKING • Web Development • Standard — Alice" or "[SUPPORT] Alice".
 */
function getLeadLine(source: string, niche: string, tier: string, name: string): string {
  if (source === "existing_client") return `[SUPPORT] ${name}`;
  const parts = [source === "booking" ? "BOOKING" : "NEW LEAD"];
  if (niche) parts.push(niche);
  if (tier) parts.push(tier);
  return `${parts.join(" • ")} — ${name}`;
}

/** Build one row of the notification email table, escaping both cells. */
function row(label: string, value: string): string {
  return value
    ? `<tr><td valign="top" style="padding-right:12px"><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(value)}</td></tr>`
    : "";
}

/** Escape lead input so it can never inject markup into the email. */
function escapeHtml(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Prefix a chosen booking slot onto any free-form notes. */
function slotToNotes(slot: string, fallback: string): string {
  const parts: string[] = [];
  if (slot) parts.push(`Chosen slot: ${slot}`);
  if (fallback) parts.push(fallback);
  return parts.length ? parts.join(" — ") : "";
}
