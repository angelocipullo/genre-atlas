export type RelationKind = "subgenre_of" | "derived_from" | "influenced_by";

export type LocalizedString = { it: string | null; en: string | null };

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

export interface RawTrackRef {
  slug: string;
  role: string;
  note: LocalizedString | null;
}

export interface RhythmPattern {
  steps: number;
  kick?: number[];
  snare?: number[];
  hats?: number[];
  perc?: number[];
  /**
   * Some genres (e.g. drill) list a "felt" half-time BPM even though the
   * groove is actually played at double that speed. Multiplies the genre's
   * bpmMin/bpmMax before deriving step duration, without affecting the BPM
   * shown elsewhere on the page. Defaults to 1.
   */
  tempoMultiplier?: number;
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
  rhythm: RhythmPattern | null;
}

export interface GenresDataset {
  $schema?: string;
  version: string;
  license: string;
  genres: Genre[];
}

export interface RawGenre {
  slug: string;
  name: string;
  aka: string[];
  summary: LocalizedString;
  description: LocalizedString;
  history: LocalizedString | null;
  yearStart: number | null;
  yearEnd: number | null;
  yearPrecision: string;
  bpmMin: number | null;
  bpmMax: number | null;
  originCity: string | null;
  originCountry: string | null;
  isMacro: boolean;
  parents: ParentRef[];
  tracks: RawTrackRef[];
  sources: unknown[];
}

export interface RawGenresDataset {
  version: string;
  license: string;
  genres: RawGenre[];
}
