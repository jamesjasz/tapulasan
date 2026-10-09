/** The NFC ripple: concentric rings from a point of touch. `animated` loops (disabled under reduced motion via CSS). */
export function Ripple({
  className = "",
  rings = 3,
  animated = false,
  color = "currentColor",
}: {
  className?: string;
  rings?: number;
  animated?: boolean;
  color?: string;
}) {
  return (
    <span aria-hidden="true" className={`pointer-events-none relative block ${className}`}>
      {Array.from({ length: rings }, (_, i) => (
        <span
          key={i}
          className={`absolute inset-0 rounded-full border-2 ${animated ? "animate-ripple" : ""}`}
          style={{
            borderColor: color,
            ...(animated
              ? { animationDelay: `${(i * 2.4) / rings}s`, opacity: 0 }
              : { transform: `scale(${(i + 1) / rings})`, opacity: 1 - i / (rings + 0.5) }),
          }}
        />
      ))}
      <span className="absolute left-1/2 top-1/2 size-[14%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: color }} />
    </span>
  );
}
