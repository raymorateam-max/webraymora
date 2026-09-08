"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Parallax scroll section — shifts content at a different speed than scroll.
 * Creates depth effect as user scrolls past.
 */
export function ParallaxSection({
  children,
  speed = 0.3,
  className = "",
}: {
  children: ReactNode;
  /** Parallax intensity (0 = no movement, 1 = full scroll speed). */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        // Only apply when element is in/near viewport
        if (rect.bottom > -100 && rect.top < viewHeight + 100) {
          const center = rect.top + rect.height / 2 - viewHeight / 2;
          el.style.transform = `translateY(${center * speed * -1}px)`;
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
