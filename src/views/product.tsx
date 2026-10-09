import { formatBySlug, formats } from "@/content/products";
import { fill, getDict, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/metadata";

export const productParams = () => formats.map((f) => ({ format: f.slug }));

export const productMeta = (lang: Lang, slug: string) => {
  const f = formatBySlug(slug)!;
  const m = getDict(lang).meta.product;
  const vars = { name: f.name[lang], tagline: f.tagline[lang] };
  return pageMeta(lang, `/shop/${slug}/`, fill(m.title, vars), fill(m.description, vars));
};

export function ProductView({ lang, format }: { lang: Lang; format: string }) {
  return <h1 className="p-8 font-display text-display">{format} {lang}</h1>;
}
