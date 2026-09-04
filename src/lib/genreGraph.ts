import genresRaw from "../data/genres.json";
import rhythmsRaw from "../data/rhythms.json";
import type { Genre, RawGenresDataset, ParentRef, RelationKind, RhythmPattern } from "../types";
import type { Locale } from "../i18n/locales";

const RAW = genresRaw as unknown as RawGenresDataset;

// Rhythm patterns are language-independent, so they're kept in one shared
// file (keyed by slug) instead of being duplicated per locale dataset.
const RHYTHMS: Record<string, RhythmPattern> = rhythmsRaw as Record<string, RhythmPattern>;

const RELATION_LABELS: Record<Locale, Record<RelationKind, string>> = {
  it: {
    subgenre_of: "sottogenere di",
    derived_from: "deriva da",
    influenced_by: "influenzato da",
  },
  en: {
    subgenre_of: "subgenre of",
    derived_from: "derived from",
    influenced_by: "influenced by",
  },
};

// Curated palette, one color per family, assigned in family order (sorted by
// the family root's yearStart). Extra families beyond the palette length wrap
// around.
const PALETTE = [
  "#8b7ae0", // violet
  "#e0a63a", // amber
  "#6fae5c", // green
  "#a8c24a", // yellow-green
  "#4fa3d1", // sky blue
  "#45c4b0", // teal
  "#c76b9e", // rose
  "#d1673f", // terracotta
];

export interface ChildRef {
  slug: string;
  kind: RelationKind;
  weight: number;
}

export interface Family {
  root: Genre;
  members: Genre[];
}

export interface GenreData {
  genres: Genre[];
  genreBySlug: Map<string, Genre>;
  childrenOf: Map<string, ChildRef[]>;
  families: Family[];
  countries: string[];
  relationLabels: Record<RelationKind, string>;
  primaryParent(g: Genre): ParentRef | null;
  familyRoot(g: Genre): Genre;
  familyOf(slug: string): Family | undefined;
  ancestorsOf(slug: string): Set<string>;
  descendantsOf(slug: string): Set<string>;
  lineageOf(slug: string): Set<string>;
  colorForFamily(rootSlug: string): string;
}

function buildGenreData(locale: Locale): GenreData {
  const genres: Genre[] = RAW.genres.map((g) => ({
    ...g,
    summary: g.summary[locale] ?? g.summary.it ?? "",
    description: g.description[locale] ?? g.description.it ?? "",
    history: g.history ? (g.history[locale] ?? g.history.it ?? null) : null,
    tracks: g.tracks.map((t) => ({
      ...t,
      note: t.note ? (t.note[locale] ?? t.note.it ?? null) : null,
    })),
    rhythm: RHYTHMS[g.slug] ?? null,
  }));

  const genreBySlug: Map<string, Genre> = new Map(genres.map((g) => [g.slug, g]));

  const childrenOf: Map<string, ChildRef[]> = (() => {
    const map = new Map<string, ChildRef[]>();
    for (const g of genres) {
      for (const p of g.parents) {
        const list = map.get(p.slug) ?? [];
        list.push({ slug: g.slug, kind: p.kind, weight: p.weight });
        map.set(p.slug, list);
      }
    }
    return map;
  })();

  /**
   * The parent that defines a genre's lineage/family, ignoring pure
   * "influenced_by" links (which are cross-family influence, not descent).
   * Ties broken by declaration order; among true-lineage parents the
   * highest weight wins.
   */
  function primaryParent(g: Genre): ParentRef | null {
    const lineage = g.parents.filter((p) => p.kind !== "influenced_by");
    if (lineage.length === 0) return null;
    return lineage.reduce((best, p) => (p.weight > best.weight ? p : best));
  }

  /** Walks primaryParent links up to the root ancestor of a genre's family. */
  function familyRoot(g: Genre): Genre {
    let current = g;
    const seen = new Set<string>([g.slug]);
    for (;;) {
      const p = primaryParent(current);
      if (!p) return current;
      const next = genreBySlug.get(p.slug);
      if (!next || seen.has(next.slug)) return current;
      seen.add(next.slug);
      current = next;
    }
  }

  const families: Family[] = (() => {
    const byRoot = new Map<string, Genre[]>();
    for (const g of genres) {
      const root = familyRoot(g);
      const list = byRoot.get(root.slug) ?? [];
      list.push(g);
      byRoot.set(root.slug, list);
    }
    return Array.from(byRoot.entries())
      .map(([rootSlug, members]) => ({
        root: genreBySlug.get(rootSlug)!,
        members: members.sort((a, b) => (a.yearStart ?? 9999) - (b.yearStart ?? 9999)),
      }))
      .sort((a, b) => (a.root.yearStart ?? 9999) - (b.root.yearStart ?? 9999));
  })();

  function familyOf(slug: string): Family | undefined {
    return families.find((f) => f.members.some((m) => m.slug === slug));
  }

  /** All ancestor slugs reachable by walking every declared parent (any kind). */
  function ancestorsOf(slug: string): Set<string> {
    const result = new Set<string>();
    const stack = [slug];
    while (stack.length) {
      const cur = stack.pop()!;
      const g = genreBySlug.get(cur);
      if (!g) continue;
      for (const p of g.parents) {
        if (!result.has(p.slug)) {
          result.add(p.slug);
          stack.push(p.slug);
        }
      }
    }
    return result;
  }

  /** All descendant slugs reachable by walking every reverse (child) edge. */
  function descendantsOf(slug: string): Set<string> {
    const result = new Set<string>();
    const stack = [slug];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const c of childrenOf.get(cur) ?? []) {
        if (!result.has(c.slug)) {
          result.add(c.slug);
          stack.push(c.slug);
        }
      }
    }
    return result;
  }

  function lineageOf(slug: string): Set<string> {
    const set = new Set<string>([slug]);
    for (const s of ancestorsOf(slug)) set.add(s);
    for (const s of descendantsOf(slug)) set.add(s);
    return set;
  }

  const countries: string[] = Array.from(
    new Set(genres.map((g) => g.originCountry).filter((c): c is string => !!c))
  ).sort();

  const familyColor: Map<string, string> = new Map(
    families.map((f, i) => [f.root.slug, PALETTE[i % PALETTE.length]])
  );

  function colorForFamily(rootSlug: string): string {
    return familyColor.get(rootSlug) ?? "#8892a0";
  }

  return {
    genres,
    genreBySlug,
    childrenOf,
    families,
    countries,
    relationLabels: RELATION_LABELS[locale],
    primaryParent,
    familyRoot,
    familyOf,
    ancestorsOf,
    descendantsOf,
    lineageOf,
    colorForFamily,
  };
}

const cache = new Map<Locale, GenreData>();

export function getGenreData(locale: Locale): GenreData {
  const cached = cache.get(locale);
  if (cached) return cached;
  const data = buildGenreData(locale);
  cache.set(locale, data);
  return data;
}
