"use client";

import { useState, type ReactNode } from "react";
import { LANGUAGES } from "@/lib/i18n/messages";
import { LEVEL_CHOICES } from "@/lib/levels";
import { GOAL_CHOICES } from "@/lib/stats";
import { setLanguage, useLanguage, useT } from "./i18n";
import { NoVoiceNotice, SpeakButton, VoicePicker } from "./SpeakButton";
import { setTheme, THEME_CHOICES, useTheme } from "./theme";
import { useAppState } from "./useAppState";

export function SettingsForm() {
  const { ready, settings, updateSettings, reset } = useAppState();
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const t = useT();
  const language = useLanguage();
  const theme = useTheme();

  return (
    <div className="space-y-6">
      <Choice
        name="language"
        title={t.settings.language}
        description={t.settings.languageDescription}
        options={LANGUAGES}
        value={language}
        onChange={setLanguage}
      />

      <Choice
        name="theme"
        title={t.settings.appearance}
        description={t.settings.appearanceDescription}
        options={THEME_CHOICES.map((id) => ({ id, label: t.settings.themes[id] }))}
        value={theme}
        onChange={setTheme}
      />

      <Choice
        name="level"
        title={t.settings.level}
        description={t.settings.levelDescription}
        options={LEVEL_CHOICES.map((id) => ({ id, label: t.levels[id] }))}
        value={settings.level}
        disabled={!ready}
        onChange={(level) => updateSettings({ ...settings, level })}
      />

      <Choice
        name="daily-goal"
        title={t.settings.goal}
        description={t.settings.goalDescription}
        options={GOAL_CHOICES.map((n) => ({ id: String(n), label: String(n) }))}
        value={String(settings.dailyGoal)}
        disabled={!ready}
        onChange={(goal) => updateSettings({ ...settings, dailyGoal: Number(goal) })}
      >
        <div className="pt-2">
          <Toggle
            label={t.settings.goalReminder}
            description={t.settings.goalReminderDescription}
            checked={settings.goalReminder}
            disabled={!ready}
            onChange={(goalReminder) => updateSettings({ ...settings, goalReminder })}
          />
        </div>
      </Choice>

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
        <VoicePicker sample="Hei! Velkommen til norsk." slow={settings.slowSpeech} />
        <div className="flex items-center gap-3 rounded-xl bg-sunk/70 p-3 text-sm text-muted">
          <SpeakButton text="Hei! Velkommen til norsk." slow={settings.slowSpeech} />
          <span className="font-display text-base text-ink italic">{t.settings.tryIt("Hei! Velkommen til norsk.")}</span>
        </div>
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

/** A titled card with a segmented control for picking one option. */
function Choice<T extends string>({
  name,
  title,
  description,
  options,
  value,
  disabled,
  onChange,
  children,
}: {
  name: string;
  title: string;
  description: string;
  options: { id: T; label: string }[];
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
  children?: ReactNode;
}) {
  return (
    <fieldset className="sheet space-y-3 p-5" disabled={disabled}>
      <legend className="sr-only">{title}</legend>
      <h2 className="text-xl font-medium" aria-hidden>
        {title}
      </h2>
      <p className="text-sm text-muted">{description}</p>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-2xl bg-sunk p-1">
        {options.map((o) => (
          <label
            key={o.id}
            className="flex cursor-pointer items-center justify-center rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-muted transition has-checked:bg-card has-checked:text-ink has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-fjord"
          >
            <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} className="sr-only" />
            {o.label}
          </label>
        ))}
      </div>
      {children}
    </fieldset>
  );
}
