import { getDict, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/metadata";

export const shopMeta = (lang: Lang) => {
  const m = getDict(lang).meta.shop;
  return pageMeta(lang, "/shop/", m.title, m.description);
};

export function ShopView({ lang }: { lang: Lang }) {
  return <h1 className="p-8 font-display text-display">Shop {lang}</h1>;
}
