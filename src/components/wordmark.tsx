export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-display text-[1.375rem] font-extrabold tracking-[-0.04em] ${className}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[1.05em]">
        <circle cx="12" cy="12" r="3.2" fill="var(--color-tap)" />
        <circle cx="12" cy="12" r="7" fill="none" stroke="var(--color-tap)" strokeWidth="2" opacity=".7" />
        <circle cx="12" cy="12" r="10.6" fill="none" stroke="var(--color-tap)" strokeWidth="1.6" opacity=".35" />
      </svg>
      <span>
        Tap<span className="font-semibold">Ulasan</span>
      </span>
    </span>
  );
}
