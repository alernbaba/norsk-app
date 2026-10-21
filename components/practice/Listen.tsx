"use client";

import { useState } from "react";
import { getSpeech } from "@/lib/speech";
import type { Settings } from "@/lib/types";
import { useT } from "../i18n";
import { useNorwegianVoice } from "../SpeakButton";

/**
 * Play buttons for the listening exercise. The text itself stays hidden until
 * the answer is checked. iOS only lets speech start from a tap, so nothing
 * plays on mount: the first item waits for the big button, and later items are
 * started by the tap on "Continue" (see Practice).
 */
export function ListenPrompt({ text, settings, autoStarted }: { text: string; settings: Settings; autoStarted: boolean }) {
  const t = useT();
  const available = useNorwegianVoice();
  const [played, setPlayed] = useState(autoStarted);

  if (available === false) return <p className="text-base text-muted">{t.practice.listenNeedsVoice}</p>;

  const play = (slow: boolean) => {
    getSpeech().speak(text, { slow });
    setPlayed(true);
  };

  return (
    <div className="space-y-4">
      <p className="eyebrow">{t.practice.listenPrompt}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => play(settings.slowSpeech)}
          disabled={available !== true}
          aria-label={played ? t.practice.playAgain : t.practice.listenTap}
          className="btn btn-fjord flex-1 gap-3 py-4 text-lg"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
            <path d="M4 9.5h3l4.5-4v13L7 14.5H4z" fill="currentColor" fillOpacity="0.15" />
            <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
          </svg>
          <span className="font-sans">{played ? t.practice.playAgain : t.practice.listenTap}</span>
        </button>
        <button
          type="button"
          onClick={() => play(true)}
          disabled={available !== true}
          className="btn btn-quiet shrink-0 py-4 font-sans text-base"
        >
          🐢 {t.practice.playSlowly}
        </button>
      </div>
    </div>
  );
}
