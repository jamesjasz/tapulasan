import { getDict, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/metadata";

export const howMeta = (lang: Lang) => {
  const m = getDict(lang).meta.how;
  return pageMeta(lang, "/how-it-works/", m.title, m.description);
};

export function HowView({ lang }: { lang: Lang }) {
  return <h1 className="p-8 font-display text-display">How {lang}</h1>;
}
