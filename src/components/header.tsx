"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { counterpartPath, getDict, localePath, type Lang } from "@/lib/i18n";
import { Wordmark } from "./wordmark";

export function Header({ lang }: { lang: Lang }) {
  const t = getDict(lang).nav;
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);

  const nav = [
    { href: "/", label: t.home },
    { href: "/shop/", label: t.shop },
    { href: "/how-it-works/", label: t.how },
    { href: "/contact/", label: t.contact },
  ].map((n) => ({ ...n, href: localePath(lang, n.href) }));

  const current = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const isActive = (href: string) =>
    href === localePath(lang, "/") ? current === href : current.startsWith(href);

  // Close the sheet on navigation.
  useEffect(() => dialog.current?.close(), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href={localePath(lang, "/")} className="-ml-1 flex min-h-11 items-center px-1" aria-label="TapUlasan">
          <Wordmark />
        </Link>

        <nav aria-label={t.primary} className="ml-6 hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.slice(1).map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className="flex min-h-11 items-center rounded-full px-3.5 text-[0.9375rem] font-semibold text-ink-soft transition-colors hover:text-ink aria-[current=page]:text-ink aria-[current=page]:underline aria-[current=page]:decoration-tap aria-[current=page]:decoration-[3px] aria-[current=page]:underline-offset-8"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LangToggle lang={lang} />
          <Link href={localePath(lang, "/shop/")} className="btn btn-primary hidden min-h-11 px-5 text-[0.9375rem] sm:inline-flex">
            {t.cta}
          </Link>
          <button
            type="button"
            onClick={() => dialog.current?.showModal()}
            className="flex size-11 items-center justify-center rounded-full md:hidden"
            aria-label={t.menu}
            aria-haspopup="dialog"
          >
            <Menu aria-hidden="true" className="size-6" />
          </button>
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-label={t.menu}
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="m-0 ml-auto h-dvh max-h-none w-[min(22rem,88vw)] max-w-none bg-paper p-0 text-ink backdrop:bg-ink/40 open:flex open:flex-col"
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Wordmark />
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="flex size-11 items-center justify-center rounded-full"
            aria-label={t.close}
          >
            <X aria-hidden="true" className="size-6" />
          </button>
        </div>
        <nav aria-label={t.primary} className="flex-1 px-4 py-6">
          <ul className="space-y-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => dialog.current?.close()}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className="flex min-h-14 items-center rounded-card px-3 font-display text-3xl font-bold tracking-tight aria-[current=page]:text-tap-deep"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-line p-4">
          <Link href={localePath(lang, "/shop/")} onClick={() => dialog.current?.close()} className="btn btn-primary w-full">
            {t.cta}
          </Link>
        </div>
      </dialog>
    </header>
  );
}

export function LangToggle({ lang, onDark = false }: { lang: Lang; onDark?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const target = counterpartPath(pathname);
  const t = getDict(lang).nav;
  return (
    <Link
      href={target.path}
      hrefLang={target.lang}
      lang={target.lang}
      aria-label={t.switchTo}
      // Keep the query string (customizer state) when switching language.
      onClick={(e) => {
        if (!window.location.search) return;
        e.preventDefault();
        router.push(target.path + window.location.search);
      }}
      className={`flex min-h-11 items-center rounded-full px-1 font-mono text-[0.8125rem] font-semibold tracking-wider ${onDark ? "text-ink-on-dark" : "text-ink-soft"}`}
    >
      <span aria-hidden="true" className="flex items-center rounded-full border border-current/40 p-0.5">
        {(["id", "en"] as const).map((l) => (
          <span
            key={l}
            className={`rounded-full px-2 py-1 uppercase ${l === lang ? (onDark ? "bg-paper text-ink" : "bg-ink text-paper") : ""}`}
          >
            {l}
          </span>
        ))}
      </span>
    </Link>
  );
}
