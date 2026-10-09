// sessionStorage wrappers. Storage can be missing or full (private mode, quota): never throw.
// The logo is also kept in memory, so a quota failure still works within the same page session.

let memoryLogo: string | null = null;
const LOGO_KEY = "tu-logo";

export function loadLogo(): string | null {
  try {
    return sessionStorage.getItem(LOGO_KEY) ?? memoryLogo;
  } catch {
    return memoryLogo;
  }
}

export function saveLogo(dataUrl: string | null) {
  memoryLogo = dataUrl;
  try {
    if (dataUrl) sessionStorage.setItem(LOGO_KEY, dataUrl);
    else sessionStorage.removeItem(LOGO_KEY);
  } catch {
    /* quota or disabled: memory copy only */
  }
}

export function loadJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function saveJson(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function removeKey(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
