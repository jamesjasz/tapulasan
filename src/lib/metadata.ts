import type { Metadata } from "next";
import { localePath, type Lang } from "./i18n.ts";

/** Per-page metadata with canonical + hreflang for both languages. `path` is the Indonesian path, e.g. "/shop/". */
export function pageMeta(lang: Lang, path: string, title: string, description: string, absoluteTitle = false): Metadata {
  const url = localePath(lang, path);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      languages: { id: path, en: localePath("en", path), "x-default": path },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "TapUlasan",
      locale: lang === "id" ? "id_ID" : "en_US",
      type: "website",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "TapUlasan" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
  };
}
