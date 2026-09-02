export type RelationKind = "subgenre_of" | "derived_from" | "influenced_by";

export interface ParentRef {
  slug: string;
  kind: RelationKind;
  weight: number;
}

export interface TrackRef {
  slug: string;
  role: string;
  note: string | null;
}

export interface Genre {
  slug: string;
  name: string;
  aka: string[];
  summary: string;
  description: string;
  history: string | null;
  yearStart: number | null;
  yearEnd: number | null;
  yearPrecision: "exact" | "circa" | string;
  bpmMin: number | null;
  bpmMax: number | null;
  originCity: string | null;
  originCountry: string | null;
  isMacro: boolean;
  parents: ParentRef[];
  tracks: TrackRef[];
  sources: unknown[];
}

export interface GenresDataset {
  $schema?: string;
  version: string;
  license: string;
  genres: Genre[];
}
