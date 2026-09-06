import type { Database } from "@/types/database";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

export function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="surface flex h-full flex-col p-6">
      <div className="text-accent-strong" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 7H6a3 3 0 0 0-3 3v7h7v-7H6.5A2.5 2.5 0 0 1 9 7.5V7h1zm11 0h-4a3 3 0 0 0-3 3v7h7v-7h-3.5a2.5 2.5 0 0 1 2.5-2.5V7h1z" />
        </svg>
      </div>
      <blockquote className="mt-3 flex-1 text-base-200">“{item.quote}”</blockquote>
      <figcaption className="mt-5">
        <p className="font-semibold text-base-100">{item.name}</p>
        {item.role && <p className="text-sm text-base-400">{item.role}</p>}
      </figcaption>
    </figure>
  );
}
