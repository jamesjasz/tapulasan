"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Check, ImagePlus, Link2, Trash2 } from "lucide-react";
import { finishes, formatBySlug, formats, swatches, type FormatSlug } from "@/content/products";
import { configFromParams, configToParams, defaultConfig, LIMITS, type BadgeConfig } from "@/lib/badge-config";
import { fill, getDict, localePath, type Lang } from "@/lib/i18n";
import { checkReviewLink } from "@/lib/review-link";
import { loadLogo, saveLogo } from "@/lib/session";
import { BadgeStage } from "./badge/badge-stage";
import { useBadgeFace, useLogoImage } from "./badge/use-badge-face";
import { ContextScene } from "./context-scene";

const LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];
const LOGO_MAX = 2 * 1024 * 1024;

export function Customizer({ lang, slug, header }: { lang: Lang; slug: FormatSlug; header: React.ReactNode }) {
  const d = getDict(lang);
  const t = d.product.controls;
  const format = formatBySlug(slug)!;
  const [config, setConfig] = useState<BadgeConfig>(() => defaultConfig(lang, slug));
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState("");
  const [copied, setCopied] = useState(false);
  const hydrated = useRef(false);

  // State lives in the URL (shareable, survives reload + language switch). Logo: session only.
  useEffect(() => {
    // Hydrate from the URL after the static HTML renders with defaults (no mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig(configFromParams(new URLSearchParams(location.search), lang, slug));
    setLogoUrl(loadLogo());
    hydrated.current = true;
  }, [lang, slug]);

  const query = configToParams(config).toString();
  useEffect(() => {
    if (!hydrated.current) return;
    // Debounced: Safari throttles frequent history updates.
    const id = setTimeout(() => history.replaceState(history.state, "", `${location.pathname}${query ? `?${query}` : ""}`), 250);
    return () => clearTimeout(id);
  }, [query]);

  const logo = useLogoImage(logoUrl);
  const { canvas, version } = useBadgeFace(format, config, logo, d.common.sample);
  const set = <K extends keyof BadgeConfig>(k: K, v: BadgeConfig[K]) => setConfig((c) => ({ ...c, [k]: v }));

  const qs = query ? `?${query}` : "";
  const checkoutHref = `${localePath(lang, "/checkout/")}?${configToParams(config, true)}`;
  const linkCheck = checkReviewLink(config.link);

  function onLogo(file: File | undefined) {
    setLogoError("");
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) return setLogoError(t.logoBadType);
    if (file.size > LOGO_MAX) return setLogoError(t.logoTooBig);
    const reader = new FileReader(); // read locally; never uploaded
    reader.onload = () => {
      const url = String(reader.result);
      saveLogo(url);
      setLogoUrl(url);
    };
    reader.readAsDataURL(file);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the URL bar still has the link */
    }
  }

  return (
    <>
      <div className="mx-auto grid max-w-7xl gap-x-10 px-4 pb-28 sm:px-6 lg:grid-cols-12 lg:pb-16">
        {/* Viewer: top on mobile, sticky left on desktop */}
        <div className="-mx-4 sm:mx-0 lg:col-span-7">
          <div className="lg:sticky lg:top-20">
            <div className="stage relative h-[55vh] min-h-[340px] overflow-hidden px-2 pb-3 pt-2 sm:rounded-stage lg:h-[calc(100dvh-7rem)] lg:max-h-[760px]">
              <BadgeStage lang={lang} config={config} face={canvas} version={version} />
            </div>
          </div>
        </div>

        <div className="pt-8 lg:col-span-5 lg:pt-4">
          {header}

          <form className="mt-8 space-y-8" onSubmit={(e) => e.preventDefault()} aria-label={t.title}>
            <fieldset>
              <legend className="label">{t.format}</legend>
              <ul className="grid grid-cols-4 gap-2">
                {formats.map((f) => {
                  const current = f.slug === slug;
                  return (
                    <li key={f.slug}>
                      <Link
                        href={`${localePath(lang, `/shop/${f.slug}/`)}${qs}`}
                        scroll={false}
                        replace
                        aria-current={current ? "page" : undefined}
                        className="flex h-full min-h-20 flex-col items-center justify-end gap-2 rounded-control border-[1.5px] border-line bg-paper-raised px-1 pb-2 pt-3 text-center text-xs font-semibold leading-tight transition-colors hover:border-ink aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper"
                      >
                        <span
                          aria-hidden="true"
                          className="block rounded-[3px] border-2 border-current"
                          style={{ width: f.size.w / 4.5, height: f.size.h / 4.5, maxWidth: 34, maxHeight: 34 }}
                        />
                        {f.name[lang]}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </fieldset>

            <TextField
              label={t.name}
              value={config.name}
              max={LIMITS.name}
              placeholder={t.namePlaceholder}
              charsLeft={t.charsLeft}
              onChange={(v) => set("name", v)}
              autoComplete="organization"
            />

            <div>
              <span className="label" id="logo-label">
                {t.logo}
              </span>
              <div className="flex flex-wrap items-center gap-3">
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- local data URL preview
                  <img src={logoUrl} alt="" className="size-14 rounded-control border border-line bg-paper-raised object-contain p-1" />
                )}
                <label className="btn btn-secondary min-h-11 cursor-pointer text-[0.9375rem] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-tap-deep">
                  <ImagePlus aria-hidden="true" className="size-4" />
                  {logoUrl ? t.logoReplace : t.logoUpload}
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml"
                    className="sr-only"
                    aria-describedby="logo-hint logo-error"
                    onChange={(e) => {
                      onLogo(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      saveLogo(null);
                      setLogoUrl(null);
                    }}
                    className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-danger hover:bg-danger/5"
                  >
                    <Trash2 aria-hidden="true" className="size-4" /> {t.logoRemove}
                  </button>
                )}
              </div>
              <p id="logo-hint" className="hint">
                {t.logoHint}
              </p>
              <p id="logo-error" className="error" role="alert">
                {logoError}
              </p>
            </div>

            <fieldset>
              <legend className="label">{t.color}</legend>
              <div className="flex flex-wrap items-center gap-2.5">
                {swatches.map((s) => (
                  <label key={s.hex} title={s.name[lang]} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={s.hex}
                      checked={config.color === s.hex}
                      onChange={() => set("color", s.hex)}
                      className="peer sr-only"
                    />
                    <span className="sr-only">{s.name[lang]}</span>
                    <span
                      aria-hidden="true"
                      className="block size-11 rounded-full shadow-[inset_0_0_0_1px_#15120f30] ring-offset-2 ring-offset-paper transition-shadow peer-checked:ring-[3px] peer-checked:ring-ink peer-focus-visible:outline-3 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-tap-deep"
                      style={{ background: s.hex }}
                    />
                  </label>
                ))}
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line bg-paper-raised py-1 pl-1 pr-3 text-sm font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-tap-deep">
                  <input
                    type="color"
                    value={config.color.toLowerCase()}
                    onChange={(e) => set("color", e.target.value.toUpperCase())}
                    className="size-9 cursor-pointer rounded-full border-0 bg-transparent p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
                  />
                  {t.customColor}
                  <span className="font-mono text-xs text-ink-soft">{config.color}</span>
                </label>
              </div>
            </fieldset>

            <fieldset>
              <legend className="label">{t.finish}</legend>
              <div className="grid grid-cols-2 gap-2">
                {finishes.map((f) => (
                  <label
                    key={f.id}
                    className="relative flex min-h-16 cursor-pointer flex-col justify-center rounded-control border-[1.5px] border-line bg-paper-raised px-3 py-2.5 transition-colors hover:border-ink has-[:checked]:border-ink has-[:checked]:shadow-[inset_0_0_0_1.5px_var(--color-ink)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tap-deep"
                  >
                    <input
                      type="radio"
                      name="finish"
                      value={f.id}
                      checked={config.finish === f.id}
                      onChange={() => set("finish", f.id)}
                      className="sr-only"
                    />
                    <span className="font-semibold">{f.name[lang]}</span>
                    <span className="text-xs text-ink-soft">{f.note[lang]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <TextField
              label={t.cta}
              value={config.cta}
              max={LIMITS.cta}
              charsLeft={t.charsLeft}
              onChange={(v) => set("cta", v)}
              hint={format.compact ? t.ctaHidden : undefined}
            />

            <div>
              <label htmlFor="review-link" className="label">
                {t.link}
              </label>
              <input
                id="review-link"
                type="url"
                inputMode="url"
                autoComplete="url"
                className="field"
                placeholder={t.linkPlaceholder}
                value={config.link}
                maxLength={LIMITS.link}
                onChange={(e) => set("link", e.target.value.trim())}
                aria-describedby="review-link-status"
              />
              <p id="review-link-status" className="hint" aria-live="polite">
                {linkCheck === "google" ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-leaf">
                    <Check aria-hidden="true" className="size-4" /> {d.checkout.link.ok}
                  </span>
                ) : linkCheck === "other" || linkCheck === "invalid" ? (
                  <span className="inline-flex items-start gap-1 text-ink">
                    <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-tap-deep" />
                    {linkCheck === "invalid" ? d.checkout.link.invalid : d.checkout.link.warn}
                  </span>
                ) : (
                  t.linkHint
                )}
              </p>
            </div>

            <label className="flex min-h-11 cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={config.nfc}
                onChange={(e) => set("nfc", e.target.checked)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className="relative mt-0.5 h-7 w-12 shrink-0 rounded-full bg-line transition-colors after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-paper-raised after:shadow after:transition-transform peer-checked:bg-ink peer-checked:after:translate-x-5 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-tap-deep"
              />
              <span>
                <span className="block font-semibold">{t.nfc}</span>
                <span className="text-sm text-ink-soft">{t.nfcHint}</span>
              </span>
            </label>

            <div className="hidden flex-wrap items-center gap-3 lg:flex">
              <Link href={checkoutHref} className="btn btn-primary">
                {t.continue} <ArrowRight aria-hidden="true" className="size-5" />
              </Link>
              <CopyButton copied={copied} onClick={copyLink} label={t.share} done={t.copied} />
            </div>
            <div className="lg:hidden">
              <CopyButton copied={copied} onClick={copyLink} label={t.share} done={t.copied} />
            </div>
          </form>
        </div>
      </div>

      {/* Sticky order bar (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{format.name[lang]}</p>
            <p className="truncate text-xs text-ink-soft">{d.common.priceSoon}</p>
          </div>
          <Link href={checkoutHref} className="btn btn-primary shrink-0">
            {t.continue} <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        </div>
      </div>

      <ContextScene lang={lang} format={format} face={canvas} version={version} />
    </>
  );
}

function TextField({
  label,
  value,
  max,
  onChange,
  charsLeft,
  placeholder,
  autoComplete,
  hint,
}: {
  label: string;
  value: string;
  max: number;
  onChange: (v: string) => void;
  charsLeft: string;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        className="field"
        value={value}
        maxLength={max}
        placeholder={placeholder}
        autoComplete={autoComplete ?? "off"}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${id}-count`}
      />
      <p id={`${id}-count`} className="hint font-mono">
        {hint ? `${hint} · ` : ""}
        {fill(charsLeft, { n: max - value.length })}
      </p>
    </div>
  );
}

function CopyButton({ copied, onClick, label, done }: { copied: boolean; onClick: () => void; label: string; done: string }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold hover:bg-ink/5">
      {copied ? <Check aria-hidden="true" className="size-4 text-leaf" /> : <Link2 aria-hidden="true" className="size-4" />}
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}
