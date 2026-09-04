import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";
import type { StringKey } from "../i18n/strings";
import type { RhythmPattern } from "../types";
import "./StepSequencer.css";

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
    <div className="step-sequencer">
      <button
        type="button"
        className="step-sequencer__toggle"
        onClick={() => setPlaying((p) => !p)}
      >
        {playing ? t("rhythm.stop") : t("rhythm.play")}
      </button>
      <div className="step-sequencer__grid">
        {activeTracks.map((track) => (
          <div key={track} className="step-sequencer__row">
            <span className="step-sequencer__label">{t(TRACK_LABEL_KEY[track])}</span>
            <div className="step-sequencer__steps">
              {rhythm[track]!.map((hit, i) => (
                <span
                  key={i}
                  className={`step-sequencer__cell${hit ? " step-sequencer__cell--hit" : ""}${
                    i === step ? " step-sequencer__cell--current" : ""
                  }${i % 4 === 0 ? " step-sequencer__cell--beat" : ""}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
