import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/ui/reveal";
import { getCaseStudies, getCaseStudyBySlug, fallbackCaseStudies } from "@/lib/content";
import { siteConfig } from "@/lib/config";

export const dynamicParams = true;

/** Published row from Supabase, else our always-available shipped work. */
async function findCaseStudy(slug: string) {
  const fromDb = await getCaseStudyBySlug(slug);
  if (fromDb) return fromDb;
  return fallbackCaseStudies().find((s) => s.slug === slug) ?? null;
}

/** Pre-build static paths from published slugs (falls back to shipped work). */
export async function generateStaticParams() {
  const fetched = await getCaseStudies();
  const studies = fetched.length > 0 ? fetched : fallbackCaseStudies();
  return studies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await findCaseStudy(slug);
  if (!study) return { title: "Case study not found" };
  return {
    title: study.title,
    description: study.summary,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await findCaseStudy(slug);
  if (!study) notFound();

  const nicheLabel =
    siteConfig.niches.find((n) => n.slug === study.niche)?.label ?? study.niche;
  const images = Array.isArray(study.image_urls) ? (study.image_urls as string[]) : [];

  return (
    <div>
      <section className="container-px py-16 sm:py-20">
        <Link href="/portfolio" className="text-sm text-base-400 hover:text-base-100">
          ← All work
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="chip">{nicheLabel}</span>
        </div>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight text-base-100 sm:text-5xl">
          {study.title}
        </h1>
        {study.summary && (
          <p className="mt-5 max-w-2xl text-lg text-base-400">{study.summary}</p>
        )}

        {/* Problem / Solution / Result */}
        <Reveal className="mt-12 grid gap-5 md:grid-cols-3">
          {study.problem && (
            <div className="surface flex flex-col p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-accent-strong">
                The problem
              </h2>
              <p className="mt-3 flex-1 text-base-300">{study.problem}</p>
            </div>
          )}
          {study.solution && (
            <div className="surface flex flex-col p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-accent-strong">
                The solution
              </h2>
              <p className="mt-3 flex-1 text-base-300">{study.solution}</p>
            </div>
          )}
          {study.result && (
            <div className="surface flex flex-col p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-accent-strong">
                The result
              </h2>
              <p className="mt-3 flex-1 text-base-300">{study.result}</p>
            </div>
          )}
        </Reveal>

        {/* Web dev: live preview link */}
        {study.preview_url && (
          <div className="mt-10">
            <a
              href={study.preview_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              View live site ↗
            </a>
          </div>
        )}

        {/* Video editing: embedded preview */}
        {study.video_url && (
          <div className="mt-10 overflow-hidden rounded-2xl border border-base-700 bg-base-900">
            <video
              src={study.video_url}
              controls
              preload="metadata"
              className="aspect-video w-full"
            />
          </div>
        )}

        {/* Copywriting: original sample excerpt */}
        {study.excerpt && (
          <figure className="mt-10 rounded-2xl border-l-4 border-accent bg-base-900 p-6">
            <blockquote className="text-lg italic text-base-200">“{study.excerpt}”</blockquote>
            <figcaption className="mt-2 text-sm text-base-400">
              — Sample from this project
            </figcaption>
          </figure>
        )}

        {/* Graphic design: image gallery */}
        {images.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt={`${study.title} — visual ${i + 1}`}
                loading="lazy"
                className="aspect-[4/3] w-full rounded-2xl border border-base-700 object-cover"
              />
            ))}
          </div>
        )}

        {/* Graphic design: before/after */}
        {study.before_after && typeof study.before_after === "object" && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {(["before", "after"] as const).map((side) => {
              const src = (study.before_after as Record<string, string>)[side];
              if (!src) return null;
              return (
                <figure
                  key={side}
                  className="overflow-hidden rounded-2xl border border-base-700 bg-base-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${side === "before" ? "Before" : "After"} the redesign`}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="p-3 text-sm font-semibold uppercase tracking-wide text-base-400">
                    {side}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <Reveal className="surface mt-16 flex h-full w-full flex-col items-center justify-between gap-6 rounded-2xl p-8 sm:flex-row sm:p-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-base-100">
              This is one project. Imagine yours.
            </h2>
            <p className="mt-2 max-w-md text-base-400">
              Same process, same attention — scoped for your goals and your budget.
            </p>
          </div>
          <Link href="/book" className="btn-primary shrink-0">
            Book a call
          </Link>
        </Reveal>
      </section>
    </div>
  );
}