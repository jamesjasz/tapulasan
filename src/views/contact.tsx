import { getDict, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/metadata";

export const contactMeta = (lang: Lang) => {
  const m = getDict(lang).meta.contact;
  return pageMeta(lang, "/contact/", m.title, m.description);
};

export function ContactView({ lang }: { lang: Lang }) {
  return <h1 className="p-8 font-display text-display">Contact {lang}</h1>;
}
