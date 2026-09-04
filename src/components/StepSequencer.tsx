"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import { cn } from "../lib/cn";
import type { StringKey } from "../i18n/strings";
import type { RhythmPattern } from "../types";

const TRACKS = ["kick", "snare", "hats", "perc"] as const;
type TrackName = (typeof TRACKS)[number];

const SAMPLE_URL: Record<TrackName, string> = {
  kick: "/samples/kick.wav",
  snare: "/samples/snare.wav",
  hats: "/samples/hats.wav",
  perc: "/samples/perc.wav",
};

const TRACK_LABEL_KEY: Record<TrackName, StringKey> = {
  kick: "rhythm.kick",
  snare: "rhythm.snare",
  hats: "rhythm.hats",
  perc: "rhythm.perc",
};

interface Props {
  rhythm: RhythmPattern;
  bpmMin: number | null;
  bpmMax: number | null;
}

export default function StepSequencer({ rhythm, bpmMin, bpmMax }: Props) {
  const { t } = useLanguage();
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const audioRef = useRef<Record<TrackName, HTMLAudioElement> | null>(null);

  useEffect(() => {
    audioRef.current = {
      kick: new Audio(SAMPLE_URL.kick),
      snare: new Audio(SAMPLE_URL.snare),
      hats: new Audio(SAMPLE_URL.hats),
      perc: new Audio(SAMPLE_URL.perc),
    };
  }, []);

  const baseBpm = bpmMin && bpmMax ? (bpmMin + bpmMax) / 2 : bpmMin ?? bpmMax ?? 120;
  const bpm = baseBpm * (rhythm.tempoMultiplier ?? 1);

  useEffect(() => {
    if (!playing) return;
    const stepMs = 60000 / bpm / 4;
    let i = -1;
    const id = setInterval(() => {
      i = (i + 1) % rhythm.steps;
      setStep(i);
      for (const track of TRACKS) {
        const pattern = rhythm[track];
        const voices = audioRef.current;
        if (pattern?.[i] && voices) {
          const clone = voices[track].cloneNode(true) as HTMLAudioElement;
          clone.play().catch(() => {});
        }
      }
    }, stepMs);
    return () => clearInterval(id);
  }, [playing, bpm, rhythm]);

  const activeTracks = TRACKS.filter((track) => rhythm[track]);

  return (
    <div className="flex items-start gap-[14px]">
      <button
        type="button"
        className="flex-shrink-0 bg-surface-2 border border-wire rounded-lg text-ink text-[12px] font-bold px-[14px] py-1.5 cursor-pointer hover:border-accent hover:text-accent transition-colors"
        onClick={() => setPlaying((p) => !p)}
      >
        {playing ? t("rhythm.stop") : t("rhythm.play")}
      </button>
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {activeTracks.map((track) => (
          <div key={track} className="flex items-center gap-[10px]">
            <span className="w-14 flex-shrink-0 text-[10px] uppercase tracking-[0.04em] text-ink-faint">
              {t(TRACK_LABEL_KEY[track])}
            </span>
            <div className="flex-1 grid grid-cols-16 gap-[3px]">
              {rhythm[track]!.map((hit, i) => (
                <span
                  key={i}
                  className={cn(
                    "aspect-square rounded-sm border",
                    i % 4 === 0 ? "border-l-ink-faint border-wire" : "border-wire",
                    hit && i === step
                      ? "bg-accent border-accent"
                      : hit
                        ? "bg-ink-faint border-ink-faint"
                        : i === step
                          ? "bg-surface-2 ring-1 ring-accent"
                          : "bg-surface-2"
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
