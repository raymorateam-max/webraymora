"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Word-by-word text reveal animation.
 * Splits text into words and animates each one in sequence on scroll.
 */
export function TextReveal({
  text,
  className = "",
  as: Tag = "p",
  delay = 0,
  staggerMs = 50,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  staggerMs?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
      { threshold: 0.2, rootMargin: "0px 0px -30px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <Tag ref={ref as never} className={className}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className={`text-reveal-word ${visible ? "revealed" : ""}`}
          style={{ "--word-delay": `${delay + i * staggerMs}ms` } as React.CSSProperties}
        >
          {word}{" "}
        </span>
      ))}
    </Tag>
  );
}
