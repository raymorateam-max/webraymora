"use client";

import { useRef, type ReactNode } from "react";

/**
 * Magnetic button — the button subtly follows the cursor when hovered,
 * creating a magnetic pull effect.
 */
export function MagneticButton({
  children,
  className = "",
  strength = 0.3,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
    el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    setTimeout(() => {
      if (el) el.style.transition = "";
    }, 400);
  };

  return (
    <div
      ref={ref}
      className={`magnetic-btn inline-block ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}
