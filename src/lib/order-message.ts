// Pure order → message text. Relative imports only: also run by `node --test`.

import { dictionary } from "../content/dictionary.ts";
import { finishById, formatBySlug, swatches, type FinishId, type FormatSlug } from "../content/products.ts";

export type Lang = "id" | "en";
export type PaymentId = "qris" | "transfer" | "ewallet";

export type Order = {
  ref: string;
  format: FormatSlug;
  quantity: number;
  finish: FinishId;
  color: string;
  name: string;
  cta: string;
  hasLogo: boolean;
  reviewLink: string;
  needsLinkHelp: boolean;
  contact: {
    name: string;
    business: string;
    phone: string;
    address: string;
    city: string;
    postal: string;
    notes: string;
  };
  payment: PaymentId | "";
  designUrl: string;
};

/** Readable multi-line order for WhatsApp/email. Empty optional fields are left out. */
export function buildOrderMessage(o: Order, lang: Lang): string {
  const m = dictionary[lang].message;
  const format = formatBySlug(o.format);
  const swatch = swatches.find((s) => s.hex.toUpperCase() === o.color.toUpperCase());
  const c = o.contact;
  const line = (label: string, value: string | number | undefined) =>
    value === undefined || value === "" ? null : `${label}: ${value}`;

  return [
    m.greeting,
    "",
    line(m.ref, o.ref),
    line(m.format, format?.name[lang] ?? o.format),
    line(m.qty, o.quantity),
    line(m.finish, finishById(o.finish)?.name[lang]),
    line(m.color, swatch ? `${o.color} (${swatch.name[lang]})` : o.color),
    line(m.name, o.name.trim()),
    format?.compact ? null : line(m.cta, o.cta.trim()),
    line(m.logo, o.hasLogo ? m.logoYes : m.logoNo),
    line(m.link, o.needsLinkHelp ? m.linkHelp : o.reviewLink.trim()),
    "",
    `*${m.contact}*`,
    line(m.contactName, c.name.trim()),
    line(m.business, c.business.trim()),
    line(m.phone, c.phone.trim()),
    line(m.address, [c.address.trim(), [c.city.trim(), c.postal.trim()].filter(Boolean).join(" ")].filter(Boolean).join(", ")),
    line(m.notes, c.notes.trim()),
    "",
    line(m.payment, o.payment ? dictionary[lang].checkout.payment.options[o.payment].title : ""),
    line(m.design, o.designUrl),
    "",
    m.closing,
  ]
    .filter((l): l is string => l !== null)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

export const emailSubject = (ref: string, lang: Lang) => dictionary[lang].message.emailSubject.replace("{ref}", ref);

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I

/** Client-side order reference: TU-YYMMDD-XXXX. */
export function orderRef(date = new Date(), random = Math.random) {
  const p = (n: number) => String(n).padStart(2, "0");
  const ymd = `${p(date.getFullYear() % 100)}${p(date.getMonth() + 1)}${p(date.getDate())}`;
  const tail = Array.from({ length: 4 }, () => REF_ALPHABET[Math.floor(random() * REF_ALPHABET.length)]).join("");
  return `TU-${ymd}-${tail}`;
}
