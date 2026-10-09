import { getDict, type Lang } from "@/lib/i18n";

/** Renders copy; any "[[PLACEHOLDER: …]]" becomes a visible "to be confirmed" chip instead of fake content. */
export function Text({ value, lang }: { value: string; lang: Lang }) {
  const parts = value.split(/\[\[PLACEHOLDER: (.*?)\]\]/);
  if (parts.length === 1) return <>{value}</>;
  // split() with a capture group alternates: text, note, text, note, …
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 0 ? (
          part.trim() && <span key={i}>{part} </span>
        ) : (
          <span
            key={i}
            title={part}
            className="inline-flex items-center rounded-full border-2 border-dashed border-current/40 px-2.5 py-0.5 align-middle font-mono text-xs uppercase tracking-wider opacity-80"
          >
            {getDict(lang).common.tbc}
          </span>
        ),
      )}
    </>
  );
}
