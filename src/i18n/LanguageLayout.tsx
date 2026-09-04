import { Navigate, Outlet, useParams } from "react-router-dom";
import { DEFAULT_LOCALE, isLocale } from "./locales";
import { LanguageProvider } from "./LanguageContext";

export default function LanguageLayout() {
  const { lang } = useParams();

  if (!isLocale(lang)) {
    return <Navigate to={`/${DEFAULT_LOCALE}`} replace />;
  }

  return (
    <LanguageProvider lang={lang}>
      <Outlet />
    </LanguageProvider>
  );
}
