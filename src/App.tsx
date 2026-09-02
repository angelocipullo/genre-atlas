import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import GraphCanvas from "./components/GraphCanvas";
import "./App.css";

export default function App() {
  const navigate = useNavigate();

  const handleSelect = useCallback(
    (slug: string | null) => {
      if (slug) navigate(`/genre/${slug}`);
    },
    [navigate]
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
