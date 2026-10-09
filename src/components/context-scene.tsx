"use client";

import { Camera } from "lucide-react";
import type { Format } from "@/content/products";
import { getDict, type Lang } from "@/lib/i18n";
import { FaceCanvas } from "./badge/face-canvas";

/** Illustrated "in your space" scene using the live design, plus a slot for a real photo later. */
export function ContextScene({
  lang,
  format,
  face,
  version,
}: {
  lang: Lang;
  format: Format;
  face: HTMLCanvasElement | null;
  version: number;
}) {
  const t = getDict(lang).product.context;
  const place = placement[format.mount];
  return (
    <section aria-labelledby="context-title" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <p className="eyebrow text-tap-deep">{t.eyebrow}</p>
      <h2 id="context-title" className="mt-2 max-w-2xl font-display text-h2 font-extrabold">
        {t.title}
      </h2>
      <p className="mt-3 text-ink-soft">{t.note}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <figure className="relative overflow-hidden rounded-stage bg-paper-sunk" style={{ aspectRatio: "4 / 3" }}>
          <Backdrop mount={format.mount} />
          <div
            className="absolute"
            style={{
              left: place.left,
              bottom: place.bottom,
              width: place.width,
              transform: place.transform,
              transformOrigin: "bottom center",
              filter: "drop-shadow(0 14px 14px #15120f45)",
            }}
          >
            <FaceCanvas source={face} version={version} format={format} />
          </div>
          {format.mount === "base" && (
            <div aria-hidden="true" className="absolute h-[3.5%] rounded-[3px] bg-ink-raised" style={{ left: "40%", width: "20%", bottom: "31%" }} />
          )}
          <figcaption className="eyebrow absolute left-4 top-4 rounded-full bg-paper/85 px-3 py-1.5 text-ink">
            {t.scenes[format.slug]}
          </figcaption>
        </figure>

        {format.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- static export, unoptimized
          <img src={format.photo} alt={t.scenes[format.slug]} className="h-full w-full rounded-stage object-cover" />
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-stage border-2 border-dashed border-line p-6 text-center text-ink-soft">
            <Camera aria-hidden="true" className="size-8" />
            <p className="eyebrow">{getDict(lang).common.photoSoon}</p>
          </div>
        )}
      </div>
    </section>
  );
}

const placement: Record<Format["mount"], { left: string; bottom: string; width: string; transform?: string }> = {
  easel: { left: "47%", bottom: "33%", width: "34%", transform: "perspective(600px) rotateX(10deg)" },
  base: { left: "41.5%", bottom: "33%", width: "17%" },
  lanyard: { left: "43.5%", bottom: "18%", width: "13%", transform: "rotate(-2deg)" },
  ring: { left: "52%", bottom: "26%", width: "9%", transform: "rotate(-14deg)" },
};

/** Flat illustration in the site palette. Decorative only. */
function Backdrop({ mount }: { mount: Format["mount"] }) {
  const wood = "#B07A52";
  const woodDark = "#8A5A3B";
  return (
    <svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
      <rect width="400" height="300" fill="#ECE4D5" />
      {/* hanging lamp */}
      <line x1="300" y1="0" x2="300" y2="58" stroke="#15120F" strokeWidth="2" />
      <path d="M278 78 Q300 50 322 78 Z" fill="#15120F" />
      <ellipse cx="300" cy="80" rx="22" ry="4" fill="#F5B301" opacity=".7" />

      {mount === "lanyard" ? (
        <>
          {/* staff member: shoulders, shirt, apron */}
          <path d="M110 300 Q112 150 200 138 Q288 150 290 300 Z" fill="#FCFAF5" />
          <path d="M150 300 L156 175 Q200 190 244 175 L250 300 Z" fill="#15120F" />
          <rect x="183" y="96" width="34" height="48" rx="14" fill="#C99B76" />
          <path d="M168 142 L200 222 L232 142" fill="none" stroke="#FF5A1F" strokeWidth="7" strokeLinejoin="round" />
        </>
      ) : (
        <>
          {/* counter / table */}
          <rect x="0" y="198" width="400" height="12" fill={wood} />
          <rect x="0" y="210" width="400" height="90" fill={woodDark} />
          <rect x="0" y="210" width="400" height="6" fill="#15120F" opacity=".18" />
          {/* cup + saucer */}
          <ellipse cx="88" cy="198" rx="30" ry="5" fill="#FCFAF5" />
          <path d="M68 160 h40 v22 a20 16 0 0 1 -40 0 z" fill="#FCFAF5" />
          <path d="M108 166 a9 9 0 0 1 0 16" fill="none" stroke="#FCFAF5" strokeWidth="5" />
          <path d="M80 150 q4 -8 0 -16 M94 150 q4 -8 0 -16" stroke="#A89E91" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {mount !== "ring" && (
            <>
              {/* plant */}
              <rect x="330" y="168" width="26" height="30" rx="4" fill="#FF5A1F" />
              <path d="M343 168 q-18 -24 -6 -40 M343 168 q4 -30 18 -36 M343 168 q-2 -20 -20 -22" stroke="#1F7A4D" strokeWidth="5" fill="none" strokeLinecap="round" />
            </>
          )}
          {mount === "ring" && (
            <>
              {/* keys */}
              <circle cx="232" cy="176" r="15" fill="none" stroke="#C9C4BC" strokeWidth="4" />
              <path d="M240 186 l34 18 l6 -6 m-14 0 l4 -6" stroke="#A89E91" strokeWidth="7" strokeLinecap="round" fill="none" />
              <path d="M222 188 l-30 14" stroke="#C9C4BC" strokeWidth="7" strokeLinecap="round" />
            </>
          )}
        </>
      )}
    </svg>
  );
}
