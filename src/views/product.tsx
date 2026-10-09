import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Customizer } from "@/components/customizer";
import { Faq } from "@/components/faq";
import { Text } from "@/components/placeholder-text";
import { formatBySlug, formats, type FormatSlug } from "@/content/products";
import { fill, getDict, localePath, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/metadata";

export const productParams = () => formats.map((f) => ({ format: f.slug }));

export const productMeta = (lang: Lang, slug: string) => {
  const f = formatBySlug(slug)!;
  const m = getDict(lang).meta.product;
  const vars = { name: f.name[lang], tagline: f.tagline[lang] };
  return pageMeta(lang, `/shop/${slug}/`, fill(m.title, vars), fill(m.description, vars));
};

export function ProductView({ lang, format: slug }: { lang: Lang; format: string }) {
  const d = getDict(lang);
  const t = d.product;
  const f = formatBySlug(slug)!;

  const header = (
    <div>
      <Link href={localePath(lang, "/shop/")} className="-ml-2 inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeft aria-hidden="true" className="size-4" /> {t.back}
      </Link>
      <p className="eyebrow mt-3 text-tap-deep">{t.eyebrow}</p>
      <h1 className="mt-1 font-display text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
        {f.name[lang]}
      </h1>
      <p className="mt-3 text-lg text-ink-soft">{f.tagline[lang]}</p>
      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-paper">
        {f.price === null ? d.common.priceSoon : f.price}
      </p>
    </div>
  );

  const specs = [
    [t.specs.dimensions, f.specs.dimensions],
    [t.specs.material, f.specs.material],
    [t.specs.chip, f.specs.chip],
    [t.specs.compat, t.specs.compatValue],
    [t.specs.price, f.price === null ? d.common.priceSoon : String(f.price)],
  ];

  return (
    <>
      <div className="pt-4 lg:pt-8">
        <Customizer lang={lang} slug={slug as FormatSlug} header={header} />
      </div>

      <div className="mx-auto grid max-w-7xl gap-14 px-4 pb-24 sm:px-6 lg:grid-cols-2 lg:gap-20">
        <section aria-labelledby="specs-title">
          <h2 id="specs-title" className="font-display text-3xl font-extrabold tracking-tight">
            {t.specs.title}
          </h2>
          <table className="mt-6 w-full border-collapse text-left">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k} className="border-b border-line">
                  <th scope="row" className="eyebrow w-2/5 py-4 pr-4 align-top font-normal text-ink-soft">
                    {k}
                  </th>
                  <td className="py-4 font-medium">
                    <Text value={v} lang={lang} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section aria-labelledby="pfaq-title">
          <h2 id="pfaq-title" className="font-display text-3xl font-extrabold tracking-tight">
            {t.faqTitle}
          </h2>
          <div className="mt-6">
            <Faq items={t.faq} lang={lang} />
          </div>
        </section>
      </div>
    </>
  );
}
