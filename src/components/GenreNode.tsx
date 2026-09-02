import { memo } from "react";
import { Handle, Position } from "reactflow";
import type { GenreNodeData } from "../lib/layout";
import { colorForFamily } from "../lib/colors";

interface Props {
  data: GenreNodeData;
  selected: boolean;
}

function GenreNodeImpl({ data, selected }: Props) {
  const { genre, familyRootSlug } = data;
  const color = colorForFamily(familyRootSlug);
  const dimmed = data.__dimmed as boolean | undefined;

  return (
    <div
      className={`genre-node${genre.isMacro ? " genre-node--macro" : ""}${selected ? " genre-node--selected" : ""}${dimmed ? " genre-node--dimmed" : ""}`}
      style={{ borderColor: color }}
    >
      <Handle type="target" position={Position.Left} className="genre-node__handle" />
      <div className="genre-node__dot" style={{ background: color }} />
      <div className="genre-node__body">
        <span className="genre-node__name">{genre.name}</span>
        <span className="genre-node__meta">
          {genre.yearStart ?? "?"}
          {genre.originCountry ? ` · ${genre.originCountry}` : ""}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="genre-node__handle" />
    </div>
  );
}

export default memo(GenreNodeImpl);
