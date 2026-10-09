"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCw, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { finishById, formatBySlug, swatches } from "@/content/products";
import type { BadgeConfig } from "@/lib/badge-config";
import { fill, getDict, type Lang } from "@/lib/i18n";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { Ripple } from "../ripple";
import { FaceCanvas } from "./face-canvas";
import type { ViewerApi } from "./viewer-3d";

const Viewer3D = dynamic(() => import("./viewer-3d"), { ssr: false });

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * The product viewer: 3D when WebGL works, otherwise the 2D canvas with a CSS tilt.
 * The 2D face doubles as the poster while three.js loads. `?no3d=1` forces the fallback.
 */
export function BadgeStage({
  lang,
  config,
  face,
  version,
}: {
  lang: Lang;
  config: BadgeConfig;
  face: HTMLCanvasElement | null;
  version: number;
}) {
  const t = getDict(lang).product.viewer;
  const format = formatBySlug(config.format)!;
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<"pending" | "3d" | "2d">("pending");
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);
  const api = useRef<ViewerApi | null>(null);
  const tilt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const forced = new URLSearchParams(location.search).get("no3d") === "1";
    // Browser-only checks: decided after hydration so the server HTML (poster) matches.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode(!forced && hasWebGL() ? "3d" : "2d");
  }, []);

  // Pause rendering while the viewer is off-screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onLost = useCallback(() => setMode("2d"), []);

  const colorName = swatches.find((s) => s.hex === config.color)?.name[lang] ?? config.color;
  const label = fill(t.label, {
    format: format.name[lang],
    color: colorName,
    finish: finishById(config.finish)!.name[lang].toLowerCase(),
    name: config.name,
  });

  const show2d = mode !== "3d" || !ready;
  const landscape = format.layout === "landscape";
  const nfcSize = ((2 * format.nfc.r * Math.min(format.size.w, format.size.h)) / format.size.w) * 100;

  return (
    <div className="relative flex h-full flex-col">
      <div
        ref={wrap}
        role="img"
        aria-label={label}
        className="viewer relative min-h-0 flex-1 touch-pan-y select-none"
        onPointerMove={(e) => {
          if (mode !== "2d" || reduced || !tilt.current || e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          tilt.current.style.transform = `perspective(900px) rotateY(${x * 22}deg) rotateX(${-y * 16}deg)`;
        }}
        onPointerLeave={() => tilt.current && (tilt.current.style.transform = "")}
      >
        {show2d && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              ref={tilt}
              className={`relative transition-transform duration-300 ease-out ${landscape ? "w-[78%]" : format.compact ? "h-[52%]" : "h-[74%]"}`}
              style={{ aspectRatio: `${format.size.w} / ${format.size.h}`, filter: "drop-shadow(0 28px 30px #15120f40)" }}
            >
              <FaceCanvas source={face} version={version} format={format} className="h-full w-full" />
              {config.nfc && (
                <span
                  aria-hidden="true"
                  className="absolute aspect-square -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${format.nfc.x * 100}%`, top: `${format.nfc.y * 100}%`, width: `${nfcSize}%` }}
                >
                  <Ripple animated rings={3} className="size-full" color="var(--color-tap)" />
                </span>
              )}
            </div>
          </div>
        )}
        {mode === "3d" && face && (
          <div className={`absolute inset-0 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}>
            <Viewer3D
              format={format}
              config={config}
              face={face}
              version={version}
              active={active}
              reducedMotion={reduced}
              apiRef={api}
              onContextLost={onLost}
              onReady={() => setReady(true)}
            />
          </div>
        )}
        {mode === "3d" && !ready && (
          <p className="eyebrow absolute inset-x-0 bottom-3 text-center text-ink-soft" aria-live="polite">
            {t.loading}
          </p>
        )}
      </div>

      {mode === "3d" ? (
        <div role="toolbar" aria-label={t.controls} className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          <ViewButton label={t.rotate} onClick={() => api.current?.rotate()} icon={<RotateCw className="size-5" />} />
          <ViewButton label={t.zoomOut} onClick={() => api.current?.zoom(-1)} icon={<ZoomOut className="size-5" />} iconOnly />
          <ViewButton label={t.zoomIn} onClick={() => api.current?.zoom(1)} icon={<ZoomIn className="size-5" />} iconOnly />
          <ViewButton label={t.reset} onClick={() => api.current?.reset()} icon={<Undo2 className="size-5" />} />
        </div>
      ) : mode === "2d" ? (
        <p className="pt-3 text-center text-sm text-ink-soft">{t.fallback}</p>
      ) : null}
    </div>
  );
}

function ViewButton({ label, icon, onClick, iconOnly }: { label: string; icon: React.ReactNode; onClick: () => void; iconOnly?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={iconOnly ? label : undefined}
      title={label}
      className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full bg-paper-raised/80 px-3 text-sm font-semibold text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)] backdrop-blur transition-colors hover:bg-paper-raised"
    >
      <span aria-hidden="true">{icon}</span>
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}
