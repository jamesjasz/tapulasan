import "./globals.css";
import type { Metadata } from "next";
import { Ripple } from "@/components/ripple";
import { Wordmark } from "@/components/wordmark";
import { fontVars } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "404 · TapUlasan",
  description: "Halaman tidak ditemukan / Page not found",
};

// Plain <a> links: this page renders outside both root layouts.
/* eslint-disable @next/next/no-html-link-for-pages */
export default function GlobalNotFound() {
  return (
    <html lang="id" className={fontVars}>
      <body className="grid min-h-dvh place-items-center px-4 py-16 antialiased">
        <main className="w-full max-w-xl text-center">
          <a href="/" className="inline-flex min-h-11 items-center" aria-label="TapUlasan">
            <Wordmark />
          </a>
          <Ripple animated rings={3} className="mx-auto my-10 size-40" color="var(--color-tap)" />
          <p className="eyebrow text-ink-soft">404</p>
          <h1 className="mt-2 font-display text-h2 font-extrabold">Tap-nya meleset.</h1>
          <p className="mt-3 text-lg text-ink-soft">Halaman ini tidak ada atau sudah dipindah.</p>
          <p lang="en" className="mt-6 font-display text-2xl font-bold">
            That tap missed.
          </p>
          <p lang="en" className="mt-1 text-ink-soft">
            This page doesn&apos;t exist or has moved.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href="/" className="btn btn-primary">
              Ke beranda
            </a>
            <a href="/en/" lang="en" className="btn btn-secondary">
              Go to the English site
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
