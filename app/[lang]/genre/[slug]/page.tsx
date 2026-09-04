"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/src/i18n/LanguageContext";
import LanguageSwitcher from "@/src/components/LanguageSwitcher";
import StepSequencer from "@/src/components/StepSequencer";
import { cn } from "@/src/lib/cn";
import type { RelationKind } from "@/src/types";

interface YearInfo {
  yearStart: number | null;
  yearEnd: number | null;
  yearPrecision: string;
}

function yearLabel(g: YearInfo, unknownYear: string, circaPrefix: string): string {
  if (g.yearStart == null) return unknownYear;
  const prefix = g.yearPrecision === "circa" ? circaPrefix : "";
  const range = g.yearEnd ? `${g.yearStart}–${g.yearEnd}` : `${g.yearStart}`;
  return `${prefix}${range}`;
}

type TabId = "overview" | "rhythm" | "genealogy" | "tracks";

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-ink-faint flex-shrink-0">{icon}</span>
      <div>
        <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-ink-faint leading-none mb-[5px]">
          {label}
        </div>
        <div className="text-[15px] font-bold leading-none">{value}</div>
      </div>
    </div>
  );
}

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-surface rounded-2xl border border-wire p-5", className)}>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-faint mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function GenrePage() {
  const { slug, lang } = useParams<{ slug: string; lang: string }>();
  const router = useRouter();
  const { t, data } = useLanguage();
  const { genreBySlug, childrenOf, familyRoot, relationLabels, colorForFamily } = data;
  const genre = slug ? genreBySlug.get(slug) : undefined;
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const KIND_LABEL_SHORT: Record<RelationKind, string> = {
    subgenre_of: t("kind.subgenre_of.short"),
    derived_from: t("kind.derived_from.short"),
    influenced_by: t("kind.influenced_by.short"),
  };

  if (!genre) {
    return (
      <div className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-3 text-ink-muted">
        <p>{t("genre.notFound")}</p>
        <Link className="text-[13px] text-accent no-underline hover:underline" href={`/${lang}`}>
          {t("genre.backToMap")}
        </Link>
      </div>
    );
  }

  const color = colorForFamily(familyRoot(genre).slug);
  const genreChildren = childrenOf.get(genre.slug) ?? [];
  const childrenByKind: Record<RelationKind, typeof genreChildren> = {
    subgenre_of: genreChildren.filter((c) => c.kind === "subgenre_of"),
    derived_from: genreChildren.filter((c) => c.kind === "derived_from"),
    influenced_by: genreChildren.filter((c) => c.kind === "influenced_by"),
  };

  const bpmDisplay =
    genre.bpmMin && genre.bpmMax
      ? `${genre.bpmMin}–${genre.bpmMax}`
      : genre.bpmMin?.toString() ?? genre.bpmMax?.toString() ?? t("genre.na");

  const originDisplay =
    [genre.originCity, genre.originCountry].filter(Boolean).join(", ") || t("genre.na");
  const periodDisplay = yearLabel(genre, t("genre.unknownYear"), t("genre.circaPrefix"));

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: lang === "it" ? "PANORAMICA" : "OVERVIEW" },
    ...(genre.rhythm ? [{ id: "rhythm" as TabId, label: lang === "it" ? "RITMICA" : "RHYTHM" }] : []),
    ...(genre.parents.length > 0 || genreChildren.length > 0
      ? [{ id: "genealogy" as TabId, label: lang === "it" ? "GENEALOGIA" : "GENEALOGY" }]
      : []),
    ...(genre.tracks.length > 0
      ? [{ id: "tracks" as TabId, label: lang === "it" ? "BRANI" : "TRACKS" }]
      : []),
  ];

  // Build grid column template for overview cards
  const overviewCols = [
    genre.rhythm ? "1fr" : null,
    genre.parents.length > 0 ? "260px" : null,
    genreChildren.length > 0 ? "260px" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col">
      {/* ── HERO ── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: "56vh" }}>
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div
            className="absolute right-0 top-0 w-[65%] h-full"
            style={{
              background: `radial-gradient(ellipse at 78% 28%, ${color}20 0%, transparent 62%)`,
            }}
          />
          <div
            className="absolute right-[5%] top-[8%] w-[380px] h-[380px] rounded-full"
            style={{ border: `1px solid ${color}22` }}
          />
          <div
            className="absolute right-[13%] top-[2%] w-[260px] h-[260px] rounded-full"
            style={{ border: `1px solid ${color}18` }}
          />
          <div
            className="absolute right-[-3%] top-[-10%] w-[530px] h-[530px] rounded-full"
            style={{ border: `1px solid ${color}10` }}
          />
          <div
            className="absolute right-[19%] top-[24%] w-[110px] h-[110px] rounded-full"
            style={{ background: `radial-gradient(circle, ${color}14 0%, transparent 70%)` }}
          />
        </div>

        {/* Top color strip */}
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: color }} />

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-8 pt-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-faint hover:text-ink-muted transition-colors bg-transparent border-0 cursor-pointer p-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 2L4 7L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {lang === "it" ? "GENERE" : "GENRES"}
          </button>
          <div className="flex items-center gap-4">
            <Link
              href={`/${lang}`}
              className="text-[11px] text-ink-faint hover:text-ink-muted no-underline uppercase tracking-[0.08em] transition-colors"
            >
              {t("genre.mapHome")}
            </Link>
            <LanguageSwitcher />
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 px-8 pt-8 pb-14 max-w-[860px]">
          {genre.isMacro && (
            <span
              className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.12em] mb-4 px-2.5 py-1 rounded border"
              style={{ color, borderColor: color }}
            >
              {t("genre.macroBadge")}
            </span>
          )}

          <h1
            className="font-black leading-[0.88] tracking-[-0.03em] text-white mb-5"
            style={{ fontSize: "clamp(52px, 8.5vw, 90px)" }}
          >
            {genre.name}
          </h1>

          {genre.aka.length > 0 && (
            <p className="text-[12px] text-ink-faint italic mb-4">aka {genre.aka.join(", ")}</p>
          )}

          <p className="max-w-[480px] text-[14px] leading-[1.65] text-ink-muted mb-8">
            {genre.summary}
          </p>

          {/* Stats row */}
          <div className="flex items-center flex-wrap gap-y-4 mb-8">
            <Stat
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                  <path
                    d="M8 4.5V8L10.5 10"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              }
              label={t("genre.period")}
              value={periodDisplay}
            />
            <div className="w-px h-9 bg-wire mx-6 max-[440px]:hidden" />
            <Stat
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M1.5 11L5 6.5L8 9.5L11 4L14.5 8"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              label={t("genre.bpm")}
              value={bpmDisplay}
            />
            <div className="w-px h-9 bg-wire mx-6 max-[440px]:hidden" />
            <Stat
              icon={
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                  <ellipse cx="8" cy="8" rx="2.8" ry="6.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M1.5 8H14.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              }
              label={t("genre.origin")}
              value={originDisplay}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2.5 bg-white text-black font-bold text-[12px] tracking-[0.04em] uppercase px-6 py-3 rounded-full hover:bg-ink transition-colors cursor-default">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 1.5L10.5 6L2 10.5V1.5Z" />
              </svg>
              {lang === "it" ? "Ascolta ora" : "Listen now"}
            </button>
            <button className="flex items-center gap-2.5 border border-wire text-ink-muted font-semibold text-[12px] tracking-[0.04em] uppercase px-6 py-3 rounded-full hover:border-ink-muted hover:text-ink transition-colors cursor-default">
              <svg
                width="13"
                height="12"
                viewBox="0 0 13 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M6.5 10.5C6.5 10.5 1 7 1 3.6C1 2.16 2.16 1 3.6 1C4.62 1 5.52 1.58 6.5 2.88C7.48 1.58 8.38 1 9.4 1C10.84 1 12 2.16 12 3.6C12 7 6.5 10.5 6.5 10.5Z" />
              </svg>
              {lang === "it" ? "Salva" : "Save"}
            </button>
          </div>
        </div>
      </section>

      {/* ── TAB BAR ── */}
      <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur border-b border-wire">
        <div className="flex px-8 max-w-[1200px] mx-auto overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-shrink-0 py-4 px-0 mr-7 text-[11px] font-bold uppercase tracking-[0.1em] border-b-2 -mb-px transition-colors bg-transparent border-x-0 border-t-0 cursor-pointer",
                activeTab === tab.id
                  ? "border-white text-white"
                  : "border-transparent text-ink-faint hover:text-ink-muted"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <main className="flex-1 px-8 py-8 max-w-[1200px] w-full mx-auto">
        {/* PANORAMICA */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-4">
            {(genre.description || genre.history) && (
              <div className="max-w-[680px] flex flex-col gap-3 mb-1">
                {genre.description && (
                  <p className="text-[14px] leading-[1.7] text-ink-muted">{genre.description}</p>
                )}
                {genre.history && (
                  <p className="text-[13px] leading-[1.7] text-ink-faint">{genre.history}</p>
                )}
              </div>
            )}

            {/* Cards grid */}
            {overviewCols && (
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: overviewCols }}
              >
                {genre.rhythm && (
                  <Card title={t("genre.rhythm")}>
                    <StepSequencer
                      key={genre.slug}
                      rhythm={genre.rhythm}
                      bpmMin={genre.bpmMin}
                      bpmMax={genre.bpmMax}
                    />
                  </Card>
                )}

                {genre.parents.length > 0 && (
                  <Card title={t("genre.genealogy")}>
                    <div className="flex flex-col gap-4">
                      {(["subgenre_of", "derived_from", "influenced_by"] as RelationKind[]).map(
                        (kind) => {
                          const group = genre.parents.filter((p) => p.kind === kind);
                          if (group.length === 0) return null;
                          return (
                            <div key={kind}>
                              <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-faint mb-2">
                                {KIND_LABEL_SHORT[kind]}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {group.map((p) => {
                                  const parent = genreBySlug.get(p.slug);
                                  if (!parent) return null;
                                  return (
                                    <Link
                                      key={p.slug}
                                      href={`/${lang}/genre/${p.slug}`}
                                      className="inline-block bg-surface-2 border border-wire rounded-full px-3 py-1 text-[12px] text-ink no-underline hover:border-accent hover:text-accent transition-colors"
                                    >
                                      {parent.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </Card>
                )}

                {genreChildren.length > 0 && (
                  <Card title={lang === "it" ? "INFLUENZE PRINCIPALI" : "KEY INFLUENCES"}>
                    <div className="flex flex-col gap-4">
                      {(["subgenre_of", "derived_from", "influenced_by"] as RelationKind[]).map(
                        (kind) =>
                          childrenByKind[kind].length === 0 ? null : (
                            <div key={kind}>
                              <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-faint mb-2">
                                {KIND_LABEL_SHORT[kind]}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {childrenByKind[kind].map((c) => {
                                  const child = genreBySlug.get(c.slug);
                                  if (!child) return null;
                                  return (
                                    <Link
                                      key={c.slug}
                                      href={`/${lang}/genre/${c.slug}`}
                                      className="inline-block bg-surface-2 border border-wire rounded-full px-3 py-1 text-[12px] text-ink no-underline hover:border-accent hover:text-accent transition-colors"
                                    >
                                      {child.name}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Reference tracks */}
            {genre.tracks.length > 0 && (
              <Card title={t("genre.referenceTracks")}>
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1">
                  {genre.tracks.map((track) => (
                    <div
                      key={track.slug}
                      className="snap-start flex-shrink-0 flex items-center gap-3 bg-surface-2 border border-wire rounded-xl p-3 w-[220px] hover:border-ink-faint transition-colors"
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center"
                        style={{ background: `${color}20`, border: `1px solid ${color}28` }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill={color} opacity="0.7">
                          <path d="M2.5 2L11.5 7L2.5 12V2Z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold capitalize leading-tight truncate">
                          {track.slug.replace(/-/g, " ")}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.06em] text-ink-faint mt-0.5">
                          {track.role}
                        </div>
                        {track.note && (
                          <div className="text-[11px] text-ink-muted mt-1 leading-tight line-clamp-2">
                            {track.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* RITMICA */}
        {activeTab === "rhythm" && genre.rhythm && (
          <Card title={t("genre.rhythm")} className="max-w-[720px]">
            <StepSequencer
              key={genre.slug}
              rhythm={genre.rhythm}
              bpmMin={genre.bpmMin}
              bpmMax={genre.bpmMax}
            />
          </Card>
        )}

        {/* GENEALOGIA */}
        {activeTab === "genealogy" && (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns:
                genre.parents.length > 0 && genreChildren.length > 0 ? "1fr 1fr" : "1fr",
              maxWidth: "680px",
            }}
          >
            {genre.parents.length > 0 && (
              <Card title={t("genre.genealogy")}>
                <ul className="flex flex-col gap-3">
                  {genre.parents.map((p) => {
                    const parent = genreBySlug.get(p.slug);
                    if (!parent) return null;
                    return (
                      <li key={p.slug}>
                        <Link
                          href={`/${lang}/genre/${p.slug}`}
                          className="text-accent text-[13px] font-semibold no-underline hover:underline"
                        >
                          {parent.name}
                        </Link>
                        <span className="block text-[11px] text-ink-faint mt-0.5">
                          {relationLabels[p.kind]} · {t("genre.weight")} {p.weight.toFixed(1)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
            {genreChildren.length > 0 && (
              <Card title={t("genre.generatedInfluenced")}>
                {(["subgenre_of", "derived_from", "influenced_by"] as RelationKind[]).map((kind) =>
                  childrenByKind[kind].length === 0 ? null : (
                    <div key={kind} className="mb-4 last:mb-0">
                      <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-ink-faint mb-2">
                        {KIND_LABEL_SHORT[kind]}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {childrenByKind[kind].map((c) => {
                          const child = genreBySlug.get(c.slug);
                          if (!child) return null;
                          return (
                            <Link
                              key={c.slug}
                              href={`/${lang}/genre/${c.slug}`}
                              className="inline-block bg-surface-2 border border-wire rounded-full px-3 py-1 text-[12px] text-ink no-underline hover:border-accent hover:text-accent transition-colors"
                            >
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </Card>
            )}
          </div>
        )}

        {/* BRANI */}
        {activeTab === "tracks" && genre.tracks.length > 0 && (
          <Card title={t("genre.referenceTracks")} className="max-w-[680px]">
            <ul>
              {genre.tracks.map((track) => (
                <li
                  key={track.slug}
                  className="py-3.5 border-b border-wire last:border-b-0 flex items-start gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: `${color}20`, border: `1px solid ${color}28` }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill={color} opacity="0.7">
                      <path d="M2 1.5L10.5 6L2 10.5V1.5Z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[14px] font-semibold capitalize">
                      {track.slug.replace(/-/g, " ")}
                    </span>
                    <span className="ml-2 text-[10px] uppercase tracking-[0.06em] text-ink-faint">
                      {track.role}
                    </span>
                    {track.note && (
                      <p className="mt-1 text-[12px] text-ink-muted leading-[1.5]">{track.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>
    </div>
  );
}
