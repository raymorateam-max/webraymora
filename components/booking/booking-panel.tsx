"use client";

import { useState } from "react";
import { LeadForm } from "@/components/forms/lead-form";
import { BookingCalendar, type BookingSlot } from "@/components/booking/booking-calendar";

/**
 * Booking panel for the /book page. Holds the calendar's selected slot and
 * passes it to the lead form as a display string so the lead carries the
 * chosen date + time through the pipeline.
 */
export function BookingPanel({
  presetNiche = "",
  presetTier = "",
}: {
  presetNiche?: string;
  presetTier?: string;
}) {
  const [slot, setSlot] = useState<BookingSlot | null>(null);
  const slotLabel = slot
    ? `${slot.dateLabel}${slot.time ? " — " + slot.time : ""}`
    : "";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px]">
      {/* LEFT — your details + the chosen slot */}
      <section aria-label="Your details" className="surface rounded-2xl p-6 sm:p-8">
        <LeadForm
          source="booking"
          presetNiche={presetNiche}
          presetTier={presetTier}
          showScope
          showDeposit
          slot={slotLabel}
          title="Your details"
          submitLabel="Send details & book"
        />
        <p className="mt-6 border-t border-base-700 pt-4 text-xs text-base-400" role="note">
          No charge to book. If you proceed, it&apos;s a 45% deposit via Payoneer; 55% on
          delivery.
        </p>
      </section>

      {/* RIGHT — calendar (sticky on lg) */}
      <aside aria-label="Pick a time" className="self-start lg:sticky lg:top-8">
        <div className="surface rounded-2xl p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-base-100">Pick a time</h3>
          <div className="mt-5">
            <BookingCalendar value={slot} onChange={setSlot} />
          </div>
        </div>
      </aside>
    </div>
  );
}