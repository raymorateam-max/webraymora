"use client";

import { useEffect } from "react";

/**
 * Adds a light momentum to wheel scrolling via Lenis so the site scrolls
 * smooth (never janky) — the premium-agency feel. Respects reduced-motion
 * and leaves touch / trackpad gestures native.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let instance: { raf: (time: number) => void; destroy: () => void } | null = null;

    import("lenis").then(({ default: Lenis }) => {
      instance = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
      const loop = (time: number) => {
        instance?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      instance?.destroy();
    };
  }, []);

  return null;
}