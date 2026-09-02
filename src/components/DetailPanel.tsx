import { genreBySlug, childrenOf, relationLabels, familyRoot } from "../lib/genreGraph";
import { colorForFamily } from "../lib/colors";
import type { RelationKind } from "../types";

interface Props {
  slug: string;
  onSelect: (slug: string) => void;
  onClose: () => void;
}

function yearLabel(genre: { yearStart: number | null; yearEnd: number | null; yearPrecision: string }): string {
  if (genre.yearStart == null) return "anno sconosciuto";
  const prefix = genre.yearPrecision === "circa" ? "c. " : "";
  const range = genre.yearEnd ? `${genre.yearStart}–${genre.yearEnd}` : `${genre.yearStart}`;
  return `${prefix}${range}`;
}

const KIND_LABEL_SHORT: Record<RelationKind, string> = {
  subgenre_of: "sottogenere",
  derived_from: "derivato",
  influenced_by: "influenza",
};

export default function DetailPanel({ slug, onSelect, onClose }: Props) {
  const genre = genreBySlug.get(slug);
  if (!genre) return null;

  const color = colorForFamily(familyRoot(genre).slug);
  const children = childrenOf.get(slug) ?? [];
  const childrenByKind: Record<RelationKind, typeof children> = {
    subgenre_of: children.filter((c) => c.kind === "subgenre_of"),
    derived_from: children.filter((c) => c.kind === "derived_from"),
    influenced_by: children.filter((c) => c.kind === "influenced_by"),
  };

  return (
    <aside className="detail" style={{ borderTopColor: color }}>
      <button className="detail__close" onClick={onClose} aria-label="Chiudi">
        ×
      </button>

      <div className="detail__header">
        {genre.isMacro && <span className="detail__macro-badge">macro-genere</span>}
        <h2 className="detail__title">{genre.name}</h2>
        {genre.aka.length > 0 && (
          <p className="detail__aka">aka {genre.aka.join(", ")}</p>
        )}
      </div>

      <dl className="detail__facts">
        <div>
          <dt>Periodo</dt>
          <dd>{yearLabel(genre)}</dd>
        </div>
        <div>
          <dt>BPM</dt>
          <dd>{genre.bpmMin && genre.bpmMax ? `${genre.bpmMin}–${genre.bpmMax}` : "n/d"}</dd>
        </div>
        <div>
          <dt>Origine</dt>
          <dd>
            {[genre.originCity, genre.originCountry].filter(Boolean).join(", ") || "n/d"}
          </dd>
        </div>
      </dl>

      <p className="detail__summary">{genre.summary}</p>
      <p className="detail__description">{genre.description}</p>
      {genre.history && <p className="detail__description">{genre.history}</p>}

      {genre.parents.length > 0 && (
        <section className="detail__section">
          <h3>Genealogia</h3>
          <ul className="detail__relations">
            {genre.parents.map((p) => {
              const parent = genreBySlug.get(p.slug);
              if (!parent) return null;
              return (
                <li key={p.slug}>
                  <button className="detail__relation-btn" onClick={() => onSelect(p.slug)}>
                    {parent.name}
                  </button>
                  <span className="detail__relation-kind">
                    {relationLabels[p.kind]} · peso {p.weight.toFixed(1)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {children.length > 0 && (
        <section className="detail__section">
          <h3>Ha generato / influenzato</h3>
          {(["subgenre_of", "derived_from", "influenced_by"] as RelationKind[]).map((kind) =>
            childrenByKind[kind].length === 0 ? null : (
              <div key={kind} className="detail__relation-group">
                <span className="detail__relation-group-label">{KIND_LABEL_SHORT[kind]}</span>
                <div className="detail__chip-row">
                  {childrenByKind[kind].map((c) => {
                    const child = genreBySlug.get(c.slug);
                    if (!child) return null;
                    return (
                      <button key={c.slug} className="detail__chip" onClick={() => onSelect(c.slug)}>
                        {child.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </section>
      )}

      {genre.tracks.length > 0 && (
        <section className="detail__section">
          <h3>Brani di riferimento</h3>
          <ul className="detail__tracks">
            {genre.tracks.map((t) => (
              <li key={t.slug}>
                <span className="detail__track-slug">{t.slug.replace(/-/g, " ")}</span>
                <span className="detail__track-role">{t.role}</span>
                {t.note && <p className="detail__track-note">{t.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  );
}
