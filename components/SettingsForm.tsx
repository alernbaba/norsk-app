"use client";

import { useState } from "react";
import { NoVoiceNotice, SpeakButton } from "./SpeakButton";
import { useAppState } from "./useAppState";

export function SettingsForm() {
  const { ready, settings, updateSettings, reset } = useAppState();
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="font-semibold">Pronunciation</h2>
        <NoVoiceNotice />
        <Toggle
          label="Slow speech"
          description="Read Norwegian more slowly. Helpful when you are starting out."
          checked={settings.slowSpeech}
          disabled={!ready}
          onChange={(slowSpeech) => updateSettings({ ...settings, slowSpeech })}
        />
        <Toggle
          label="Play automatically"
          description="Read the word aloud when a new flashcard appears."
          checked={settings.autoPlay}
          disabled={!ready}
          onChange={(autoPlay) => updateSettings({ ...settings, autoPlay })}
        />
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <SpeakButton text="Hei! Velkommen til norsk." slow={settings.slowSpeech} />
          <span>Try it: “Hei! Velkommen til norsk.”</span>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-rose-200 bg-white p-4 dark:border-rose-900 dark:bg-slate-900">
        <h2 className="font-semibold">Reset progress</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Deletes all progress and your streak on this device. Your settings are kept. This cannot be undone.
        </p>
        {resetDone && <p className="text-sm font-medium text-emerald-700">Progress has been reset.</p>}
        {confirming ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                await reset();
                setConfirming(false);
                setResetDone(true);
              }}
              className="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700"
            >
              Yes, delete my progress
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold dark:border-slate-600">
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setConfirming(true);
              setResetDone(false);
            }}
            className="rounded-xl border border-rose-300 px-4 py-2 font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950"
          >
            Reset progress…
          </button>
        )}
      </section>
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block font-medium">{label}</span>
        <span className="block text-sm text-slate-500 dark:text-slate-400">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-emerald-600"
      />
    </label>
  );
}
