import { useLocation, useNavigate } from "react-router-dom";
import { LOCALES, LANG_STORAGE_KEY, type Locale } from "../i18n/locales";
import { useLanguage } from "../i18n/LanguageContext";
import "./LanguageSwitcher.css";

export default function LanguageSwitcher() {
  const { lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  function switchTo(next: Locale) {
    if (next === lang) return;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // ignore storage failures (private mode, etc.)
    }
    const rest = location.pathname.split("/").slice(2).join("/");
    navigate(`/${next}${rest ? `/${rest}` : ""}${location.search}`);
  }

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          className={`lang-switcher__btn${l === lang ? " lang-switcher__btn--active" : ""}`}
          onClick={() => switchTo(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
