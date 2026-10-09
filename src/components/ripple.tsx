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
  // Outer span takes the caller's size/position; the inner one is the rings' containing block.
  return (
    <span aria-hidden="true" className={`pointer-events-none block ${className}`}>
      <span className="relative block size-full">
        {Array.from({ length: rings }, (_, i) => (
          <span
            key={i}
            className={`absolute inset-0 rounded-full border-2 ${animated ? "animate-ripple" : ""}`}
            style={{
              borderColor: color,
              ...(animated
                ? ({ animationDelay: `${(i * 2.4) / rings}s`, "--s": (i + 1) / rings } as React.CSSProperties)
                : { transform: `scale(${(i + 1) / rings})`, opacity: 1 - i / (rings + 0.5) }),
            }}
          />
        ))}
        <span
          className="absolute left-1/2 top-1/2 size-[14%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: color }}
        />
      </span>
    </span>
  );
}
