"use client";

import { useMemo, useState } from "react";

export interface BookingSlot {
  date: Date; // selected calendar date
  dateLabel: string; // e.g. "Tue 8 Sep"
  time: string; // e.g. "11:00"
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Fixed readable time slots (10:00–18:00 local, hourly-ish gaps).
const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const NOW = new Date();
const TODAY = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate()).getTime();
const todayIndex = NOW.getDate();

function fmtDate(d: Date) {
  return `${WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}
function isToday(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() === TODAY;
}
function isPast(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() < TODAY;
}

/** Build the 6x7 grid (Mon-first) for a month, padded with blanks. */
function buildMonth(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  // Monday-first offset (getDay: Sun=0..Sat=6) -> Mon=0 index
  const lead = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function BookingCalendar({
  value,
  onChange,
}: {
  value: BookingSlot | null;
  onChange: (slot: BookingSlot) => void;
}) {
  const [year, setYear] = useState(NOW.getFullYear());
  const [month, setMonth] = useState(NOW.getMonth());
  const [selected, setSelected] = useState<Date | null>(null);

  const cells = useMemo(() => buildMonth(year, month), [year, month]);

  // Prev allowed only when the shown month is strictly after the current month.
  const thisMonthStart = new Date(NOW.getFullYear(), NOW.getMonth(), 1).getTime();
  const shownMonthStart = new Date(year, month, 1).getTime();
  const prevAllowed = shownMonthStart > thisMonthStart;

  function go(offset: number) {
    const d = new Date(year, month + offset, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setSelected(null);
  }

  return (
    <div>
      {/* Header: month + nav */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-base-100">
          {MONTHS[month]} {year}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={!prevAllowed}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-base-300 transition-colors hover:border-accent-soft hover:text-base-100 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-600 text-base-300 transition-colors hover:border-accent-soft hover:text-base-100"
          >
            ›
          </button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-base-400">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      {/* Day cells */}
      <div className="mt-2 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const past = isPast(day);
          const isSel = selected && day.getTime() === selected.getTime();
          const today = isToday(day);
          return (
            <button
              key={i}
              type="button"
              disabled={past}
              onClick={() => {
                setSelected(day);
                onChange({ date: day, dateLabel: fmtDate(day), time: "" });
              }}
              aria-pressed={!!isSel}
              aria-label={`Pick ${fmtDate(day)}`}
              className={`relative aspect-square rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed disabled:text-base-600 ${
                isSel
                  ? "bg-accent text-white shadow-[0_6px_18px_-6px_rgba(143,109,255,0.7)]"
                  : today
                    ? "border border-accent-soft text-accent-strong hover:bg-accent-faint hover:text-accent-strong"
                    : "text-base-200 hover:bg-base-800 hover:text-base-100"
              }`}
            >
              {day.getDate()}
              {today && !isSel && (
                <span className="absolute inset-x-0 bottom-1 mx-auto block h-1 w-1 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {selected ? (
        <div className="mt-5 border-t border-base-700 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-base-400">
            Time — {fmtDate(selected)}
          </p>
          <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-5">
            {TIME_SLOTS.map((t) => {
              const active = value?.time === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ date: selected, dateLabel: fmtDate(selected), time: t })}
                  aria-pressed={active}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-accent-soft bg-accent-soft text-accent-strong"
                      : "border-base-600 text-base-200 hover:border-accent-soft hover:text-base-100"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-5 border-t border-base-700 pt-4 text-xs text-base-400">
          Pick a day above to see available times.
        </p>
      )}
    </div>
  );
}