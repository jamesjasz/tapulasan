import { dictionary } from "../content/dictionary.ts";
import { finishById, formatBySlug, type FinishId, type FormatSlug } from "../content/products.ts";

export type BadgeConfig = {
  format: FormatSlug;
  name: string;
  color: string; // "#RRGGBB"
  finish: FinishId;
  cta: string;
  link: string;
  nfc: boolean;
};

export const LIMITS = { name: 28, cta: 40, link: 300 } as const;

const defaults = (lang: "id" | "en", format: FormatSlug): BadgeConfig => ({
  format,
  name: dictionary[lang].product.controls.defaultName,
  color: "#FF5A1F",
  finish: "matte",
  cta: dictionary[lang].product.controls.ctaDefault,
  link: "",
  nfc: false,
});

const HEX = /^#?([0-9a-f]{6})$/i;

/** Read a config from URL params. Unknown or invalid values fall back to defaults. */
export function configFromParams(params: URLSearchParams, lang: "id" | "en", format: FormatSlug): BadgeConfig {
  const d = defaults(lang, format);
  const hex = params.get("color")?.match(HEX)?.[1];
  const f = params.get("format");
  return {
    format: f && formatBySlug(f) ? (f as FormatSlug) : format,
    name: params.get("name")?.slice(0, LIMITS.name) ?? d.name,
    color: hex ? `#${hex.toUpperCase()}` : d.color,
    finish: (finishById(params.get("finish") ?? "")?.id ?? d.finish) as FinishId,
    cta: params.get("cta")?.slice(0, LIMITS.cta) ?? d.cta,
    link: params.get("link")?.slice(0, LIMITS.link) ?? d.link,
    nfc: params.get("nfc") === "1",
  };
}

/**
 * Serialise only what differs from the defaults, so URLs stay short and an untouched CTA
 * follows the language switch (the ID default becomes the EN default and vice versa).
 */
export function configToParams(c: BadgeConfig, withFormat = false): URLSearchParams {
  const d = defaults("id", c.format);
  const ctaDefaults = [dictionary.id.product.controls.ctaDefault, dictionary.en.product.controls.ctaDefault];
  const p = new URLSearchParams();
  if (withFormat) p.set("format", c.format);
  if (c.name !== d.name) p.set("name", c.name);
  if (c.color !== d.color) p.set("color", c.color.slice(1));
  if (c.finish !== d.finish) p.set("finish", c.finish);
  if (!ctaDefaults.includes(c.cta)) p.set("cta", c.cta);
  if (c.link) p.set("link", c.link);
  if (c.nfc) p.set("nfc", "1");
  return p;
}

export const defaultConfig = defaults;

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

export const INK = "#15120F";
export const PAPER = "#F6F1E7";

/** Ink or paper text, whichever contrasts more with the base colour. */
export const textColorFor = (bg: string) => (contrast(bg, INK) >= contrast(bg, PAPER) ? INK : PAPER);
