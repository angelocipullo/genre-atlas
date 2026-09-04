import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import LanguageSwitcher from "../components/LanguageSwitcher";
import StepSequencer from "../components/StepSequencer";
import type { RelationKind } from "../types";
import "./GenrePage.css";

interface YearInfo {
  yearStart: number | null;
  yearEnd: number | null;
  yearPrecision: string;
}

export default function GenrePage() {
  const { slug, lang } = useParams();
  const navigate = useNavigate();
  const { t, data } = useLanguage();
  const { genreBySlug, childrenOf, familyRoot, relationLabels, colorForFamily } = data;
  const genre = slug ? genreBySlug.get(slug) : undefined;

  function yearLabel(g: YearInfo): string {
    if (g.yearStart == null) return t("genre.unknownYear");
    const prefix = g.yearPrecision === "circa" ? t("genre.circaPrefix") : "";
    const range = g.yearEnd ? `${g.yearStart}–${g.yearEnd}` : `${g.yearStart}`;
    return `${prefix}${range}`;
  }

  const KIND_LABEL_SHORT: Record<RelationKind, string> = {
    subgenre_of: t("kind.subgenre_of.short"),
    derived_from: t("kind.derived_from.short"),
    influenced_by: t("kind.influenced_by.short"),
  };

  if (!genre) {
    return (
      <div className="genre-page genre-page--empty">
        <p>{t("genre.notFound")}</p>
        <Link className="genre-page__home-link" to={`/${lang}`}>
          {t("genre.backToMap")}
        </Link>
      </div>
    );
  }

  const color = colorForFamily(familyRoot(genre).slug);
  const children = childrenOf.get(genre.slug) ?? [];
  const childrenByKind: Record<RelationKind, typeof children> = {
    subgenre_of: children.filter((c) => c.kind === "subgenre_of"),
    derived_from: children.filter((c) => c.kind === "derived_from"),
    influenced_by: children.filter((c) => c.kind === "influenced_by"),
  };

  return (
    <div className="genre-page">
      <header className="genre-page__topbar">
        <button className="genre-page__back" onClick={() => navigate(-1)}>
          {t("genre.back")}
        </button>
        <div className="genre-page__topbar-right">
          <Link className="genre-page__home-link" to={`/${lang}`}>
            {t("genre.mapHome")}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="genre-page__content" style={{ borderTopColor: color }}>
        <div className="genre-page__header">
          {genre.isMacro && <span className="detail__macro-badge">{t("genre.macroBadge")}</span>}
          <h1 className="genre-page__title">{genre.name}</h1>
          {genre.aka.length > 0 && <p className="detail__aka">aka {genre.aka.join(", ")}</p>}
        </div>

        <dl className="detail__facts">
          <div>
            <dt>{t("genre.period")}</dt>
            <dd>{yearLabel(genre)}</dd>
          </div>
          <div>
            <dt>{t("genre.bpm")}</dt>
            <dd>{genre.bpmMin && genre.bpmMax ? `${genre.bpmMin}–${genre.bpmMax}` : t("genre.na")}</dd>
          </div>
          <div>
            <dt>{t("genre.origin")}</dt>
            <dd>{[genre.originCity, genre.originCountry].filter(Boolean).join(", ") || t("genre.na")}</dd>
          </div>
        </dl>

        <p className="detail__summary">{genre.summary}</p>
        <p className="detail__description">{genre.description}</p>
        {genre.history && <p className="detail__description">{genre.history}</p>}

        {genre.rhythm && (
          <section className="detail__section">
            <h3>{t("genre.rhythm")}</h3>
            <StepSequencer
              key={genre.slug}
              rhythm={genre.rhythm}
              bpmMin={genre.bpmMin}
              bpmMax={genre.bpmMax}
            />
          </section>
        )}

        {genre.parents.length > 0 && (
          <section className="detail__section">
            <h3>{t("genre.genealogy")}</h3>
            <ul className="detail__relations">
              {genre.parents.map((p) => {
                const parent = genreBySlug.get(p.slug);
                if (!parent) return null;
                return (
                  <li key={p.slug}>
                    <Link className="detail__relation-btn" to={`/${lang}/genre/${p.slug}`}>
                      {parent.name}
                    </Link>
                    <span className="detail__relation-kind">
                      {relationLabels[p.kind]} · {t("genre.weight")} {p.weight.toFixed(1)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {children.length > 0 && (
          <section className="detail__section">
            <h3>{t("genre.generatedInfluenced")}</h3>
            {(["subgenre_of", "derived_from", "influenced_by"] as RelationKind[]).map((kind) =>
              childrenByKind[kind].length === 0 ? null : (
                <div key={kind} className="detail__relation-group">
                  <span className="detail__relation-group-label">{KIND_LABEL_SHORT[kind]}</span>
                  <div className="detail__chip-row">
                    {childrenByKind[kind].map((c) => {
                      const child = genreBySlug.get(c.slug);
                      if (!child) return null;
                      return (
                        <Link key={c.slug} className="detail__chip" to={`/${lang}/genre/${c.slug}`}>
                          {child.name}
                        </Link>
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
            <h3>{t("genre.referenceTracks")}</h3>
            <ul className="detail__tracks">
              {genre.tracks.map((track) => (
                <li key={track.slug}>
                  <span className="detail__track-slug">{track.slug.replace(/-/g, " ")}</span>
                  <span className="detail__track-role">{track.role}</span>
                  {track.note && <p className="detail__track-note">{track.note}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
