"use client";

/**
 * Decorative floating gradient orbs for background depth.
 * Purely visual, respects reduced motion.
 */
export function FloatingOrbs({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const orbs = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 200 + i * 120,
    left: `${15 + i * 25}%`,
    top: `${10 + i * 20}%`,
    color: i % 2 === 0 ? "rgba(143, 109, 255, 0.12)" : "rgba(178, 156, 255, 0.08)",
    delay: `${i * 2}s`,
  }));

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {orbs.map((orb) => (
        <div
          key={orb.id}
          className="orb"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.left,
            top: orb.top,
            background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
            animationDelay: orb.delay,
          }}
        />
      ))}
    </div>
  );
}
