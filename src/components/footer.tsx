import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { site } from "@/config/site";
import { fill, getDict, localePath, type Lang } from "@/lib/i18n";
import { mailLink, waLink } from "@/lib/links";
import { LangToggle } from "./header";
import { Wordmark } from "./wordmark";

export function Footer({ lang }: { lang: Lang }) {
  const d = getDict(lang);
  const nav = [
    { href: "/", label: d.nav.home },
    { href: "/shop/", label: d.nav.shop },
    { href: "/how-it-works/", label: d.nav.how },
    { href: "/contact/", label: d.nav.contact },
  ];
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark className="text-2xl" />
          <p className="mt-3 max-w-xs text-ink-on-dark">{d.footer.tagline}</p>
        </div>
        <nav aria-label={d.footer.explore}>
          <h2 className="eyebrow text-ink-on-dark">{d.footer.explore}</h2>
          <ul className="mt-3">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={localePath(lang, n.href)} className="flex min-h-11 items-center font-semibold hover:text-tap">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="eyebrow text-ink-on-dark">{d.footer.contact}</h2>
          <ul className="mt-3">
            <li>
              <a href={waLink(d.contact.waGreeting)} className="flex min-h-11 items-center gap-2 font-semibold hover:text-tap">
                <MessageCircle aria-hidden="true" className="size-4" /> WhatsApp
              </a>
            </li>
            <li>
              <a href={mailLink(d.contact.emailSubject)} className="flex min-h-11 items-center gap-2 font-semibold break-all hover:text-tap">
                <Mail aria-hidden="true" className="size-4 shrink-0" /> {site.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-sm text-ink-on-dark sm:px-6">
          <p>
            {fill(d.footer.rights, { year: new Date().getFullYear() })} · {site.domain}
          </p>
          <div className="flex items-center gap-2">
            <span className="eyebrow">{d.footer.language}</span>
            <LangToggle lang={lang} onDark />
          </div>
        </div>
      </div>
    </footer>
  );
}
