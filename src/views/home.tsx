import { getDict, type Lang } from "@/lib/i18n";
import { pageMeta } from "@/lib/metadata";

export const homeMeta = (lang: Lang) => {
  const m = getDict(lang).meta.home;
  return pageMeta(lang, "/", m.title, m.description);
};

export function HomeView({ lang }: { lang: Lang }) {
  return <h1 className="p-8 font-display text-display">Home {lang}</h1>;
}
