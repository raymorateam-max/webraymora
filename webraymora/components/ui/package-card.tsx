import Link from "next/link";
import type { Database } from "@/types/database";

type PackageRow = Database["public"]["Tables"]["packages"]["Row"];

function formatPkr(n: number | null): string | null {
  if (n == null) return null;
  return `Rs. ${n.toLocaleString("en-US")}`;
}

function formatUsd(n: number | null): string | null {
  if (n == null) return null;
  return `$${n.toLocaleString("en-US")}`;
}

export function PackageCard({ pkg }: { pkg: PackageRow }) {
  const min = formatPkr(pkg.price_min);
  const max = formatPkr(pkg.price_max);
  const usdMin = formatUsd(pkg.price_usd_min);
  const usdMax = formatUsd(pkg.price_usd_max);
  const features = Array.isArray(pkg.features) ? (pkg.features as string[]) : [];

  return (
    <div
      className={`surface relative flex h-full flex-col p-6 ${
        pkg.popular ? "border-accent-soft ring-1 ring-accent/40" : ""
      }`}
    >
      {pkg.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          Popular
        </span>
      )}
      <h3 className="text-base font-semibold uppercase tracking-wide text-base-300">{pkg.tier}</h3>
      <p className="mt-1 text-lg font-semibold text-base-100">{pkg.name}</p>

      <p className="mt-3 text-2xl font-bold text-base-100">
        {min ? (
          <>
            {max ? `${min}–${max}` : `${min}`}
            <span className="ml-1 text-sm font-normal text-base-400">/ project</span>
          </>
        ) : (
          "Custom quote"
        )}
      </p>

      {usdMin && (
        <p className="mt-1 text-xs text-base-400">
          ≈ {usdMin}
          {usdMax ? `–${usdMax}` : ""} USD
        </p>
      )}

      {features.length > 0 && (
        <ul className="mt-5 flex-1 space-y-2 text-sm text-base-300">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="mt-0.5 text-accent-strong">✓</span>
              {f}
            </li>
          ))}
        </ul>
      )}

      {pkg.timeline || pkg.stack ? (
        <div className="mt-5 space-y-1 border-t border-base-700 pt-3 text-xs text-base-400">
          {pkg.timeline && <p>Timeline · {pkg.timeline}</p>}
          {pkg.stack && <p>Stack · {pkg.stack}</p>}
        </div>
      ) : null}

      <Link
        href={`/book?niche=${pkg.niche}&tier=${encodeURIComponent(pkg.tier)}`}
        className={`${pkg.popular ? "btn-primary" : "btn-secondary"} mt-6 w-full`}
      >
        Select {pkg.name}
      </Link>
    </div>
  );
}
