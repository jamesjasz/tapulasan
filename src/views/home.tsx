import Link from "next/link";
import { ArrowRight, Check, CheckCircle2, Clock, MapPin, MessageCircle, Sparkles, Star } from "lucide-react";
import { Faq } from "@/components/faq";
import { FormatCard } from "@/components/format-card";
import { Ripple } from "@/components/ripple";
import { TapDemo } from "@/components/tap-demo";
import { formats } from "@/content/products";
import { getDict, localePath, type Lang } from "@/lib/i18n";
import { waLink } from "@/lib/links";
import { pageMeta } from "@/lib/metadata";

export const homeMeta = (lang: Lang) => {
  const m = getDict(lang).meta.home;
  return pageMeta(lang, "/", m.title, m.description, true);
};

export function HomeView({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const h = d.home;
  const L = (p: string) => localePath(lang, p);

  return (
    <>
      {/* 1 · Hero: the tap demo */}
      <section className="relative z-10">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-12 lg:items-end lg:gap-8 lg:pb-0 lg:pt-16">
          <div className="lg:col-span-7 lg:pb-28">
            <p className="eyebrow text-tap-deep">{h.hero.eyebrow}</p>
            <h1 className="mt-4 font-display text-display font-extrabold">
              {h.hero.title.split(". ").map((part, i, all) => (
                <span key={i} className="block">
                  {part}
                  {i < all.length - 1 ? "." : ""}
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft sm:text-xl">{h.hero.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={L("/shop/")} className="btn btn-primary">
                {h.hero.ctaPrimary} <ArrowRight aria-hidden="true" className="size-5" />
              </Link>
              <Link href={L("/how-it-works/")} className="btn btn-secondary">
                {h.hero.ctaSecondary}
              </Link>
            </div>
          </div>
          <div className="lg:col-span-5 lg:-mb-36">
            <TapDemo lang={lang} />
          </div>
        </div>
      </section>

      {/* 2 · Problem → solution (dark band; the demo stage overlaps its top edge on desktop) */}
      <section aria-labelledby="problem-title" className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:pt-52">
          <p className="eyebrow text-tap">{h.problem.eyebrow}</p>
          <h2 id="problem-title" className="mt-3 max-w-3xl font-display text-h2 font-extrabold">
            {h.problem.title}
          </h2>
          <p className="mt-4 text-lg text-ink-on-dark">{h.problem.sub}</p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-card border border-paper/15 p-6 sm:p-8">
              <h3 className="eyebrow text-ink-on-dark">{h.problem.oldLabel}</h3>
              <ol className="mt-5 space-y-3">
                {h.problem.oldSteps.map((s, i) => (
                  <li key={s} className="flex items-baseline gap-4 text-lg text-ink-on-dark">
                    <span className="font-mono text-sm tabular-nums text-ink-on-dark">{String(i + 1).padStart(2, "0")}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative flex flex-col justify-between overflow-hidden rounded-card bg-tap p-6 text-ink sm:p-8">
              <Ripple className="absolute -right-16 -top-16 size-72 opacity-30" rings={4} color="var(--color-ink)" />
              <h3 className="eyebrow relative">{h.problem.newLabel}</h3>
              <p className="relative mt-8 font-display text-[clamp(4.5rem,13vw,9rem)] font-extrabold leading-[0.85] tracking-[-0.05em]">
                {h.problem.newBig}
              </p>
              <p className="relative mt-6 max-w-sm text-lg font-semibold">{h.problem.newText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 · Formats */}
      <section aria-labelledby="formats-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-tap-deep">{h.formats.eyebrow}</p>
            <h2 id="formats-title" className="mt-3 font-display text-h2 font-extrabold">
              {h.formats.title}
            </h2>
            <p className="mt-4 max-w-xl text-lg text-ink-soft">{h.formats.sub}</p>
          </div>
          <Link href={L("/shop/")} className="btn btn-secondary">
            {d.nav.shop} <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        </div>
        <ul className="-mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {formats.map((f) => (
            <li key={f.slug} className="w-[78%] shrink-0 snap-start sm:w-auto">
              <FormatCard format={f} lang={lang} />
            </li>
          ))}
        </ul>
      </section>

      {/* 4 · How it works */}
      <section aria-labelledby="how-title" className="border-y border-line bg-paper-raised">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-24">
          <p className="eyebrow text-tap-deep">{h.how.eyebrow}</p>
          <h2 id="how-title" className="mt-3 max-w-2xl font-display text-h2 font-extrabold">
            {h.how.title}
          </h2>
          <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {h.how.steps.map((s, i) => (
              <li key={s.title}>
                <div className="flex items-center gap-3">
                  <span
                    className={`grid size-11 place-items-center rounded-full font-mono font-semibold ${s.planned ? "border-2 border-dashed border-ink-soft text-ink-soft" : "bg-ink text-paper"}`}
                  >
                    {i + 1}
                  </span>
                  {s.planned && <span className="eyebrow rounded-full bg-paper-sunk px-2.5 py-1 text-ink-soft">{d.common.planned}</span>}
                </div>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-ink-soft">{s.text}</p>
              </li>
            ))}
          </ol>
          <Link href={L("/how-it-works/")} className="link mt-10 inline-flex min-h-11 items-center gap-1">
            {d.common.learnMore} <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>

      {/* 5 · Business website */}
      <section aria-labelledby="web-title" className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 lg:py-28">
        <div className="md:order-2">
          <p className="eyebrow text-tap-deep">{h.website.eyebrow}</p>
          <h2 id="web-title" className="mt-3 font-display text-h2 font-extrabold">
            {h.website.title}
          </h2>
          <p className="mt-4 text-lg text-ink-soft">{h.website.sub}</p>
          <ul className="mt-6 space-y-3">
            {h.website.bullets.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-leaf" />
                {b}
              </li>
            ))}
          </ul>
          <Link href={L("/contact/")} className="btn btn-secondary mt-8">
            {h.website.cta}
          </Link>
        </div>
        <SiteMock lang={lang} />
      </section>

      {/* 6 · AI review assistant — coming soon */}
      <section aria-labelledby="ai-title" className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-stage bg-ink p-6 text-paper sm:p-10 lg:p-14">
          <Ripple className="absolute -bottom-40 -right-40 size-[28rem] opacity-20" rings={5} color="var(--color-tap)" />
          <span className="eyebrow relative inline-flex items-center gap-2 rounded-full border border-paper/30 px-3 py-1.5">
            <Clock aria-hidden="true" className="size-3.5" /> {h.ai.tag}
          </span>
          <h2 id="ai-title" className="relative mt-5 font-display text-h2 font-extrabold">
            {h.ai.title}
          </h2>
          <p className="relative mt-3 max-w-xl text-lg text-ink-on-dark">{h.ai.sub}</p>
          <ul className="relative mt-10 grid gap-6 md:grid-cols-3">
            {h.ai.features.map((f) => (
              <li key={f.title} className="rounded-card bg-ink-raised p-5">
                <Sparkles aria-hidden="true" className="size-5 text-tap" />
                <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-ink-on-dark">{f.text}</p>
              </li>
            ))}
          </ul>
          <p className="relative mt-8 inline-flex items-center gap-2 font-semibold">
            <CheckCircle2 aria-hidden="true" className="size-5 text-tap" /> {h.ai.approve}
          </p>
        </div>
      </section>

      {/* 7 · Principles (instead of testimonials) */}
      <section aria-labelledby="principles-title" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
        <p className="eyebrow text-tap-deep">{h.principles.eyebrow}</p>
        <h2 id="principles-title" className="mt-3 max-w-3xl font-display text-h2 font-extrabold">
          {h.principles.title}
        </h2>
        <ul className="mt-12 grid gap-px overflow-hidden rounded-card bg-line md:grid-cols-3">
          {h.principles.items.map((p) => (
            <li key={p.title} className="bg-paper p-6 sm:p-8">
              <h3 className="font-display text-2xl font-extrabold tracking-tight">{p.title}</h3>
              <p className="mt-3 text-ink-soft">{p.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 8 · FAQ */}
      <section aria-labelledby="faq-title" className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:pb-28">
        <h2 id="faq-title" className="font-display text-h2 font-extrabold">
          {h.faqTitle}
        </h2>
        <div className="mt-8">
          <Faq items={h.faq} lang={lang} />
        </div>
      </section>

      {/* 9 · Final CTA */}
      <FinalCta lang={lang} />
    </>
  );
}

export function FinalCta({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const f = d.home.final;
  return (
    <section aria-labelledby="final-title" className="relative overflow-hidden bg-ink text-paper">
      <Ripple animated className="absolute left-1/2 top-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 opacity-40" rings={4} color="var(--color-tap)" />
      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:py-32">
        <h2 id="final-title" className="font-display text-h2 font-extrabold">
          {f.title}
        </h2>
        <p className="mt-4 text-lg text-ink-on-dark">{f.sub}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href={localePath(lang, "/shop/")} className="btn btn-primary">
            {f.cta} <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
          <a href={waLink(d.contact.waGreeting)} className="btn btn-secondary">
            <MessageCircle aria-hidden="true" className="size-5" /> {f.secondary}
          </a>
        </div>
      </div>
    </section>
  );
}

/** Phone mockup of a sample client site. Illustrative; captioned as not a real client. */
function SiteMock({ lang }: { lang: Lang }) {
  const m = getDict(lang).home.website.mock;
  return (
    <figure className="md:order-1">
      <div className="stage mx-auto flex max-w-md justify-center rounded-stage px-6 pt-10" aria-hidden="true">
        <div className="w-[64%] rounded-t-[2rem] bg-ink p-2.5 pb-0 shadow-object">
          <div className="overflow-hidden rounded-t-[1.5rem] bg-paper-raised">
            <div className="flex h-24 items-end bg-[#6B4226] p-4">
              <span className="font-display text-xl font-extrabold text-paper">{m.name}</span>
            </div>
            <div className="space-y-3 p-4 text-[0.7rem]">
              <p className="text-ink-soft">{m.tag}</p>
              <p className="flex items-center gap-1.5 font-semibold text-leaf">
                <Clock className="size-3.5" /> {m.hours}
              </p>
              <div>
                <p className="eyebrow text-[0.6rem] text-ink-soft">{m.menu}</p>
                <ul className="mt-1.5 divide-y divide-line">
                  {m.items.map((i) => (
                    <li key={i} className="py-1.5 font-medium">
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex h-14 items-center justify-center gap-1.5 rounded-lg bg-paper-sunk text-ink-soft">
                <MapPin className="size-3.5" /> {m.map}
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-full bg-tap py-2.5 font-bold text-ink">
                <Star className="size-3.5" /> {m.review}
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-sm text-ink-soft">{m.caption}</figcaption>
    </figure>
  );
}
