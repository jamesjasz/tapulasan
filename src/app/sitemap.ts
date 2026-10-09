import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { formats } from "@/content/products";
import { localePath } from "@/lib/i18n";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/shop/", ...formats.map((f) => `/shop/${f.slug}/`), "/how-it-works/", "/contact/"];
  return paths.flatMap((p) =>
    (["id", "en"] as const).map((lang) => ({
      url: site.url + localePath(lang, p),
      alternates: { languages: { id: site.url + p, en: site.url + localePath("en", p) } },
    })),
  );
}
