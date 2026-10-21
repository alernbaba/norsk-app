"use client";

import { useEffect, useState } from "react";
import { getSpeech } from "@/lib/speech";
import { useT } from "./i18n";

/** Whether a Norwegian voice exists: null while checking. */
export function useNorwegianVoice(): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    let active = true;
    void getSpeech()
      .ready()
      .then((ok) => active && setAvailable(ok));
    return () => {
      active = false;
    };
  }, []);
  return available;
}

type Props = {
  text: string;
  slow?: boolean;
  size?: "sm" | "md";
  label?: string;
};

export function SpeakButton({ text, slow = false, size = "md", label }: Props) {
  const available = useNorwegianVoice();
  const t = useT();
  const disabled = available !== true;
  const title = available === false ? t.speech.noVoice : available === null ? t.speech.checking : t.speech.listenTitle(text);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        getSpeech().speak(text, { slow });
      }}
      disabled={disabled}
      title={title}
      aria-label={label ?? t.speech.listenLabel(text)}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-card text-fjord transition hover:border-fjord/40 hover:bg-fjord-soft active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
        size === "sm" ? "h-7 w-7" : "h-10 w-10"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5"}
        aria-hidden
      >
        <path d="M4 9.5h3l4.5-4v13L7 14.5H4z" fill="currentColor" fillOpacity="0.15" />
        <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
      </svg>
    </button>
  );
}

/** Short explanation shown once per page when the device has no Norwegian voice. */
export function NoVoiceNotice() {
  const available = useNorwegianVoice();
  const t = useT();
  if (available !== false) return null;
  return (
    <p className="rounded-xl border-l-4 border-ochre bg-ochre-soft px-3 py-2 text-sm text-ink">
      {t.speech.noVoiceNotice}
    </p>
  );
}

/** Names the voice in use, which helps when speech is silent on a device. */
export function VoiceInfo() {
  const available = useNorwegianVoice();
  const t = useT();
  const label = available ? getSpeech().voiceLabel() : null;
  if (!label) return null;
  return <p className="text-xs text-muted">{t.speech.voice(label)}</p>;
}
