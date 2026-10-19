import Link from "next/link";
import { ArrowRight, Globe2, Nfc, ShieldCheck } from "lucide-react";
import { site } from "@/config/site";
import { getDict, localePath, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/metadata";

export const aboutMeta = (lang: Lang) => {
  const m = getDict(lang).meta.about;
  return pageMeta(lang, "/about/", m.title, m.description);
};

const icons = [Nfc, Globe2];

export function AboutView({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const t = d.about;
  const facts = [
    [t.facts.founded, t.foundedValue],
    [t.facts.founder, site.founder],
    [t.facts.base, t.baseValue],
    [t.facts.email, <a key="e" href={`mailto:${site.email}`} className="break-all underline hover:text-tap-deep">{site.email}</a>],
    [t.facts.site, site.domain],
  ] as const;
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 lg:pt-16">
      <p className="eyebrow text-tap-deep">{t.eyebrow}</p>
      <h1 className="mt-3 font-display text-display font-extrabold">{t.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-soft">{t.sub}</p>

      <section aria-labelledby="what" className="mt-14">
        <h2 id="what" className="font-display text-h2 font-extrabold">{t.whatTitle}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {t.what.map((w, i) => {
            const Icon = icons[i];
            return (
              <article key={w.title} className="rounded-card border border-line bg-paper-raised p-6">
                <Icon aria-hidden="true" className="size-7 text-tap-deep" />
                <h3 className="mt-4 text-xl font-bold">{w.title}</h3>
                <p className="mt-2 text-ink-soft">{w.text}</p>
              </article>
            );
          })}
        </div>
        <p className="mt-6 flex items-start gap-3 rounded-card bg-ink p-6 text-paper">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-tap" />
          <span>
            {t.principle}{" "}
            <Link href={localePath(lang, "/how-it-works/")} className="inline-flex items-center gap-1 font-semibold underline hover:text-tap">
              {d.common.learnMore} <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </span>
        </p>
      </section>

      <section aria-labelledby="facts" className="mt-14">
        <h2 id="facts" className="font-display text-h2 font-extrabold">{t.factsTitle}</h2>
        <dl className="mt-6 divide-y divide-line rounded-card border border-line bg-paper-raised">
          {facts.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-6 py-4 sm:grid-cols-3">
              <dt className="eyebrow text-ink-soft">{k}</dt>
              <dd className="font-semibold sm:col-span-2">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
