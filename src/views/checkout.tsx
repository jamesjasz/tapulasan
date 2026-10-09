import { Checkout } from "@/components/checkout";
import { getDict, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/metadata";

export const checkoutMeta = (lang: Lang) => {
  const m = getDict(lang).meta.checkout;
  return { ...pageMeta(lang, "/checkout/", m.title, m.description), robots: { index: false } };
};

export function CheckoutView({ lang }: { lang: Lang }) {
  return <Checkout lang={lang} />;
}
