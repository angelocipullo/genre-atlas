import dagre from "dagre";
import type { Edge, Node } from "reactflow";
import { Position } from "reactflow";
import { genres, genreBySlug, familyRoot } from "./genreGraph";
import type { Genre, RelationKind } from "../types";

export const NODE_WIDTH = 188;
export const NODE_HEIGHT = 64;

export interface GenreNodeData {
  genre: Genre;
  familyRootSlug: string;
  __dimmed?: boolean;
}

export interface GenreEdgeData {
  kind: RelationKind;
  weight: number;
}

export function buildGraph(): { nodes: Node<GenreNodeData>[]; edges: Edge<GenreEdgeData>[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 28, ranksep: 130, marginx: 20, marginy: 20 });
  g.setDefaultEdgeLabel(() => ({}));

  for (const genre of genres) {
    g.setNode(genre.slug, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }

  const edges: Edge<GenreEdgeData>[] = [];
  for (const genre of genres) {
    for (const parent of genre.parents) {
      if (!genreBySlug.has(parent.slug)) continue;
      g.setEdge(parent.slug, genre.slug);
      edges.push({
        id: `${parent.slug}->${genre.slug}`,
        source: parent.slug,
        target: genre.slug,
        data: { kind: parent.kind, weight: parent.weight },
      });
    }
  }

  dagre.layout(g);

  const nodes: Node<GenreNodeData>[] = genres.map((genre) => {
    const pos = g.node(genre.slug);
    return {
      id: genre.slug,
      type: "genre",
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: { genre, familyRootSlug: familyRoot(genre).slug },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });

  return { nodes, edges };
}
