import { Globe, Mail, MessageCircle } from "lucide-react";
import { ContactCompose } from "@/components/contact-compose";
import { site } from "@/config/site";
import { getDict, type Lang } from "@/lib/i18n";
import { mailLink, waLink } from "@/lib/links";
import { pageMeta } from "@/lib/metadata";

export const contactMeta = (lang: Lang) => {
  const m = getDict(lang).meta.contact;
  return pageMeta(lang, "/contact/", m.title, m.description);
};

export function ContactView({ lang }: { lang: Lang }) {
  const t = getDict(lang).contact;
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 lg:pt-16">
      <p className="eyebrow text-tap-deep">{t.eyebrow}</p>
      <h1 className="mt-3 font-display text-display font-extrabold">{t.title}</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-soft">{t.sub}</p>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <a
          href={waLink(t.waGreeting)}
          className="group flex min-h-36 flex-col justify-between rounded-stage bg-tap p-6 text-ink transition-transform hover:-translate-y-1 sm:p-8"
        >
          <MessageCircle aria-hidden="true" className="size-9" />
          <span className="mt-6 font-display text-3xl font-extrabold tracking-tight">{t.wa}</span>
        </a>
        <a
          href={mailLink(t.emailSubject)}
          className="group flex min-h-36 flex-col justify-between rounded-stage bg-ink p-6 text-paper transition-transform hover:-translate-y-1 sm:p-8"
        >
          <Mail aria-hidden="true" className="size-9 text-tap" />
          <span className="mt-6">
            <span className="block font-display text-3xl font-extrabold tracking-tight">{t.email}</span>
            <span className="mt-1 block break-all font-mono text-sm text-ink-on-dark">{site.email}</span>
          </span>
        </a>
      </div>
      <p className="mt-6 flex items-center gap-2 text-ink-soft">
        <Globe aria-hidden="true" className="size-4" /> {t.site}: <span className="font-mono text-ink">{site.domain}</span>
      </p>

      <ContactCompose lang={lang} />
    </div>
  );
}
