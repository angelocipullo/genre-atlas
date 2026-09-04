export const LOCALES = ["it", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "it";

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export const LANG_STORAGE_KEY = "genre-atlas:lang";

export function detectPreferredLocale(): Locale {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (isLocale(saved ?? undefined)) return saved as Locale;
  } catch {
    // localStorage unavailable (private mode, etc.) — fall through to navigator detection
  }
  const nav = typeof navigator !== "undefined" ? navigator.language?.toLowerCase() ?? "" : "";
  if (nav.startsWith("en")) return "en";
  return DEFAULT_LOCALE;
}
