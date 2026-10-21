"use client";

import { useState } from "react";
import { LANGUAGES } from "@/lib/i18n/messages";
import { setLanguage, useLanguage, useT } from "./i18n";
import { NoVoiceNotice, SpeakButton, VoiceInfo } from "./SpeakButton";
import { useAppState } from "./useAppState";

export function SettingsForm() {
  const { ready, settings, updateSettings, reset } = useAppState();
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const t = useT();
  const language = useLanguage();

  return (
    <div className="space-y-6">
      <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <legend className="sr-only">{t.settings.language}</legend>
        <h2 className="font-semibold" aria-hidden>
          {t.settings.language}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t.settings.languageDescription}</p>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((l) => (
            <label
              key={l.id}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 font-medium has-checked:border-emerald-500 has-checked:bg-emerald-50 dark:border-slate-600 dark:has-checked:bg-emerald-950"
            >
              <input
                type="radio"
                name="language"
                value={l.id}
                checked={language === l.id}
                onChange={() => setLanguage(l.id)}
                className="accent-emerald-600"
              />
              {l.label}
            </label>
          ))}
        </div>
      </fieldset>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="font-semibold">{t.settings.pronunciation}</h2>
        <NoVoiceNotice />
        <Toggle
          label={t.settings.slowSpeech}
          description={t.settings.slowSpeechDescription}
          checked={settings.slowSpeech}
          disabled={!ready}
          onChange={(slowSpeech) => updateSettings({ ...settings, slowSpeech })}
        />
        <Toggle
          label={t.settings.autoPlay}
          description={t.settings.autoPlayDescription}
          checked={settings.autoPlay}
          disabled={!ready}
          onChange={(autoPlay) => updateSettings({ ...settings, autoPlay })}
        />
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <SpeakButton text="Hei! Velkommen til norsk." slow={settings.slowSpeech} />
          <span>{t.settings.tryIt("Hei! Velkommen til norsk.")}</span>
        </div>
        <VoiceInfo />
      </section>

      <section className="space-y-3 rounded-2xl border border-rose-200 bg-white p-4 dark:border-rose-900 dark:bg-slate-900">
        <h2 className="font-semibold">{t.settings.reset}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">{t.settings.resetDescription}</p>
        {resetDone && <p className="text-sm font-medium text-emerald-700">{t.settings.resetDone}</p>}
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
              {t.settings.resetConfirm}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="rounded-xl border border-slate-300 px-4 py-2 font-semibold dark:border-slate-600">
              {t.common.cancel}
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
            {t.settings.resetButton}
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
