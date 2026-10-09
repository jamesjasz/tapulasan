"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Star } from "lucide-react";
import { getDict, type Lang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { BadgeFace } from "./badge/face-canvas";

// Stage geometry (percent of the square stage). The NFC point is where the face's coil sits.
const BADGE = { left: 7, top: 20, width: 44 }; // table stand, 100×150 mm → height = 66
const NFC = { x: BADGE.left + BADGE.width / 2, y: BADGE.top + BADGE.width * 1.5 * 0.885 };

type Frame = { phase: "rest" | "approach" | "tap" | "open"; stars: number; chars: number };
const REST: Frame = { phase: "rest", stars: 0, chars: 0 };

// Phone pose per phase. Moved with a CSS transition whose easing overshoots slightly, like a spring.
const POSE: Record<Frame["phase"], string> = {
  rest: "translate(0%, 0%) rotate(7deg)",
  approach: "translate(-108%, 6%) rotate(-9deg)",
  tap: "translate(-108%, 6%) rotate(-9deg)",
  open: "translate(-30%, -3%) rotate(-2deg)",
};

/** Plays when at least 40% of the element is on screen. */
function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

/** Hero: a phone taps the badge, the ripple bursts, a (generic) review screen opens. */
export function TapDemo({ lang }: { lang: Lang }) {
  const t = getDict(lang).home.demo;
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root);
  const [frame, setFrame] = useState<Frame>(REST);
  const [run, setRun] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const play = useCallback(() => {
    clear();
    const at = (ms: number, f: Partial<Frame>) => timers.current.push(setTimeout(() => setFrame((p) => ({ ...p, ...f })), ms));
    at(0, REST);
    at(700, { phase: "approach" });
    at(1500, { phase: "tap" });
    at(2000, { phase: "open" });
    for (let s = 1; s <= 5; s++) at(2500 + s * 180, { stars: s });
    const typed = t.typed.length;
    for (let c = 1; c <= typed; c++) at(3700 + c * 45, { chars: c });
    // Calm loop: hold the finished review, then start again.
    timers.current.push(setTimeout(() => setRun((r) => r + 1), 3700 + typed * 45 + 2600));
  }, [t.typed.length]);

  useEffect(() => {
    if (reduced || !inView) return clear;
    play();
    return clear;
  }, [inView, reduced, run, play]);

  if (reduced) return <Storyboard lang={lang} />;

  return (
    <figure ref={root} className="relative">
      <div className="relative aspect-square w-full overflow-hidden rounded-stage stage" role="img" aria-label={t.label}>
        <Floor />
        <Badge lang={lang} />
        <Burst on={frame.phase === "tap" || frame.phase === "open"} key={`burst-${run}`} />
        <div
          className="absolute transition-transform duration-700 ease-[cubic-bezier(.34,1.4,.5,1)]"
          style={{ left: "57%", top: "9%", width: "35%", transform: POSE[frame.phase] }}
        >
          <Phone frame={frame} lang={lang} />
        </div>
      </div>
      <figcaption className="mt-2 flex items-center justify-between gap-3 text-sm text-ink-soft lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0 lg:py-1 lg:pl-5 lg:pr-2">
        <span>{t.caption}</span>
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          className="flex min-h-11 items-center gap-1.5 rounded-full px-3 font-semibold text-ink hover:bg-ink/5"
        >
          <RotateCcw aria-hidden="true" className="size-4" /> {t.replay}
        </button>
      </figcaption>
    </figure>
  );
}

