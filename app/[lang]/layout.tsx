import { LanguageProvider } from "@/src/i18n/LanguageContext";
import { isLocale, DEFAULT_LOCALE } from "@/src/i18n/locales";
import { STRINGS } from "@/src/i18n/strings";
import type { Locale } from "@/src/i18n/locales";

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const safeLang: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  return { title: STRINGS[safeLang]["meta.title"] };
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  const safeLang: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  return <LanguageProvider lang={safeLang}>{children}</LanguageProvider>;
}
