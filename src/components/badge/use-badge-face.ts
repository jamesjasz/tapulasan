"use client";

import { useEffect, useState } from "react";
import type { Format } from "@/content/products";
import type { BadgeConfig } from "@/lib/badge-config";
import { drawBadgeFace, loadFaceFonts, readFaceFonts } from "@/lib/render-badge";

/** Loads a logo data/object URL into an <img> usable by the canvas. */
export function useLogoImage(url: string | null) {
  const [loaded, setLoaded] = useState<{ url: string; img: HTMLImageElement } | null>(null);
  useEffect(() => {
    if (!url) return;
    let live = true;
    const el = new Image();
    el.onload = () => live && setLoaded({ url, img: el });
    el.src = url;
    return () => {
      live = false;
    };
  }, [url]);
  return url && loaded?.url === url ? loaded.img : null;
}

/**
 * Keeps an offscreen canvas painted with the current badge face.
 * `version` bumps after every redraw so consumers (3D texture, 2D copies) can refresh.
 */
export function useBadgeFace(
  format: Format,
  config: BadgeConfig,
  logo: HTMLImageElement | null,
  sampleLabel: string,
  { sheen = false, longSide = 1200, debounce = 60 } = {},
) {
  const [canvas] = useState(() => (typeof document === "undefined" ? null : document.createElement("canvas")));
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!canvas) return;
    let live = true;
    // Debounced so typing in the name field doesn't redraw on every keystroke.
    const id = setTimeout(async () => {
      const fonts = readFaceFonts();
      await loadFaceFonts(fonts);
      if (!live) return;
      drawBadgeFace(canvas, format, config, { logo, sampleLabel, fonts, sheen, longSide });
      setVersion((v) => v + 1);
    }, version === 0 ? 0 : debounce);
    return () => {
      live = false;
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- version is an output, not an input
  }, [canvas, format, config, logo, sampleLabel, sheen, longSide, debounce]);

  return { canvas, version };
}
