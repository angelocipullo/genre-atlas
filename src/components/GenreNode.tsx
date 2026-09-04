"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import type { GenreNodeData } from "../lib/layout";
import { useLanguage } from "../i18n/LanguageContext";
import { cn } from "../lib/cn";

interface Props {
  data: GenreNodeData;
  selected: boolean;
}

function GenreNodeImpl({ data, selected }: Props) {
  const { data: genreData } = useLanguage();
  const { genre, familyRootSlug } = data;
  const color = genreData.colorForFamily(familyRootSlug);
  const dimmed = data.__dimmed as boolean | undefined;

  return (
    <div
      className={cn(
        "w-[188px] min-h-[64px] flex items-center gap-2 px-3 py-2",
        "bg-surface border-[1.5px] rounded-[10px] cursor-pointer",
        "transition-[opacity,box-shadow] duration-150",
        genre.isMacro && "bg-surface-2 !border-2",
        selected && "shadow-[0_0_0_2px_#eceef1,0_0_18px_rgba(255,255,255,0.12)]",
        dimmed && "opacity-20"
      )}
      style={{ borderColor: color }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[13px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
          {genre.name}
        </span>
        <span className="text-[11px] text-ink-faint">
          {genre.yearStart ?? "?"}
          {genre.originCountry ? ` · ${genre.originCountry}` : ""}
        </span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(GenreNodeImpl);
