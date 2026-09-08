import Link from "next/link";
import type { Database } from "@/types/database";
import { siteConfig } from "@/lib/config";

type CaseStudy = Database["public"]["Tables"]["case_studies"]["Row"];

export function CaseStudyCard({ item }: { item: CaseStudy }) {
  const nicheLabel =
    siteConfig.niches.find((n) => n.slug === item.niche)?.label ?? item.niche;
  return (
    <Link
      href={`/portfolio/${item.slug}`}
      className="surface surface-hover group flex h-full flex-col p-6"
    >
      <span className="chip w-fit">{nicheLabel}</span>
      <h3 className="mt-4 text-lg font-semibold text-base-100 group-hover:text-accent-strong">
        {item.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm text-base-400">{item.summary}</p>
      {item.result && (
        <p className="mt-4 text-sm font-medium text-success">{item.result}</p>
      )}
      <span className="mt-6 text-sm font-semibold text-accent-strong">View case study →</span>
    </Link>
  );
}
