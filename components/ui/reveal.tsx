"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Dir = "up" | "down" | "left" | "right" | "scale" | "none";

/**
 * Scroll-reveal wrapper. Fades/slides its children in once they enter the
 * viewport. Supports a per-element `delay` for tasteful stagger and a
 * `dir` for direction. Fully disabled under prefers-reduced-motion (the
 * element is simply visible, no transition).
 */
export function Reveal({
  children,
  delay = 0,
  dir = "up",
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  /** Stagger delay in ms — use i * 70 for grids. */
  delay?: number;
  dir?: Dir;
  as?: "div" | "section" | "li" | "figure" | "article" | "span";
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reduced motion: reveal immediately, no observer needed.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  return (
    <Tag
      ref={ref as never}
      data-dir={dir}
      className={`reveal ${visible ? "revealed" : ""} ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  );
}