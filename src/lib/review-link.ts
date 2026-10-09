// Soft validation for Google review links. "other" is a warning, never a blocker.

export type LinkCheck = "empty" | "invalid" | "google" | "other";

/** Adds https:// when the user pasted a bare domain. Returns null when it can't be a web URL. */
export function normalizeLink(raw: string): string | null {
  const s = raw.trim();
  if (!s || /\s/.test(s)) return null;
  try {
    const u = new URL(/^[a-z][a-z\d+.-]*:/i.test(s) ? s : `https://${s}`);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.href;
  } catch {
    return null;
  }
}

export function checkReviewLink(raw: string): LinkCheck {
  if (!raw.trim()) return "empty";
  const href = normalizeLink(raw);
  if (!href) return "invalid";
  const u = new URL(href);
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  const path = u.pathname;

  const google =
    (host === "g.page" && /^\/r\/[^/]+\/review\/?$/i.test(path)) ||
    (host === "search.google.com" && path.startsWith("/local/writereview") && u.searchParams.has("placeid")) ||
    (host === "maps.app.goo.gl" && path.length > 1) ||
    (/^google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host) && path.startsWith("/maps"));

  return google ? "google" : "other";
}
