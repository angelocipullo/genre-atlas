"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { cn } from "../lib/cn";
import type { Genre } from "../types";

interface Props {
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}

function matches(genre: Genre, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    genre.name.toLowerCase().includes(q) ||
    genre.aka.some((a) => a.toLowerCase().includes(q)) ||
    (genre.originCity ?? "").toLowerCase().includes(q)
  );
}

export default function Sidebar({ selectedSlug, onSelect }: Props) {
  const { t, data } = useLanguage();
  const { families, countries, colorForFamily } = data;
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [macroOnly, setMacroOnly] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const visibleFamilies = useMemo(() => {
    return families
      .map((f) => ({
        ...f,
        members: f.members.filter(
          (g) =>
            matches(g, query) &&
            (!country || g.originCountry === country) &&
            (!macroOnly || g.isMacro)
        ),
      }))
      .filter((f) => f.members.length > 0);
  }, [families, query, country, macroOnly]);

  function toggleFamily(rootSlug: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(rootSlug)) next.delete(rootSlug);
      else next.add(rootSlug);
      return next;
    });
  }

  const inputClass =
    "w-full bg-surface-2 border border-wire rounded-lg text-ink px-[10px] py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-accent";

  return (
    <aside className="border-r border-wire bg-surface flex flex-col min-h-0 max-[900px]:max-h-[40vh]">
      <div className="px-[18px] pt-5 pb-[14px] border-b border-wire">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-[18px] font-bold tracking-[-0.01em]">Genre Atlas</h1>
          <LanguageSwitcher />
        </div>
        <p className="mt-1 text-[12px] text-ink-muted leading-[1.4]">{t("app.subtitle")}</p>
      </div>

      <div className="px-[18px] py-[14px] border-b border-wire flex flex-col gap-[10px]">
        <input
          className={inputClass}
          type="search"
          placeholder={t("sidebar.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex items-center gap-[10px]">
          <select
            className={cn(inputClass, "flex-1")}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">{t("sidebar.allCountries")}</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 text-[12px] text-ink-muted whitespace-nowrap cursor-pointer">
            <input
              type="checkbox"
              checked={macroOnly}
              onChange={(e) => setMacroOnly(e.target.checked)}
            />
            {t("sidebar.macroOnly")}
          </label>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 pb-6">
        {visibleFamilies.length === 0 && (
          <p className="px-[18px] py-[18px] text-[12px] text-ink-faint">{t("sidebar.empty")}</p>
        )}
        {visibleFamilies.map((f) => {
          const color = colorForFamily(f.root.slug);
          const isCollapsed = collapsed.has(f.root.slug);
          return (
            <div key={f.root.slug}>
              <button
                className="w-full flex items-center gap-2 px-[18px] py-2 bg-transparent border-none cursor-pointer text-left hover:bg-surface-2 transition-colors"
                onClick={() => toggleFamily(f.root.slug)}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <span className="text-[12px] font-bold uppercase tracking-[0.05em] text-ink-muted">
                  {f.root.name}
                </span>
                <span className="text-[11px] text-ink-faint">{f.members.length}</span>
                <span
                  className={cn(
                    "ml-auto text-[10px] text-ink-faint transition-transform duration-150",
                    isCollapsed && "-rotate-90"
                  )}
                >
                  ▾
                </span>
              </button>
              {!isCollapsed && (
                <ul className="pb-1.5">
                  {f.members.map((g) => (
                    <li key={g.slug}>
                      <button
                        className={cn(
                          "w-full flex items-baseline gap-2 px-[18px] py-1.5 pl-[34px] bg-transparent border-none cursor-pointer text-left text-[13px] text-ink hover:bg-surface-2 transition-colors",
                          g.slug === selectedSlug &&
                            "bg-surface-2 shadow-[inset_2px_0_0_#4fa3d1]"
                        )}
                        onClick={() => onSelect(g.slug === selectedSlug ? null : g.slug)}
                      >
                        <span className="flex-1 flex items-center gap-1.5">
                          {g.name}
                          {g.isMacro && (
                            <span className="text-[9px] uppercase tracking-[0.04em] text-ink-faint border border-wire rounded px-1 py-px">
                              {t("sidebar.macroBadge")}
                            </span>
                          )}
                        </span>
                        <span className="text-[11px] text-ink-faint">{g.yearStart ?? "?"}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
