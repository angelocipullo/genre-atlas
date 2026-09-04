"use client";

import { useMemo, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Edge,
  type Node,
  type NodeMouseHandler,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { buildGraph, type GenreNodeData, type GenreEdgeData } from "../lib/layout";
import { useLanguage } from "../i18n/LanguageContext";
import GenreNode from "./GenreNode";

const nodeTypes = { genre: GenreNode };

const EDGE_STROKE = "#8892a0";

const KIND_DASH: Record<GenreEdgeData["kind"], string | undefined> = {
  subgenre_of: undefined,
  derived_from: "1 0",
  influenced_by: "4 4",
};

interface Props {
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
}

export default function GraphCanvas({ selectedSlug, onSelect }: Props) {
  const { data } = useLanguage();
  const graph = useMemo(() => buildGraph(data), [data]);
  const highlighted = useMemo(
    () => (selectedSlug ? data.lineageOf(selectedSlug) : null),
    [selectedSlug, data]
  );

  const nodes: Node<GenreNodeData>[] = useMemo(
    () =>
      graph.nodes.map((n) => ({
        ...n,
        selected: n.id === selectedSlug,
        data: {
          ...n.data,
          __dimmed: highlighted ? !highlighted.has(n.id) : false,
        },
      })),
    [graph.nodes, selectedSlug, highlighted]
  );

  const edges: Edge<GenreEdgeData>[] = useMemo(
    () =>
      graph.edges.map((e) => {
        const kind = e.data!.kind;
        const weight = e.data!.weight;
        const active =
          highlighted && highlighted.has(e.source) && highlighted.has(e.target);
        const dimmed = highlighted ? !active : false;
        return {
          ...e,
          animated: false,
          style: {
            stroke: EDGE_STROKE,
            strokeWidth: 1 + weight * 2.5,
            strokeDasharray: KIND_DASH[kind],
            opacity: dimmed ? 0.08 : 0.55 + weight * 0.35,
          },
        };
      }),
    [graph.edges, highlighted]
  );

  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_, node) => {
      onSelect(node.id === selectedSlug ? null : node.id);
    },
    [onSelect, selectedSlug]
  );

  const handlePaneClick = useCallback(() => onSelect(null), [onSelect]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={handleNodeClick}
      onPaneClick={handlePaneClick}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      minZoom={0.15}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#1c2028" />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        nodeColor={(n) => data.colorForFamily((n.data as GenreNodeData).familyRootSlug)}
        maskColor="rgba(10,12,16,0.75)"
      />
    </ReactFlow>
  );
}
