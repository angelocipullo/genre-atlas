import { families } from "./genreGraph";

// Curated palette, one color per family, assigned in the order families()
// returns them (sorted by the family root's yearStart). Extra families
// beyond the palette length wrap around.
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

export const familyColor: Map<string, string> = new Map(
  families.map((f, i) => [f.root.slug, PALETTE[i % PALETTE.length]])
);

export function colorForFamily(rootSlug: string): string {
  return familyColor.get(rootSlug) ?? "#8892a0";
}
