import "@/app/globals.css";
import { site } from "@/config/site";
import { fontVars } from "@/lib/fonts";
import { getDict, type Lang } from "@/lib/i18n";
import { Footer } from "./footer";
import { Header } from "./header";

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  email: site.email,
  logo: `${site.url}/icon.svg`,
};

/** The <html> shell shared by the two root layouts (id at "/", en at "/en"). */
export function SiteShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={lang} className={fontVars}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main"
          className="fixed left-3 top-3 z-50 -translate-y-24 rounded-full bg-ink px-4 py-3 font-semibold text-paper focus:translate-y-0"
        >
          {getDict(lang).nav.skip}
        </a>
        <Header lang={lang} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </body>
    </html>
  );
}
