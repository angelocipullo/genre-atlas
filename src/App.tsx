import { useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import GraphCanvas from "./components/GraphCanvas";
import DetailPanel from "./components/DetailPanel";
import { genreBySlug } from "./lib/genreGraph";
import "./App.css";

export default function App() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const selectedSlug = slug && genreBySlug.has(slug) ? slug : null;

  const handleSelect = useCallback(
    (next: string | null) => {
      navigate(next ? `/genere/${next}` : "/", { replace: false });
    },
    [navigate]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleSelect(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSelect]);

  return (
    <div className={`app${selectedSlug ? " app--with-detail" : ""}`}>
      <Sidebar selectedSlug={selectedSlug} onSelect={handleSelect} />
      <main className="app__canvas">
        <GraphCanvas selectedSlug={selectedSlug} onSelect={handleSelect} />
        <Legend />
      </main>
      {selectedSlug && (
        <DetailPanel slug={selectedSlug} onSelect={handleSelect} onClose={() => handleSelect(null)} />
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="legend">
      <div className="legend__group">
        <span className="legend__line legend__line--solid" />
        sottogenere / derivato
      </div>
      <div className="legend__group">
        <span className="legend__line legend__line--dashed" />
        influenzato da
      </div>
    </div>
  );
}
