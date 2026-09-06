import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ServiceCard } from "@/components/ui/service-card";
import { siteConfig } from "@/lib/config";
import { getSiteContent, fallbackCopy } from "@/lib/content";

export const metadata: Metadata = {
  title: "About — One agency, one proven process",
  description:
    "Raymora is a web development agency with a real process — fixed scope, fixed price, no handshake deals. Graphic design, video editing, and copywriting launch soon.",
};

interface TeamMember {
  name: string;
  role: string;
  blurb: string;
}

export default async function AboutPage() {
  const story = await getSiteContent("about_story");
  const storyTitle = story?.title ?? "Why we exist";
  const storyBody = story?.body ?? fallbackCopy.aboutStory;
  const members = (story?.extra?.team as TeamMember[] | undefined) ?? [];

  return (
    <div>
      <section className="container-px py-16 sm:py-20">
        <SectionHeading
          eyebrow="About us"
          title="One agency, one proven process"
          subtitle="Web development ships now, end to end — and every project runs through the same proven stages, so you always know what's happening."
        />

        {/* Story */}
        <div className="mx-auto mt-12 max-w-3xl">
          <h2 className="text-2xl font-bold tracking-tight text-base-100">{storyTitle}</h2>
          <p className="mt-4 text-lg leading-relaxed text-base-300">{storyBody}</p>
        </div>

        {/* The four crafts */}
        <section aria-label="What we do" className="mt-16">
          <SectionHeading
            eyebrow="What we do"
            title="Web now — the rest soon"
            subtitle="Web development ships today; graphic design, video, and copy are building for launch."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {siteConfig.niches.map((n, i) => (
              <Reveal key={n.slug} delay={i * 70} className="h-full">
                <ServiceCard niche={n} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Our process — the anti-handshake-deal value prop */}
        <section aria-label="Our process" className="mt-16">
          <SectionHeading
            eyebrow="How we work"
            title="No handshake deals"
            subtitle="A fixed scope, a fixed price, and a process with stages you can follow."
          />
          <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {siteConfig.processStages.map((stage, i) => (
              <Reveal as="li" key={stage.title} delay={i * 80} className="surface p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-strong">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold text-base-100">{stage.title}</h3>
                <p className="mt-1 text-sm text-base-400">{stage.detail}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Team — Phase 4 future-ready */}
        <section aria-label="Team" className="mt-16">
          <SectionHeading
            eyebrow="Team"
            title="The people behind the work"
            subtitle="Today it's the founder shipping the work; as we grow, each profile lands here."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {members.length > 0 ? (
              members.map((member, i) => (
                <Reveal key={member.name} delay={i * 80}>
                  <div className="surface p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-lg font-bold text-accent-strong">
                      {member.name.charAt(0)}
                    </div>
                    <h3 className="mt-4 font-semibold text-base-100">{member.name}</h3>
                    <p className="text-sm text-accent-strong">{member.role}</p>
                    <p className="mt-2 text-sm text-base-400">{member.blurb}</p>
                  </div>
                </Reveal>
              ))
            ) : (
              <Reveal>
                <div className="surface p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-lg font-bold text-accent-strong">
                    F
                  </div>
                  <h3 className="mt-4 font-semibold text-base-100">Founder</h3>
                  <p className="text-sm text-accent-strong">Founder & Lead</p>
                  <p className="mt-2 text-sm text-base-400">
                    Content-slot: team profiles are added here as the agency scales.
                  </p>
                </div>
              </Reveal>
            )}
          </div>
        </section>

        {/* CTA */}
        <Reveal className="surface mt-16 flex h-full w-full flex-col items-center justify-between gap-6 rounded-2xl p-8 text-center sm:flex-row sm:text-left sm:p-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-base-100">
              Let's build something.
            </h2>
            <p className="mt-2 max-w-md text-base-400">
              A free discovery call is the fastest way to see if we're a fit.
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