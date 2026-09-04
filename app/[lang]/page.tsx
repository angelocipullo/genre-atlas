"use client";

import { useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/src/components/Sidebar";
import GraphCanvas from "@/src/components/GraphCanvas";
import { useLanguage } from "@/src/i18n/LanguageContext";

export default function MapPage() {
  const router = useRouter();
  const { lang } = useParams<{ lang: string }>();

  const handleSelect = useCallback(
    (slug: string | null) => {
      if (slug) router.push(`/${lang}/genre/${slug}`);
    },
    [router, lang]
  );

  return (
    <div className="h-screen grid grid-cols-[300px_1fr] bg-canvas max-[900px]:grid-cols-1 max-[900px]:grid-rows-[auto_1fr]">
      <Sidebar selectedSlug={null} onSelect={handleSelect} />
      <main className="relative min-h-0 bg-canvas">
        <GraphCanvas selectedSlug={null} onSelect={handleSelect} />
        <Legend />
      </main>
    </div>
  );
}

function Legend() {
  const { t } = useLanguage();
  return (
    <div className="absolute top-3.5 left-3.5 z-[5] flex gap-4 bg-canvas/85 border border-wire rounded-lg px-3 py-2 text-[11px] text-ink-muted backdrop-blur-sm">
      <div className="flex items-center gap-1.5">
        <span className="w-5 h-0 border-t-2 border-ink-faint inline-block" />
        {t("legend.subgenre")}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-5 h-0 border-t-2 border-dashed border-ink-faint inline-block" />
        {t("legend.influence")}
      </div>
    </div>
  );
}
