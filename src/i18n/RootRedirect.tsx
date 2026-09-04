import { Navigate, useParams } from "react-router-dom";
import { detectPreferredLocale } from "./locales";

/** Redirects "/" (and any unmatched path) to the preferred-language home. */
export function RootRedirect() {
  return <Navigate to={`/${detectPreferredLocale()}`} replace />;
}

/** Redirects the pre-i18n "/genre/:slug" URLs to their localized equivalent. */
export function LegacyGenreRedirect() {
  const { slug } = useParams();
  return <Navigate to={`/${detectPreferredLocale()}/genre/${slug}`} replace />;
}
