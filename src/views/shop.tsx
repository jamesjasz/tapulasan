import { FormatCard } from "@/components/format-card";
import { formats } from "@/content/products";
import { getDict, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/metadata";

export const shopMeta = (lang: Lang) => {
  const m = getDict(lang).meta.shop;
  return pageMeta(lang, "/shop/", m.title, m.description);
};

export function ShopView({ lang }: { lang: Lang }) {
  const t = getDict(lang).shop;
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:pt-16">
      <p className="eyebrow text-tap-deep">{t.eyebrow}</p>
      <h1 className="mt-3 font-display text-display font-extrabold">{t.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-soft">{t.sub}</p>
      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {formats.map((f) => (
          <li key={f.slug}>
            <FormatCard format={f} lang={lang} headingLevel={2} />
          </li>
        ))}
      </ul>
    </div>
  );
}
