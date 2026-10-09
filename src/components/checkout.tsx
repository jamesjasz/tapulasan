"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronDown, Mail, MessageCircle, Minus, Pencil, Plus } from "lucide-react";
import { site } from "@/config/site";
import { finishById, formatBySlug, formats, orderableFormats, swatches, type FormatSlug } from "@/content/products";
import { configFromParams, configToParams, defaultConfig, type BadgeConfig } from "@/lib/badge-config";
import { fill, getDict, localePath, type Lang } from "@/lib/i18n";
import { mailLink, waLink } from "@/lib/links";
import { buildOrderMessage, emailSubject, orderRef, type Order, type PaymentId } from "@/lib/order-message";
import { formatIDR } from "@/lib/price";
import { checkReviewLink } from "@/lib/review-link";
import { loadJson, loadLogo, removeKey, saveJson } from "@/lib/session";
import { FaceCanvas } from "./badge/face-canvas";
import { useBadgeFace, useLogoImage } from "./badge/use-badge-face";

const KEY = "tu-checkout";
const STEPS = 6;

type Contact = Order["contact"];
type State = {
  step: number;
  reached: number;
  ref: string;
  config: BadgeConfig;
  quantity: number;
  reviewLink: string;
  needsLinkHelp: boolean;
  contact: Contact;
  payment: PaymentId | "";
  sent: boolean;
};

const emptyContact: Contact = { name: "", business: "", phone: "", address: "", city: "", postal: "", notes: "" };

const initial = (lang: Lang): State => ({
  step: 0,
  reached: 0,
  ref: "",
  config: defaultConfig(lang, orderableFormats[0].slug),
  quantity: 1,
  reviewLink: "",
  needsLinkHelp: false,
  contact: emptyContact,
  payment: "",
  sent: false,
});

type Errors = Partial<Record<string, string>>;

/** Indonesian mobile numbers: 08…, 628… or +628…, 10–15 digits. */
const validPhone = (v: string) => /^(\+?62|0)8\d{7,12}$/.test(v.replace(/[\s.-]/g, ""));

