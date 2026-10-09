"use client";

import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";
import { getDict, type Lang } from "@/lib/i18n";
import { mailLink, waLink } from "@/lib/links";

/** Builds a wa.me / mailto link on the client. Nothing is stored or sent anywhere else. */
export function ContactCompose({ lang }: { lang: Lang }) {
  const t = getDict(lang).contact;
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  const body = [message.trim(), name.trim() && `— ${name.trim()}`].filter(Boolean).join("\n\n");

  const guard = (e: React.MouseEvent) => {
    if (message.trim()) return;
    e.preventDefault();
    setError(true);
    document.getElementById("compose-message")?.focus();
  };

  return (
    <section aria-labelledby="compose-title" className="mt-16 rounded-stage border border-line bg-paper-raised p-6 sm:p-8">
      <h2 id="compose-title" className="font-display text-3xl font-extrabold tracking-tight">
        {t.compose.title}
      </h2>
      <div className="mt-6 grid gap-5">
        <div>
          <label htmlFor="compose-name" className="label">
            {t.compose.name}
          </label>
          <input id="compose-name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="compose-message" className="label">
            {t.compose.message}
          </label>
          <textarea
            id="compose-message"
            className="field"
            rows={5}
            placeholder={t.compose.messagePlaceholder}
            value={message}
            aria-invalid={error && !message.trim()}
            aria-describedby="compose-error"
            onChange={(e) => {
              setMessage(e.target.value);
              setError(false);
            }}
          />
          <p id="compose-error" className="error" role="alert">
            {error && !message.trim() ? t.compose.required : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={waLink(body)} onClick={guard} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <MessageCircle aria-hidden="true" className="size-5" /> {t.compose.sendWa}
          </a>
          <a href={mailLink(t.emailSubject, body)} onClick={guard} className="btn btn-secondary">
            <Mail aria-hidden="true" className="size-5" /> {t.compose.sendEmail}
          </a>
        </div>
        <p className="text-sm text-ink-soft">{t.compose.note}</p>
      </div>
    </section>
  );
}
