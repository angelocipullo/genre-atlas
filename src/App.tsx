import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import GraphCanvas from "./components/GraphCanvas";
import { useLanguage } from "./i18n/LanguageContext";
import "./App.css";

export default function App() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const handleSelect = useCallback(
    (slug: string | null) => {
      if (slug) navigate(`/${lang}/genre/${slug}`);
    },
    [navigate, lang]
  );

  return (
    <div className="app">
      <Sidebar selectedSlug={null} onSelect={handleSelect} />
      <main className="app__canvas">
        <GraphCanvas selectedSlug={null} onSelect={handleSelect} />
        <Legend />
      </main>
    </div>
  );
}

function Legend() {
  const { t } = useLanguage();
  return (
    <div className="legend">
      <div className="legend__group">
        <span className="legend__line legend__line--solid" />
        {t("legend.subgenre")}
      </div>
      <div className="legend__group">
        <span className="legend__line legend__line--dashed" />
        {t("legend.influence")}
      </div>
    </div>
  );
}
