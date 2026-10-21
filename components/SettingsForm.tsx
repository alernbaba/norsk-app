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
      <fieldset className="sheet space-y-3 p-5">
        <legend className="sr-only">{t.settings.language}</legend>
        <h2 className="text-xl font-medium" aria-hidden>
          {t.settings.language}
        </h2>
        <p className="text-sm text-muted">{t.settings.languageDescription}</p>
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-sunk p-1">
          {LANGUAGES.map((l) => (
            <label
              key={l.id}
              className="flex cursor-pointer items-center justify-center rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-muted transition has-checked:bg-card has-checked:text-ink has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-fjord"
            >
              <input
                type="radio"
                name="language"
                value={l.id}
                checked={language === l.id}
                onChange={() => setLanguage(l.id)}
                className="sr-only"
              />
              {l.label}
            </label>
          ))}
        </div>
      </fieldset>

      <section className="sheet space-y-5 p-5">
        <h2 className="text-xl font-medium">{t.settings.pronunciation}</h2>
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
        <div className="flex items-center gap-3 rounded-xl bg-sunk/70 p-3 text-sm text-muted">
          <SpeakButton text="Hei! Velkommen til norsk." slow={settings.slowSpeech} />
          <span className="font-display text-base text-ink italic">{t.settings.tryIt("Hei! Velkommen til norsk.")}</span>
        </div>
        <VoiceInfo />
      </section>

      <section className="space-y-3 rounded-[1.25rem] border border-dashed border-rust/50 p-5">
        <h2 className="text-xl font-medium">{t.settings.reset}</h2>
        <p className="text-sm text-muted">{t.settings.resetDescription}</p>
        {resetDone && <p className="text-sm font-medium text-moss">{t.settings.resetDone}</p>}
        {confirming ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={async () => {
                await reset();
                setConfirming(false);
                setResetDone(true);
              }}
              className="btn btn-rust"
            >
              {t.settings.resetConfirm}
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="btn btn-quiet">
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
            className="btn btn-quiet text-rust"
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
        <span className="block text-sm text-muted">{description}</span>
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer h-7 w-12 cursor-pointer appearance-none rounded-full border border-line bg-sunk transition-colors checked:border-moss checked:bg-moss disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1 left-1 h-5 w-5 rounded-full bg-card shadow-sm transition-transform peer-checked:translate-x-5"
        />
      </span>
    </label>
  );
}
