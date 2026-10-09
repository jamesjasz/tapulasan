import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Format, FormatSlug } from "@/content/products";
import { defaultConfig, type BadgeConfig } from "@/lib/badge-config";
import { getDict, localePath, type Lang } from "@/lib/i18n";
import { BadgeFace } from "./badge/face-canvas";

// Each card shows a different colour/finish, to hint at the range. Stable objects: the renderer redraws on identity change.
const showcase: Record<FormatSlug, Partial<BadgeConfig>> = {
  "counter-plate": { color: "#15120F", finish: "matte" },
  "table-stand": { color: "#FF5A1F", finish: "glossy" },
  "lanyard-card": { color: "#D6B58A", finish: "wood" },
  keychain: { color: "#1F7A4D", finish: "glossy" },
};
const cache = new Map<string, BadgeConfig>();
const showcaseConfig = (lang: Lang, slug: FormatSlug) => {
  const key = `${lang}:${slug}`;
  if (!cache.has(key)) cache.set(key, { ...defaultConfig(lang, slug), ...showcase[slug] });
  return cache.get(key)!;
};

/** Shop/home card: canvas-rendered face on a CSS turntable (no three.js on these pages). */
export function FormatCard({ format, lang, headingLevel = 3 }: { format: Format; lang: Lang; headingLevel?: 2 | 3 }) {
  const d = getDict(lang);
  const H = `h${headingLevel}` as const;
  const href = localePath(lang, `/shop/${format.slug}/`);
  const scale = format.mount === "ring" ? "w-[38%]" : format.layout === "landscape" ? "w-[78%]" : "w-[50%]";
  return (
    <article className="group relative flex h-full flex-col rounded-card bg-paper-raised p-3 shadow-card transition-transform duration-300 ease-out hover:-translate-y-1">
      <div className="stage relative flex aspect-[4/3.4] items-center justify-center overflow-hidden rounded-[14px] [perspective:900px]">
        <div
          className={`${scale} transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] [transform:rotateY(-14deg)_rotateX(4deg)] group-hover:[transform:rotateY(10deg)_rotateX(2deg)] motion-reduce:transform-none`}
          style={{ filter: "drop-shadow(0 18px 16px #15120f40)" }}
        >
          <BadgeFace slug={format.slug} lang={lang} longSide={560} config={showcaseConfig(lang, format.slug)} />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <H className="font-display text-2xl font-extrabold tracking-tight">
          <Link href={href} className="after:absolute after:inset-0 after:rounded-card">
            {format.name[lang]}
          </Link>
        </H>
        <p className="mt-1.5 text-[0.9375rem] text-ink-soft">{format.tagline[lang]}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="eyebrow text-ink-soft">{format.price === null ? d.common.priceShort : format.price}</span>
          <span aria-hidden="true" className="inline-flex items-center gap-1 text-sm font-bold text-tap-deep">
            {d.common.customize} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}
