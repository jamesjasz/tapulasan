// The one badge-face renderer. Draws a face onto a 2D canvas from the config.
// Used as the 3D texture, the 2D preview/fallback, the format cards and the checkout thumbnail.

import { create as createQr } from "qrcode";
import type { Format } from "@/content/products";
import { INK, textColorFor, type BadgeConfig } from "./badge-config";
import { normalizeLink } from "./review-link";

export type FaceFonts = { display: string; body: string; mono: string };

export type FaceOptions = {
  logo?: HTMLImageElement | null;
  sampleLabel: string; // "CONTOH" / "SAMPLE" stamped on the demo QR
  fonts: FaceFonts;
  /** Paint lighting hints (2D only; the 3D view has real lights). */
  sheen?: boolean;
  /** Pixels on the longest side (≈2× display size for crispness). */
  longSide?: number;
};

export const SAMPLE_QR_URL = "https://tapulasan.my.id/?contoh";

export function faceSize(format: Format, longSide = 1200) {
  const s = longSide / Math.max(format.size.w, format.size.h); // px per mm
  return { w: Math.round(format.size.w * s), h: Math.round(format.size.h * s), s };
}

/** Reads the next/font family names from CSS variables (call in the browser). */
export function readFaceFonts(): FaceFonts {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fb: string) => css.getPropertyValue(name).trim() || fb;
  return {
    display: v("--font-bricolage", "system-ui, sans-serif"),
    body: v("--font-jakarta", "system-ui, sans-serif"),
    mono: v("--font-jetbrains", "ui-monospace, monospace"),
  };
}

let fontsReady: Promise<unknown> | null = null;
/** Resolves once the weights the renderer uses are loaded (canvas doesn't trigger font loads itself). */
export function loadFaceFonts(f: FaceFonts) {
  fontsReady ??= Promise.all([
    document.fonts.load(`800 40px ${f.display}`),
    document.fonts.load(`700 40px ${f.body}`),
    document.fonts.load(`600 40px ${f.mono}`),
  ]).catch(() => undefined);
  return fontsReady;
}