export function Checkout({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const t = d.checkout;
  const [s, setS] = useState<State>(() => initial(lang));
  const [errors, setErrors] = useState<Errors>({});
  const [loaded, setLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  // Restore: saved progress + the latest design from the URL (coming from the customizer).
  useEffect(() => {
    const saved = loadJson<State>(KEY);
    const params = new URLSearchParams(location.search);
    const base = saved ?? initial(lang);
    const fromUrl = params.has("format")
      ? configFromParams(params, lang, (params.get("format") as FormatSlug) ?? orderableFormats[0].slug)
      : null;
    const restored = fromUrl ?? base.config;
    // Coming-soon formats can't be ordered: keep the design, switch to an orderable format.
    const config = formatBySlug(restored.format)?.available ? restored : { ...restored, format: orderableFormats[0].slug };
    const hashStep = Number(location.hash.match(/^#step-(\d)$/)?.[1]) - 1;
    const step = hashStep >= 0 ? Math.min(hashStep, base.reached) : base.step;
    // Hydrate after the static HTML (step 1, defaults) has rendered.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setS({
      ...base,
      step,
      config,
      ref: base.ref || orderRef(),
      reviewLink: base.reviewLink || config.link,
    });
    setLogoUrl(loadLogo());
    setLoaded(true);
  }, [lang]);

  useEffect(() => {
    if (loaded) saveJson(KEY, s);
  }, [s, loaded]);

  // Browser back/forward moves between steps.
  useEffect(() => {
    const onPop = () => {
      const n = Number(location.hash.match(/^#step-(\d)$/)?.[1] ?? 1) - 1;
      setS((p) => ({ ...p, step: Math.max(0, Math.min(n, p.reached)) }));
      setErrors({});
    };
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  const goTo = (n: number, replace = false) => {
    setS((p) => ({ ...p, step: n, reached: Math.max(p.reached, n) }));
    setErrors({});
    // Forward pushes a history entry (browser Back = previous step); our Back button replaces.
    history[replace ? "replaceState" : "pushState"](history.state, "", `${location.pathname}${location.search}#step-${n + 1}`);
    requestAnimationFrame(() => {
      heading.current?.focus();
      heading.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  const clearError = (k: string) =>
    setErrors((e) => {
      if (!(k in e)) return e;
      const rest = { ...e };
      delete rest[k];
      return rest;
    });
  const set = <K extends keyof State>(k: K, v: State[K]) => {
    setS((p) => ({ ...p, [k]: v }));
    clearError(k);
  };
  const setContact = (k: keyof Contact, v: string) => {
    setS((p) => ({ ...p, contact: { ...p.contact, [k]: v } }));
    clearError(k);
  };

  const format = formatBySlug(s.config.format)!;
  const linkCheck = checkReviewLink(s.reviewLink);

  function validate(step: number): Errors {
    const e: Errors = {};
    if (step === 0 && !(Number.isInteger(s.quantity) && s.quantity >= 1)) e.quantity = t.contact.required;
    if (step === 0 && !formatBySlug(s.config.format)?.available) e.format = t.contact.required;
    if (step === 2 && !s.needsLinkHelp) {
      if (linkCheck === "empty") e.reviewLink = t.link.required;
      else if (linkCheck === "invalid") e.reviewLink = t.link.invalid;
    }
    if (step === 3) {
      const c = s.contact;
      for (const k of ["name", "business", "phone", "address", "city", "postal"] as const)
        if (!c[k].trim()) e[k] = t.contact.required;
      if (c.phone.trim() && !validPhone(c.phone)) e.phone = t.contact.phoneInvalid;
      if (c.postal.trim() && !/^\d{5}$/.test(c.postal.trim())) e.postal = t.contact.postalInvalid;
    }
    if (step === 4 && !s.payment) e.payment = t.payment.required;
    return e;
  }

  function next() {
    const e = validate(s.step);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    goTo(s.step + 1);
  }

  const designQuery = configToParams({ ...s.config, link: s.needsLinkHelp ? "" : s.reviewLink }).toString();
  const editHref = `${localePath(lang, `/shop/${s.config.format}/`)}${designQuery ? `?${designQuery}` : ""}`;

  const order: Order = useMemo(
    () => ({
      ref: s.ref,
      format: s.config.format,
      quantity: s.quantity,
      unitPrice: formatBySlug(s.config.format)?.price ?? null,
      finish: s.config.finish,
      color: s.config.color,
      name: s.config.name,
      cta: s.config.cta,
      hasLogo: !!logoUrl,
      reviewLink: s.reviewLink,
      needsLinkHelp: s.needsLinkHelp,
      contact: s.contact,
      payment: s.payment,
      designUrl: `${site.url}${editHref}`,
    }),
    [s, logoUrl, editHref],
  );
  const message = useMemo(() => buildOrderMessage(order, lang), [order, lang]);
  const wa = waLink(message);
  const mail = mailLink(emailSubject(s.ref, lang), message);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6 lg:pt-12">
      <h1 className="font-display text-h2 font-extrabold">{t.title}</h1>

      {/* Progress */}
      <div className="mt-6">
        <p className="eyebrow text-ink-soft">
          {fill(t.stepOf, { n: s.step + 1, total: STEPS })} · <span className="text-ink">{t.steps[s.step]}</span>
        </p>
        <ol className="mt-3 grid grid-cols-6 gap-1.5" aria-label={t.title}>
          {t.steps.map((name, i) => (
            <li key={name} aria-current={i === s.step ? "step" : undefined}>
              <span className="sr-only">
                {name}
                {i < s.step ? " ✓" : ""}
              </span>
              <span
                aria-hidden="true"
                className={`block h-1.5 rounded-full transition-colors ${i < s.step ? "bg-ink" : i === s.step ? "bg-tap" : "bg-line"}`}
              />
            </li>
          ))}
        </ol>
      </div>

      <form
        noValidate
        className="mt-10"
        onSubmit={(e) => {
          e.preventDefault();
          if (s.step < STEPS - 1) next();
        }}
      >
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 font-display text-3xl font-extrabold tracking-tight outline-none">
          {s.step === 4 ? t.payment.title : s.step === 5 ? t.review.title : t.steps[s.step]}
        </h2>

        {Object.keys(errors).length > 0 && (
          <p role="alert" className="error mt-4 flex items-center gap-2">
            <AlertTriangle aria-hidden="true" className="size-4" /> {t.fixErrors}
          </p>
        )}

        <div className="mt-6 space-y-6">
          {s.step === 0 && (
            <>
              <fieldset>
                <legend className="label">{t.badge.format}</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {formats.map((f) => (
                    <label
                      key={f.slug}
                      className="flex min-h-14 flex-col items-center justify-center rounded-control border-[1.5px] border-line bg-paper-raised px-3 py-2 text-center font-semibold transition-colors hover:border-ink has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:disabled]:border-dashed has-[:disabled]:bg-transparent has-[:disabled]:text-ink-soft has-[:disabled]:hover:border-line has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tap-deep"
                    >
                      <input
                        id={f.slug === orderableFormats[0].slug ? "f-format" : undefined}
                        type="radio"
                        name="format"
                        value={f.slug}
                        className="sr-only"
                        disabled={!f.available}
                        checked={s.config.format === f.slug}
                        onChange={() => set("config", { ...s.config, format: f.slug })}
                      />
                      {f.name[lang]}
                      {!f.available && <span className="font-mono text-[0.6875rem] font-normal uppercase tracking-wider">{d.common.comingSoon}</span>}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div>
                <label htmlFor="f-quantity" className="label">
                  {t.badge.qty}
                </label>
                <div className="flex items-center gap-2">
                  <StepButton label={t.badge.dec} onClick={() => set("quantity", Math.max(1, s.quantity - 1))} disabled={s.quantity <= 1}>
                    <Minus className="size-5" />
                  </StepButton>
                  <input
                    id="f-quantity"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={999}
                    value={s.quantity}
                    onChange={(e) => set("quantity", Math.min(999, Math.max(0, Math.floor(Number(e.target.value) || 0))))}
                    aria-invalid={!!errors.quantity}
                    aria-describedby="qty-note qty-error"
                    className="field w-24 text-center font-mono text-lg"
                  />
                  <StepButton label={t.badge.inc} onClick={() => set("quantity", Math.min(999, s.quantity + 1))}>
                    <Plus className="size-5" />
                  </StepButton>
                </div>
                <p id="qty-error" className="error">
                  {errors.quantity}
                </p>
                {format.price !== null && (
                  <p className="mt-3 text-lg">
                    {formatIDR(format.price)} {d.common.perPiece} · {t.badge.subtotal}{" "}
                    <strong>{formatIDR(format.price * s.quantity)}</strong>
                  </p>
                )}
                <p id="qty-note" className="hint">
                  {t.badge.priceNote}
                </p>
              </div>
            </>
          )}

          {s.step === 1 && (
            <div className="grid items-start gap-6 sm:grid-cols-[minmax(0,14rem)_1fr]">
              <DesignThumb lang={lang} config={s.config} logoUrl={logoUrl} />
              <div>
                <dl className="divide-y divide-line border-y border-line">
                  {[
                    [t.design.name, s.config.name],
                    [t.design.color, colorLabel(s.config.color, lang)],
                    [t.design.finish, finishById(s.config.finish)!.name[lang]],
                    ...(format.compact ? [] : [[t.design.cta, s.config.cta]]),
                    [t.design.logo, logoUrl ? t.design.logoYes : t.design.logoNo],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3">
                      <dt className="text-ink-soft">{k}</dt>
                      <dd className="text-right font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
                <Link href={editHref} className="btn btn-secondary mt-5">
                  <Pencil aria-hidden="true" className="size-4" /> {t.design.edit}
                </Link>
              </div>
            </div>
          )}

          {s.step === 2 && (
            <>
              <div>
                <label htmlFor="f-reviewLink" className="label">
                  {t.link.label}
                </label>
                <input
                  id="f-reviewLink"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  className="field"
                  placeholder="https://g.page/r/…/review"
                  value={s.reviewLink}
                  disabled={s.needsLinkHelp}
                  onChange={(e) => set("reviewLink", e.target.value.trim())}
                  aria-invalid={!!errors.reviewLink}
                  aria-describedby="link-status"
                />
                <div id="link-status" aria-live="polite">
                  {errors.reviewLink ? (
                    <p className="error">{errors.reviewLink}</p>
                  ) : s.needsLinkHelp ? null : linkCheck === "google" ? (
                    <p className="hint inline-flex items-center gap-1 font-semibold text-leaf">
                      <Check aria-hidden="true" className="size-4" /> {t.link.ok}
                    </p>
                  ) : linkCheck === "other" ? (
                    <p className="hint flex items-start gap-1.5 text-ink">
                      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-tap-deep" /> {t.link.warn}
                    </p>
                  ) : (
                    <p className="hint">{t.link.hint}</p>
                  )}
                </div>
              </div>
              <label className="flex min-h-11 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="size-5 accent-ink"
                  checked={s.needsLinkHelp}
                  onChange={(e) => {
                    set("needsLinkHelp", e.target.checked);
                    setErrors({});
                  }}
                />
                {t.link.noLink}
              </label>
              <details className="rounded-card border border-line bg-paper-raised px-5">
                <summary className="flex min-h-14 items-center justify-between gap-3 font-semibold">
                  {t.link.helperTitle}
                  <ChevronDown aria-hidden="true" className="faq-icon size-5 shrink-0 transition-transform" />
                </summary>
                <ol className="list-decimal space-y-2 pb-5 pl-5 text-ink-soft marker:font-mono marker:text-ink">
                  {t.link.helperSteps.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ol>
              </details>
            </>
          )}

          {s.step === 3 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="name" label={t.contact.name} value={s.contact.name} error={errors.name} onChange={(v) => setContact("name", v)} autoComplete="name" />
              <Field id="business" label={t.contact.business} value={s.contact.business} error={errors.business} onChange={(v) => setContact("business", v)} autoComplete="organization" />
              <Field
                id="phone"
                label={t.contact.phone}
                value={s.contact.phone}
                error={errors.phone}
                onChange={(v) => setContact("phone", v)}
                autoComplete="tel"
                inputMode="tel"
                type="tel"
                hint={t.contact.phoneHint}
                className="sm:col-span-2"
              />
              <Field
                id="address"
                label={t.contact.address}
                value={s.contact.address}
                error={errors.address}
                onChange={(v) => setContact("address", v)}
                autoComplete="street-address"
                multiline
                className="sm:col-span-2"
              />
              <Field id="city" label={t.contact.city} value={s.contact.city} error={errors.city} onChange={(v) => setContact("city", v)} autoComplete="address-level2" />
              <Field
                id="postal"
                label={t.contact.postal}
                value={s.contact.postal}
                error={errors.postal}
                onChange={(v) => setContact("postal", v.replace(/\D/g, "").slice(0, 5))}
                autoComplete="postal-code"
                inputMode="numeric"
              />
              <Field
                id="notes"
                label={t.contact.notes}
                value={s.contact.notes}
                onChange={(v) => setContact("notes", v)}
                placeholder={t.contact.notesPlaceholder}
                multiline
                optional
                className="sm:col-span-2"
              />
            </div>
          )}

          {s.step === 4 && (
            <fieldset aria-describedby="pay-note pay-error">
              <legend className="sr-only">{t.payment.title}</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {(Object.keys(t.payment.options) as PaymentId[]).map((id, i) => (
                  <label
                    key={id}
                    className="flex min-h-24 cursor-pointer flex-col rounded-card border-[1.5px] border-line bg-paper-raised p-4 transition-colors hover:border-ink has-[:checked]:border-ink has-[:checked]:shadow-[inset_0_0_0_1.5px_var(--color-ink)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-tap-deep"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-lg font-bold">{t.payment.options[id].title}</span>
                      <input
                        id={i === 0 ? "f-payment" : undefined}
                        type="radio"
                        name="payment"
                        value={id}
                        className="size-5 accent-ink"
                        checked={s.payment === id}
                        onChange={() => set("payment", id)}
                      />
                    </span>
                    <span className="mt-1 text-sm text-ink-soft">{t.payment.options[id].text}</span>
                  </label>
                ))}
              </div>
              <p id="pay-error" className="error">
                {errors.payment}
              </p>
              <p id="pay-note" className="mt-4 rounded-control bg-paper-sunk p-4 text-sm">
                {t.payment.note}
              </p>
            </fieldset>
          )}

          {s.step === 5 && (
            <ReviewStep lang={lang} s={s} logoUrl={logoUrl} wa={wa} mail={mail} onSent={() => set("sent", true)} onReset={() => {
              removeKey(KEY);
              setS({ ...initial(lang), ref: orderRef() });
              goTo(0);
            }} />
          )}
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
          {s.step > 0 ? (
            <button type="button" onClick={() => goTo(s.step - 1, true)} className="btn btn-secondary">
              <ArrowLeft aria-hidden="true" className="size-5" /> {t.back}
            </button>
          ) : (
            <span />
          )}
          {s.step < STEPS - 1 && (
            <button type="submit" className="btn btn-primary">
              {t.next} <ArrowRight aria-hidden="true" className="size-5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const colorLabel = (hex: string, lang: Lang) => {
  const sw = swatches.find((x) => x.hex === hex);
  return sw ? `${sw.name[lang]} · ${hex}` : hex;
};

function StepButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-12 place-items-center rounded-full border-[1.5px] border-ink transition-colors hover:bg-ink/5 disabled:opacity-40"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  multiline,
  optional,
  className = "",
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  hint?: string;
  multiline?: boolean;
  optional?: boolean;
  className?: string;
  autoComplete?: string;
  inputMode?: "tel" | "numeric";
  type?: string;
  placeholder?: string;
}) {
  const fid = `f-${id}`;
  const props = {
    id: fid,
    value,
    className: "field",
    "aria-invalid": !!error,
    "aria-required": !optional,
    "aria-describedby": `${fid}-msg`,
    ...rest,
  };
  return (
    <div className={className}>
      <label htmlFor={fid} className="label">
        {label}
      </label>
      {multiline ? (
        <textarea {...props} rows={3} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...props} onChange={(e) => onChange(e.target.value)} />
      )}
      <div id={`${fid}-msg`}>
        {error ? <p className="error">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
      </div>
    </div>
  );
}

function DesignThumb({ lang, config, logoUrl, className = "" }: { lang: Lang; config: BadgeConfig; logoUrl: string | null; className?: string }) {
  const format = formatBySlug(config.format)!;
  const logo = useLogoImage(logoUrl);
  const { canvas, version } = useBadgeFace(format, config, logo, getDict(lang).common.sample, { sheen: true, longSide: 640 });
  return (
    <div className={`stage flex aspect-square items-center justify-center rounded-card p-6 ${className}`}>
      <div className={format.layout === "landscape" ? "w-full" : format.compact ? "w-1/2" : "w-2/3"} style={{ filter: "drop-shadow(0 14px 14px #15120f40)" }}>
        <FaceCanvas source={canvas} version={version} format={format} />
      </div>
    </div>
  );
}

/** Step 6: the order printed as a café nota, then send. */
function ReviewStep({
  lang,
  s,
  logoUrl,
  wa,
  mail,
  onSent,
  onReset,
}: {
  lang: Lang;
  s: State;
  logoUrl: string | null;
  wa: string;
  mail: string;
  onSent: () => void;
  onReset: () => void;
}) {
  const d = getDict(lang);
  const t = d.checkout;
  const format = formatBySlug(s.config.format)!;
  const c = s.contact;
  const titleId = useId();
  const date = new Intl.DateTimeFormat(lang === "id" ? "id-ID" : "en-GB", { dateStyle: "medium" }).format(new Date());

  const rows: [string, string][] = [
    [format.name[lang], `× ${s.quantity}`],
    [t.design.finish, finishById(s.config.finish)!.name[lang]],
    [t.design.color, colorLabel(s.config.color, lang)],
    [t.design.name, s.config.name],
    ...(format.compact ? [] : ([[t.design.cta, s.config.cta]] as [string, string][])),
    [t.design.logo, logoUrl ? t.design.logoYes : t.design.logoNo],
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_17rem]">
      <article
        aria-labelledby={titleId}
        className="relative mx-auto w-full max-w-md bg-paper-raised px-6 pb-8 pt-7 font-mono text-[0.8125rem] leading-relaxed shadow-card [mask:radial-gradient(circle_6px_at_50%_100%,transparent_98%,#000)_0_0/14px_100%_repeat-x]"
      >
        <header className="text-center">
          <p id={titleId} className="font-display text-xl font-extrabold uppercase tracking-tight">
            {t.review.nota}
          </p>
          <p className="mt-1 text-ink-soft">TapUlasan · {site.domain}</p>
        </header>
        <Dashed />
        <Row k={t.review.ref} v={s.ref} strong />
        <Row k={t.review.date} v={date} />
        <Dashed />
        {rows.map(([k, v]) => (
          <Row key={k} k={k} v={v} />
        ))}
        <Dashed />
        <Row k={t.review.reviewLink} v={s.needsLinkHelp ? d.message.linkHelp : s.reviewLink} breakAll />
        <Row k={t.review.contact} v={[c.name, c.business, c.phone].filter(Boolean).join(" · ")} />
        <Row k={t.review.shipTo} v={[c.address, `${c.city} ${c.postal}`.trim()].filter(Boolean).join(", ")} />
        {c.notes.trim() && <Row k={t.contact.notes} v={c.notes} />}
        <Row k={t.review.payment} v={s.payment ? t.payment.options[s.payment].title : ""} />
        <Dashed />
        {format.price !== null && (
          <>
            <Row k={t.review.price} v={`${formatIDR(format.price)} ${d.common.perPiece}`} />
            <Row k={t.review.subtotal} v={formatIDR(format.price * s.quantity)} strong />
          </>
        )}
        <Row k={t.review.shipping} v={t.review.shippingValue} />
        <p className="mt-6 text-center text-ink-soft">{t.review.thanks}</p>
      </article>

      <div className="space-y-3">
        {!s.sent ? (
          <>
            <a href={wa} target="_blank" rel="noopener noreferrer" onClick={onSent} className="btn btn-primary w-full">
              <MessageCircle aria-hidden="true" className="size-5" /> {t.review.sendWa}
            </a>
            <a href={mail} onClick={onSent} className="btn btn-secondary w-full">
              <Mail aria-hidden="true" className="size-5" /> {t.review.sendEmail}
            </a>
            {logoUrl && (
              <p className="rounded-control bg-paper-sunk p-3 text-sm font-semibold">{t.review.logoReminder}</p>
            )}
            {!logoUrl && <p className="text-sm text-ink-soft">{t.review.logoReminder}</p>}
          </>
        ) : (
          <div role="status" className="rounded-card bg-leaf p-5 text-paper">
            <p className="flex items-center gap-2 text-lg font-bold">
              <Check aria-hidden="true" className="size-5" /> {t.success.title}
            </p>
            <p className="mt-2 text-sm">{t.success.text}</p>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
              {t.success.steps.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
            <p className="mt-4 text-sm font-semibold">{t.review.logoReminder}</p>
            <div className="mt-4 flex flex-col gap-1 text-sm">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center gap-2 font-bold underline underline-offset-4">
                <MessageCircle aria-hidden="true" className="size-4" /> {t.success.reopen}
              </a>
              <span>
                {t.success.notOpened}{" "}
                <a href={mail} className="inline-flex min-h-11 items-center font-bold underline underline-offset-4">
                  {t.success.viaEmail}
                </a>
              </span>
              <button type="button" onClick={onReset} className="flex min-h-11 items-center font-bold underline underline-offset-4">
                {t.success.newOrder}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Dashed = () => <hr aria-hidden="true" className="my-4 border-0 border-t-2 border-dashed border-line" />;

function Row({ k, v, strong, breakAll }: { k: string; v: string; strong?: boolean; breakAll?: boolean }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="shrink-0 text-ink-soft">{k}</span>
      <span className={`text-right ${strong ? "font-semibold" : ""} ${breakAll ? "break-all" : ""}`}>{v || "—"}</span>
    </div>
  );
}
