import { useMemo, useState } from "react";
import { families, countries } from "../lib/genreGraph";
import { colorForFamily } from "../lib/colors";
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
  }, [query, country, macroOnly]);

  function toggleFamily(rootSlug: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(rootSlug)) next.delete(rootSlug);
      else next.add(rootSlug);
      return next;
    });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">Genre Atlas</h1>
        <p className="sidebar__subtitle">Enciclopedia dei generi elettronici e delle loro influenze</p>
      </div>

      <div className="sidebar__filters">
        <input
          className="sidebar__search"
          type="search"
          placeholder="Cerca genere, alias, città…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="sidebar__filter-row">
          <select
            className="sidebar__select"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">Tutti i paesi</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="sidebar__checkbox">
            <input
              type="checkbox"
              checked={macroOnly}
              onChange={(e) => setMacroOnly(e.target.checked)}
            />
            Solo macro-generi
          </label>
        </div>
      </div>

      <nav className="sidebar__list">
        {visibleFamilies.length === 0 && (
          <p className="sidebar__empty">Nessun genere corrisponde ai filtri.</p>
        )}
        {visibleFamilies.map((f) => {
          const color = colorForFamily(f.root.slug);
          const isCollapsed = collapsed.has(f.root.slug);
          return (
            <div key={f.root.slug} className="sidebar__family">
              <button
                className="sidebar__family-header"
                onClick={() => toggleFamily(f.root.slug)}
              >
                <span className="sidebar__family-dot" style={{ background: color }} />
                <span className="sidebar__family-name">{f.root.name}</span>
                <span className="sidebar__family-count">{f.members.length}</span>
                <span className={`sidebar__chevron${isCollapsed ? " sidebar__chevron--collapsed" : ""}`}>
                  ▾
                </span>
              </button>
              {!isCollapsed && (
                <ul className="sidebar__genres">
                  {f.members.map((g) => (
                    <li key={g.slug}>
                      <button
                        className={`sidebar__genre${g.slug === selectedSlug ? " sidebar__genre--active" : ""}`}
                        onClick={() => onSelect(g.slug === selectedSlug ? null : g.slug)}
                      >
                        <span className="sidebar__genre-name">
                          {g.name}
                          {g.isMacro && <span className="sidebar__macro-badge">macro</span>}
                        </span>
                        <span className="sidebar__genre-year">{g.yearStart ?? "?"}</span>
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
