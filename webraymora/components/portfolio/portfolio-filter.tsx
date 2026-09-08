"use client";

import { useMemo, useState } from "react";
import { siteConfig } from "@/lib/config";
import type { Database } from "@/types/database";
import { CaseStudyCard } from "@/components/ui/case-study-card";

type CaseStudy = Database["public"]["Tables"]["case_studies"]["Row"];

/**
 * Client-side portfolio grid with niche filtering. Receives the full
 * published list from the server component and filters in-memory —
 * no extra network round-trips, instant tab switching.
 */
export function PortfolioFilter({ items }: { items: CaseStudy[] }) {
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(
    () => (active === "all" ? items : items.filter((i) => i.niche === active)),
    [items, active]
  );

  if (items.length === 0) {
    return (
      <div className="surface p-10 text-center text-sm text-base-400">
        Case studies are being added. Check back soon, or{" "}
        <a href="/book" className="text-accent-strong underline">
          book a call
        </a>{" "}
        to see what we can do.
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter portfolio by niche">
        <button
          type="button"
          role="tab"
          aria-selected={active === "all"}
          onClick={() => setActive("all")}
          className={`chip cursor-pointer transition-colors ${
            active === "all" ? "border-accent text-accent-strong" : "hover:border-base-600"
          }`}
        >
          All
        </button>
        {siteConfig.niches.map((n) => (
          <button
            key={n.slug}
            type="button"
            role="tab"
            aria-selected={active === n.slug}
            onClick={() => setActive(n.slug)}
            className={`chip cursor-pointer transition-colors ${
              active === n.slug ? "border-accent text-accent-strong" : "hover:border-base-600"
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <CaseStudyCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
