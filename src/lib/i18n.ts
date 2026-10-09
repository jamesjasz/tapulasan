import { dictionary } from "../content/dictionary.ts";

export type Lang = "id" | "en";
export const getDict = (lang: Lang) => dictionary[lang];

/** "/shop/" → "/en/shop/" for English. Paths always end with "/" (trailingSlash export). */
export function localePath(lang: Lang, path: string) {
  return lang === "id" ? path : path === "/" ? "/en/" : `/en${path}`;
}

/** Map a pathname to the same page in the other language. */
export function counterpartPath(pathname: string): { lang: Lang; path: string } {
  const p = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (p === "/en/" || p.startsWith("/en/")) return { lang: "id", path: p.slice(3) || "/" };
  return { lang: "en", path: localePath("en", p) };
}

/** fill("Langkah {n}", { n: 2 }) → "Langkah 2" */
export const fill = (s: string, vars: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