function Floor() {
  return <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[16%] bg-[#e1d4bf]" />;
}

function Badge({ lang }: { lang: Lang }) {
  return (
    <div className="absolute" style={{ left: `${BADGE.left}%`, top: `${BADGE.top}%`, width: `${BADGE.width}%` }}>
      <div style={{ filter: "drop-shadow(0 18px 18px #15120f45)" }}>
        <BadgeFace slug="table-stand" lang={lang} longSide={720} className="rounded-[6%]" />
      </div>
      <div className="mx-[-6%] -mt-[3%] h-[9%] min-h-3 rounded-[4px] bg-ink-raised" />
    </div>
  );
}

function Burst({ on }: { on: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute aspect-square w-[70%] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${NFC.x}%`, top: `${NFC.y}%` }}
    >
      {on &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            className="animate-burst absolute inset-0 rounded-full border-[3px] border-tap opacity-0"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
    </div>
  );
}

function Phone({ frame, lang, still = false }: { frame: Frame; lang: Lang; still?: boolean }) {
  const t = getDict(lang).home.demo;
  const open = frame.phase === "open";
  return (
    <div className="relative aspect-[9/18.5] w-full rounded-[16%/8%] bg-ink p-[4.5%] shadow-object">
      <div className="@container relative h-full w-full overflow-hidden rounded-[12%/6%] bg-paper-raised">
        <div className="absolute left-1/2 top-[2.5%] z-10 h-[3%] w-[30%] -translate-x-1/2 rounded-full bg-ink" />
        {/* Lock screen */}
        <div
          className={`absolute inset-0 flex flex-col items-center bg-[#2a2420] pt-[24%] text-paper ${still ? "" : "transition-opacity duration-300"} ${open ? "opacity-0" : ""}`}
        >
          <p className="font-display text-[22cqi] font-bold leading-none tabular-nums">
            09.41
          </p>
          <span className="mt-auto mb-[18%] rounded-full bg-paper/15 px-[8%] py-[3%] font-mono text-[7cqi] tracking-[0.15em]">
            {t.tap}
          </span>
        </div>
        {/* Generic, clearly illustrative review screen (not Google's UI). */}
        <div
          className={`absolute inset-0 flex flex-col px-[8%] pt-[16%] text-ink ${still ? "" : "transition-[opacity,translate] duration-400"} ${open ? "" : "translate-y-[6%] opacity-0"}`}
        >
          <div className="flex items-center gap-[6%]">
            <span className="grid aspect-square w-[22%] place-items-center rounded-full bg-tap font-display text-[9cqi] font-extrabold text-ink">
              K
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[8cqi] font-bold leading-tight">{t.business}</span>
              <span className="block truncate text-[6.5cqi] leading-tight text-ink-soft">{t.category}</span>
            </span>
          </div>
          <p className="mt-[12%] text-[9.5cqi] font-bold leading-tight">{t.screenTitle}</p>
          <div className="mt-[5%] flex gap-[3%]">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`w-[16%] ${frame.stars >= s && !still ? "animate-pop" : ""}`}>
                <Star
                  aria-hidden="true"
                  className="size-full"
                  strokeWidth={1.8}
                  color={frame.stars >= s ? "var(--color-gold)" : "#b9ae9f"}
                  fill={frame.stars >= s ? "var(--color-gold)" : "transparent"}
                />
              </span>
            ))}
          </div>
          <div className="mt-[8%] min-h-[22%] rounded-[8px] border border-line bg-paper p-[6%] text-[7.5cqi] leading-snug">
            {frame.chars > 0 ? (
              <span>
                {t.typed.slice(0, frame.chars)}
                {frame.chars < t.typed.length && <span className="ml-px inline-block h-[1em] w-px animate-pulse bg-ink align-middle" />}
              </span>
            ) : (
              <span className="text-ink-soft">{t.placeholder}</span>
            )}
          </div>
          <span className="mt-[6%] self-end rounded-full bg-ink px-[10%] py-[3%] text-[7.5cqi] font-bold text-paper">
            {t.post}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Reduced motion: the same story as three still frames. */
function Storyboard({ lang }: { lang: Lang }) {
  const t = getDict(lang).home.demo;
  const frames: Frame[] = [
    { phase: "tap", stars: 0, chars: 0 },
    { phase: "open", stars: 0, chars: 0 },
    { phase: "open", stars: 5, chars: t.typed.length },
  ];
  return (
    // Own light surface: on desktop the hero column overlaps the dark band below.
    <figure className="rounded-stage bg-paper-raised p-3 shadow-card sm:p-4">
      <ol className="grid grid-cols-3 gap-2 sm:gap-3" aria-label={t.label}>
        {frames.map((f, i) => (
          <li key={i} className="flex flex-col">
            <div className="stage relative flex aspect-[3/5] items-center justify-center overflow-hidden rounded-card p-[10%]">
              {i === 0 ? (
                <div className="relative w-full">
                  <BadgeFace slug="table-stand" lang={lang} longSide={480} className="rounded-[6%]" />
                  <span aria-hidden="true" className="absolute left-1/2 top-[88%] size-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-tap" />
                  <span aria-hidden="true" className="absolute left-1/2 top-[88%] size-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-tap/70" />
                </div>
              ) : (
                <div className="w-full">
                  <Phone frame={f} lang={lang} still />
                </div>
              )}
            </div>
            <p className="mt-2 text-sm font-semibold leading-snug">
              <span className="font-mono text-tap-deep">{i + 1}.</span> {t.frames[i]}
            </p>
          </li>
        ))}
      </ol>
      <figcaption className="mt-3 text-sm text-ink-soft">{t.caption}</figcaption>
    </figure>
  );
}
