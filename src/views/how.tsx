import Link from "next/link";
import { ArrowRight, DoorOpen, IdCard, QrCode, Receipt, ShieldCheck, Smartphone, UtensilsCrossed } from "lucide-react";
import { Ripple } from "@/components/ripple";
import { getDict, localePath, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/metadata";

export const howMeta = (lang: Lang) => {
  const m = getDict(lang).meta.how;
  return pageMeta(lang, "/how-it-works/", m.title, m.description);
};

const placeIcons = [Receipt, UtensilsCrossed, DoorOpen, IdCard];

export function HowView({ lang }: { lang: Lang }) {
  const t = getDict(lang).how;
  return (
    <>
      <header className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 lg:pt-16">
        <p className="eyebrow text-tap-deep">{t.eyebrow}</p>
        <h1 className="mt-3 max-w-4xl font-display text-[clamp(2.5rem,6.5vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
          {t.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-ink-soft">{t.sub}</p>
      </header>

      {/* Tap vs scan */}
      <section aria-labelledby="tvs" className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 id="tvs" className="font-display text-h2 font-extrabold">
          {t.tapVsScan.title}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="relative overflow-hidden rounded-stage bg-tap p-6 sm:p-8">
            <div className="relative mb-8 grid size-28 place-items-center">
              <Ripple animated className="absolute inset-0" rings={3} color="var(--color-ink)" />
              <Smartphone aria-hidden="true" className="relative size-10" />
            </div>
            <h3 className="text-2xl font-bold">{t.tapVsScan.tap.title}</h3>
            <p className="mt-2 max-w-md text-lg">{t.tapVsScan.tap.text}</p>
          </article>
          <article className="rounded-stage bg-ink p-6 text-paper sm:p-8">
            <div className="mb-8 grid size-28 place-items-center rounded-card bg-paper text-ink">
              <QrCode aria-hidden="true" className="size-14" />
            </div>
            <h3 className="text-2xl font-bold">{t.tapVsScan.scan.title}</h3>
            <p className="mt-2 max-w-md text-lg text-ink-on-dark">{t.tapVsScan.scan.text}</p>
          </article>
        </div>
      </section>

      {/* Phones */}
      <section aria-labelledby="phones" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 id="phones" className="font-display text-h2 font-extrabold">
          {t.phones.title}
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[t.phones.iphone, t.phones.android].map((p) => (
            <article key={p.title} className="flex gap-4 rounded-card border border-line bg-paper-raised p-6">
              <Smartphone aria-hidden="true" className="size-7 shrink-0 text-tap-deep" />
              <div>
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="mt-1.5 text-ink-soft">{p.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Placement */}
      <section aria-labelledby="place" className="border-y border-line bg-paper-raised">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
          <h2 id="place" className="font-display text-h2 font-extrabold">
            {t.placement.title}
          </h2>
          <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.placement.tips.map((tip, i) => {
              const Icon = placeIcons[i];
              return (
                <li key={tip.title}>
                  <span className="grid size-14 place-items-center rounded-full bg-paper-sunk">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{tip.title}</h3>
                  <p className="mt-1.5 text-ink-soft">{tip.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* The no-gating principle */}
      <section aria-labelledby="gating" className="bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-[auto_1fr] lg:py-28">
          <ShieldCheck aria-hidden="true" className="size-14 text-tap" />
          <div>
            <h2 id="gating" className="font-display text-h2 font-extrabold">
              {t.principle.title}
            </h2>
            <p className="mt-5 max-w-3xl text-xl leading-relaxed text-ink-on-dark">{t.principle.text}</p>
          </div>
        </div>
      </section>

      {/* Setup steps */}
      <section aria-labelledby="setup" className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:py-28">
        <h2 id="setup" className="font-display text-h2 font-extrabold">
          {t.setup.title}
        </h2>
        <ol className="mt-10">
          {t.setup.steps.map((s, i) => (
            <li key={s.title} className="relative flex gap-5 pb-10 last:pb-0">
              {i < t.setup.steps.length - 1 && (
                <span aria-hidden="true" className="absolute bottom-0 left-[1.375rem] top-12 w-0.5 bg-line" />
              )}
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink font-mono font-semibold text-paper">{i + 1}</span>
              <div className="pt-1.5">
                <h3 className="text-xl font-bold">{s.title}</h3>
                <p className="mt-1.5 text-ink-soft">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link href={localePath(lang, "/shop/")} className="btn btn-primary mt-12">
          {t.cta} <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </section>
    </>
  );
}
