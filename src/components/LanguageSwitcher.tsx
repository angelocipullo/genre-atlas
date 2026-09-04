"use client";

import { usePathname, useRouter } from "next/navigation";
import { LOCALES, LANG_STORAGE_KEY, type Locale } from "../i18n/locales";
import { useLanguage } from "../i18n/LanguageContext";
import { cn } from "../lib/cn";

export default function LanguageSwitcher() {
  const { lang } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === lang) return;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // ignore storage failures
    }
    const rest = pathname.split("/").slice(2).join("/");
    router.push(`/${next}${rest ? `/${rest}` : ""}`);
  }

  return (
    <div className="inline-flex border border-wire rounded-lg overflow-hidden" role="group" aria-label="Language">
      {LOCALES.map((l, i) => (
        <button
          key={l}
          type="button"
          className={cn(
            "bg-transparent text-[11px] font-bold tracking-[0.03em] px-2 py-1 cursor-pointer transition-colors",
            i > 0 && "border-l border-wire",
            l === lang ? "bg-surface-2 text-accent" : "text-ink-muted hover:bg-surface-2 hover:text-ink"
          )}
          onClick={() => switchTo(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
