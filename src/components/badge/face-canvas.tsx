"use client";

import { useEffect, useMemo, useRef } from "react";
import { defaultConfig, type BadgeConfig } from "@/lib/badge-config";
import { formatBySlug, type Format, type FormatSlug } from "@/content/products";
import { getDict, type Lang } from "@/lib/i18n";
import { useBadgeFace } from "./use-badge-face";

/** Visible copy of an offscreen face canvas. Sized by CSS; keeps the face's aspect ratio. */
export function FaceCanvas({
  source,
  version,
  format,
  className = "",
}: {
  source: HTMLCanvasElement | null;
  version: number;
  format: Format;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !source || version === 0) return;
    el.width = source.width;
    el.height = source.height;
    el.getContext("2d")?.drawImage(source, 0, 0);
  }, [source, version]);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`block h-auto w-full ${className}`}
      style={{ aspectRatio: `${format.size.w} / ${format.size.h}` }}
    />
  );
}

/** Self-contained face render for cards and thumbnails (no logo). */
export function BadgeFace({
  slug,
  lang,
  config,
  longSide = 640,
  className = "",
}: {
  slug: FormatSlug;
  lang: Lang;
  config?: BadgeConfig;
  longSide?: number;
  className?: string;
}) {
  const format = formatBySlug(slug)!;
  const cfg = useMemo(() => config ?? defaultConfig(lang, slug), [config, lang, slug]);
  const { canvas, version } = useBadgeFace(format, cfg, null, getDict(lang).common.sample, { sheen: true, longSide });
  return <FaceCanvas source={canvas} version={version} format={format} className={className} />;
}
