import { getDict, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/metadata";

export const checkoutMeta = (lang: Lang) => {
  const m = getDict(lang).meta.checkout;
  return pageMeta(lang, "/checkout/", m.title, m.description);
};

export function CheckoutView({ lang }: { lang: Lang }) {
  return <h1 className="p-8 font-display text-display">Checkout {lang}</h1>;
}
