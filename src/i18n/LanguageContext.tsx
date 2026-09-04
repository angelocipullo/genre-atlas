"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import type { Locale } from "./locales";
import { STRINGS, type StringKey } from "./strings";
import { getGenreData, type GenreData } from "../lib/genreGraph";

interface LanguageContextValue {
  lang: Locale;
  t: (key: StringKey) => string;
  data: GenreData;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface Props {
  lang: Locale;
  children: ReactNode;
}

export function LanguageProvider({ lang, children }: Props) {
  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      t: (key) => STRINGS[lang][key],
      data: getGenreData(lang),
    }),
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
