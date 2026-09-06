import Link from "next/link";
import { NicheIcon } from "@/components/ui/niche-icon";
import { siteConfig } from "@/lib/config";

type Niche = (typeof siteConfig.niches)[number];

/**
 * Service picker card used on Home / About / Portfolio. One click away from
 * the matching /services#<slug> anchor. Live crafts show pricing links;
 * upcoming crafts are marked "Coming soon" and queue interest via /book.
 */
export function ServiceCard({ niche }: { niche: Niche }) {
  const live = niche.status === "live";
  return (
    <Link
      href={`/services#${niche.slug}`}
      className={`surface surface-hover group flex h-full flex-col p-6 ${live ? "" : "opacity-90"}`}
    >
      <NicheIcon niche={niche.slug} className="h-7 w-7 text-accent-strong" />
      <div className="mt-4 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-base-100 group-hover:text-accent-strong">
          {niche.label}
        </h3>
        <span className={`chip shrink-0 text-xs ${live ? "text-accent-strong" : "text-base-400"}`}>
          {live ? "Live now" : "Coming soon"}
        </span>
      </div>
      <p className="mt-1 grow text-sm text-base-400">{niche.blurb}</p>
      <span className="mt-5 text-sm font-semibold text-accent-strong">
        {live ? "See pricing →" : "Coming soon — be first in line"}
      </span>
    </Link>
  );
}