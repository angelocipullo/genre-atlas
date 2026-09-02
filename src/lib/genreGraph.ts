import raw from "../data/genres.json";
import type { Genre, GenresDataset, ParentRef, RelationKind } from "../types";

const dataset = raw as unknown as GenresDataset;

export const genres: Genre[] = dataset.genres;

export const genreBySlug: Map<string, Genre> = new Map(
  genres.map((g) => [g.slug, g])
);

export interface ChildRef {
  slug: string;
  kind: RelationKind;
  weight: number;
}

/** slug -> genres that list it as a parent */
export const childrenOf: Map<string, ChildRef[]> = (() => {
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
export function primaryParent(g: Genre): ParentRef | null {
  const lineage = g.parents.filter((p) => p.kind !== "influenced_by");
  if (lineage.length === 0) return null;
  return lineage.reduce((best, p) => (p.weight > best.weight ? p : best));
}

/** Walks primaryParent links up to the root ancestor of a genre's family. */
export function familyRoot(g: Genre): Genre {
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

export interface Family {
  root: Genre;
  members: Genre[];
}

export const families: Family[] = (() => {
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

export function familyOf(slug: string): Family | undefined {
  return families.find((f) => f.members.some((m) => m.slug === slug));
}

/** All ancestor slugs reachable by walking every declared parent (any kind). */
export function ancestorsOf(slug: string): Set<string> {
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
export function descendantsOf(slug: string): Set<string> {
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

export function lineageOf(slug: string): Set<string> {
  const set = new Set<string>([slug]);
  for (const s of ancestorsOf(slug)) set.add(s);
  for (const s of descendantsOf(slug)) set.add(s);
  return set;
}

export const countries: string[] = Array.from(
  new Set(genres.map((g) => g.originCountry).filter((c): c is string => !!c))
).sort();

export const relationLabels: Record<RelationKind, string> = {
  subgenre_of: "sottogenere di",
  derived_from: "deriva da",
  influenced_by: "influenzato da",
};
