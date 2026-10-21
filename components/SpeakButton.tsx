"use client";

import { useEffect, useState } from "react";
import { getSpeech } from "@/lib/speech";

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
  const disabled = available !== true;
  const title =
    available === false ? "No Norwegian voice on this device" : available === null ? "Checking for a Norwegian voice…" : `Listen: ${text}`;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        getSpeech().speak(text, { slow });
      }}
      disabled={disabled}
      title={title}
      aria-label={label ?? `Listen to "${text}"`}
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
  if (available !== false) return null;
  return (
    <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      Pronunciation is off: this device has no Norwegian voice. On most phones and computers you can add one under the
      system&apos;s language or text-to-speech settings.
    </p>
  );
}
