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
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${
        size === "sm" ? "h-7 w-7 text-sm" : "h-10 w-10 text-lg"
      }`}
    >
      <span aria-hidden>🔊</span>
    </button>
  );
}

/** Short explanation shown once per page when the device has no Norwegian voice. */
export function NoVoiceNotice() {
  const available = useNorwegianVoice();
  const t = useT();
  if (available !== false) return null;
  return (
    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
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
  return <p className="text-xs text-slate-500">{t.speech.voice(label)}</p>;
}