export function drawBadgeFace(canvas: HTMLCanvasElement, format: Format, cfg: BadgeConfig, opt: FaceOptions) {
  const { w: W, h: H, s } = faceSize(format, opt.longSide);
  if (canvas.width !== W) canvas.width = W;
  if (canvas.height !== H) canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { fonts } = opt;
  const fg = textColorFor(cfg.color);
  const pad = Math.min(W, H) * 0.09;
  const nfc = { x: format.nfc.x * W, y: format.nfc.y * H, r: format.nfc.r * Math.min(W, H) };
  const portrait = format.layout === "portrait";

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  roundRect(ctx, 0, 0, W, H, format.radius * s);
  ctx.clip();

  ctx.fillStyle = cfg.color;
  ctx.fillRect(0, 0, W, H);
  if (cfg.finish === "wood") woodGrain(ctx, W, H, portrait);
  if (cfg.finish === "metal") brushed(ctx, W, H);
  if (opt.sheen) sheen(ctx, W, H, cfg.finish);

  ctx.fillStyle = fg;
  ctx.textBaseline = "alphabetic";
  const qrText = normalizeLink(cfg.link) ?? SAMPLE_QR_URL;
  const sample = !normalizeLink(cfg.link);
  const display = (px: number) => `800 ${px}px ${fonts.display}`;
  const body = (px: number) => `700 ${px}px ${fonts.body}`;

  if (portrait) {
    const top = format.hole ? (format.hole.top + format.hole.h) * s + pad * 0.6 : pad;
    const bottom = nfc.y - nfc.r - pad * 0.35;
    const innerW = W - pad * 2;
    const gap = pad * 0.45;

    const logoBox = opt.logo ? fitContain(opt.logo, innerW * 0.6, H * (format.compact ? 0.09 : 0.1)) : null;
    const name = fitText(ctx, cfg.name.trim(), innerW, H * (format.compact ? 0.08 : 0.07), H * 0.03, display, 2);
    const cta =
      !format.compact && cfg.cta.trim() ? fitText(ctx, cfg.cta.trim(), innerW, H * 0.034, H * 0.02, body, 2) : null;

    const fixed = (logoBox ? logoBox.h + gap : 0) + (name ? name.height + gap : 0) + (cta ? cta.height + gap : 0);
    const qr = Math.max(0, Math.min(innerW * (format.compact ? 0.92 : 0.8), bottom - top - fixed));
    let y = top + Math.max(0, (bottom - top - fixed - qr) / 2);

    if (logoBox && opt.logo) {
      ctx.drawImage(opt.logo, (W - logoBox.w) / 2, y, logoBox.w, logoBox.h);
      y += logoBox.h + gap;
    }
    if (name) {
      drawLines(ctx, name, W / 2, y, "center", display);
      y += name.height + gap;
    }
    drawQr(ctx, (W - qr) / 2, y, qr, qrText, sample ? opt.sampleLabel : null, fonts);
    y += qr + gap;
    if (cta) {
      ctx.globalAlpha = 0.9;
      drawLines(ctx, cta, W / 2, y, "center", body);
      ctx.globalAlpha = 1;
    }
  } else {
    const qr = H - pad * 2;
    const qrX = W - pad - qr;
    const colW = qrX - pad * 1.6;
    const gap = pad * 0.4;
    let y = pad;
    if (opt.logo) {
      const b = fitContain(opt.logo, colW, H * 0.13);
      ctx.drawImage(opt.logo, pad, y, b.w, b.h);
      y += b.h + gap;
    }
    const name = fitText(ctx, cfg.name.trim(), colW, H * 0.1, H * 0.045, display, 2);
    if (name) {
      drawLines(ctx, name, pad, y, "left", display);
      y += name.height + gap;
    }
    const maxCtaBottom = nfc.y - nfc.r - gap;
    const cta = cfg.cta.trim() ? fitText(ctx, cfg.cta.trim(), colW, H * 0.042, H * 0.026, body, 3) : null;
    if (cta && y + cta.height <= maxCtaBottom) {
      ctx.globalAlpha = 0.9;
      drawLines(ctx, cta, pad, y, "left", body);
      ctx.globalAlpha = 1;
    }
    drawQr(ctx, qrX, pad, qr, qrText, sample ? opt.sampleLabel : null, fonts);
  }

  drawNfcMark(ctx, nfc.x, nfc.y, nfc.r, fg);

  // Small maker's mark, bottom-right, only where it fits clear of the NFC mark.
  if (!format.compact) {
    const size = Math.min(W, H) * 0.028;
    ctx.font = `600 ${size}px ${fonts.mono}`;
    const tw = ctx.measureText("TAPULASAN").width;
    const x = W - pad * 0.7;
    const y = H - pad * 0.4;
    if (x - tw > nfc.x + nfc.r || y - size < nfc.y - nfc.r) {
      ctx.globalAlpha = 0.55;
      ctx.textAlign = "right";
      ctx.fillStyle = fg;
      ctx.fillText("TAPULASAN", x, y);
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
    }
  }

  // Punch the hole (lanyard slot / keyring hole).
  if (format.hole) {
    const { w: hw, h: hh, top } = format.hole;
    ctx.globalCompositeOperation = "destination-out";
    roundRect(ctx, W / 2 - (hw * s) / 2, top * s, hw * s, hh * s, (Math.min(hw, hh) * s) / 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
}

// ── helpers ───────────────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function fitContain(img: HTMLImageElement, maxW: number, maxH: number) {
  const iw = img.naturalWidth || 300;
  const ih = img.naturalHeight || 300;
  const k = Math.min(maxW / iw, maxH / ih);
  return { w: iw * k, h: ih * k };
}

type Fitted = { lines: string[]; size: number; lineHeight: number; height: number };

/** Largest font size (≤ max) where the text wraps into ≤ maxLines within maxW. */
function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  max: number,
  min: number,
  font: (px: number) => string,
  maxLines: number,
): Fitted | null {
  if (!text) return null;
  const step = Math.max(1, max / 40);
  for (let size = max; size >= min; size -= step) {
    ctx.font = font(size);
    const lines = wrap(ctx, text, maxW);
    if (lines && lines.length <= maxLines) return fitted(lines, size);
  }
  // Still too long at the minimum size: hard-break and ellipsise.
  ctx.font = font(min);
  const lines = hardWrap(ctx, text, maxW).slice(0, maxLines);
  const last = lines.length - 1;
  while (ctx.measureText(`${lines[last]}…`).width > maxW && lines[last].length > 1) lines[last] = lines[last].slice(0, -1);
  if (lines.join("").length < text.replace(/\s/g, "").length) lines[last] += "…";
  return fitted(lines, min);
}

