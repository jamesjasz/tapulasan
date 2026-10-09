import { Plus } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { Text } from "./placeholder-text";

export function Faq({ items, lang }: { items: { q: string; a: string }[]; lang: Lang }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex min-h-16 items-center justify-between gap-4 py-4 text-left text-lg font-semibold">
            {item.q}
            <Plus aria-hidden="true" className="faq-icon size-5 shrink-0 transition-transform duration-200" />
          </summary>
          <p className="max-w-2xl pb-5 text-ink-soft">
            <Text value={item.a} lang={lang} />
          </p>
        </details>
      ))}
    </div>
  );
}