const fitted = (lines: string[], size: number): Fitted => ({
  lines,
  size,
  lineHeight: size * 1.04,
  height: size * 1.04 * lines.length,
});

/** Greedy word wrap; null when a single word doesn't fit. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] | null {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (ctx.measureText(word).width > maxW) return null;
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxW) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  lines.push(line);
  return lines;
}

function hardWrap(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxW) {
      lines.push(line.trimEnd());
      line = ch.trimStart();
    } else line += ch;
  }
  lines.push(line);
  return lines;
}

function drawLines(
  ctx: CanvasRenderingContext2D,
  t: Fitted,
  x: number,
  y: number,
  align: CanvasTextAlign,
  font: (px: number) => string,
) {
  ctx.font = font(t.size);
  ctx.textAlign = align;
  t.lines.forEach((line, i) => ctx.fillText(line, x, y + t.lineHeight * i + t.size * 0.82));
  ctx.textAlign = "left";
}

function drawQr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  text: string,
  sampleLabel: string | null,
  fonts: FaceFonts,
) {
  if (size <= 0) return;
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, x, y, size, size, size * 0.07);
  ctx.fill();
  const { modules } = createQr(text, { errorCorrectionLevel: "M" });
  const n = modules.size;
  const quiet = 2.5;
  const cell = size / (n + quiet * 2);
  ctx.fillStyle = INK;
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (modules.get(r, c)) ctx.fillRect(x + (c + quiet) * cell, y + (r + quiet) * cell, cell + 0.6, cell + 0.6);

  if (sampleLabel) {
    // A clearly fake demo code: diagonal "CONTOH / SAMPLE" band across it.
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(-0.22);
    ctx.fillStyle = "#FF5A1F";
    ctx.fillRect(-size * 0.48, -size * 0.09, size * 0.96, size * 0.18);
    ctx.fillStyle = INK;
    ctx.font = `600 ${size * 0.1}px ${fonts.mono}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(sampleLabel, 0, size * 0.005);
  }
  ctx.restore();
}

/** Contactless mark: a ring with three waves, sized to the NFC coil. */
function drawNfcMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = r * 0.07;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = r * 0.085;
  for (let i = 0; i < 3; i++) {
    const rr = r * (0.18 + i * 0.16);
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy, rr, -Math.PI / 3.2, Math.PI / 3.2);
    ctx.stroke();
  }
  ctx.restore();
}

/** Deterministic PRNG so the grain doesn't change on every redraw. */
function prng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function woodGrain(ctx: CanvasRenderingContext2D, W: number, H: number, alongY: boolean) {
  const rand = prng(11);
  ctx.save();
  if (alongY) {
    ctx.translate(W, 0);
    ctx.rotate(Math.PI / 2);
  }
  const L = alongY ? H : W;
  const T = alongY ? W : H;
  ctx.globalCompositeOperation = "multiply";
  for (let i = 0; i < 90; i++) {
    const y0 = rand() * T;
    const amp = 2 + rand() * T * 0.012;
    const freq = 0.002 + rand() * 0.006;
    const phase = rand() * 10;
    ctx.strokeStyle = `rgba(92, 58, 28, ${0.05 + rand() * 0.16})`;
    ctx.lineWidth = 0.8 + rand() * 3.5;
    ctx.beginPath();
    for (let x = -10; x <= L + 10; x += 14) {
      const y = y0 + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 0.27 + phase * 2) * amp * 2.2;
      if (x < 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function brushed(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const rand = prng(5);
  ctx.save();
  for (let i = 0; i < H * 0.9; i++) {
    const light = rand() > 0.5;
    ctx.fillStyle = light ? `rgba(255,255,255,${0.03 + rand() * 0.07})` : `rgba(0,0,0,${0.02 + rand() * 0.06})`;
    const x = rand() * W * 0.3 - W * 0.15;
    ctx.fillRect(x, rand() * H, W * (0.6 + rand() * 0.7), 1 + rand());
  }
  ctx.restore();
}

function sheen(ctx: CanvasRenderingContext2D, W: number, H: number, finish: BadgeConfig["finish"]) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  const strong = finish === "glossy" || finish === "metal";
  g.addColorStop(0, `rgba(255,255,255,${strong ? 0.28 : 0.12})`);
  g.addColorStop(strong ? 0.35 : 0.5, "rgba(255,255,255,0)");
  g.addColorStop(1, `rgba(0,0,0,${strong ? 0.16 : 0.08})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}
