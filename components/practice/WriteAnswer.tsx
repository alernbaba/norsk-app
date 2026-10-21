"use client";

import { useState, type ReactNode } from "react";
import { checkAnswer, isCorrect, type CheckResult } from "@/lib/answer-check";
import type { Settings } from "@/lib/types";
import { AnswerInput } from "../AnswerInput";
import { Feedback } from "../Feedback";
import { useT } from "../i18n";

type Props = {
  prompt: ReactNode;
  accepted: string[];
  settings: Settings;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
  placeholder?: string;
  /** Turns the model answer into what is shown and read aloud (e.g. the full drill sentence). */
  formatExpected?: (answer: string) => string;
};

/** A prompt plus a free-text answer, checked tolerantly. Used for "Write it" and "Inflection". */
export function WriteAnswer({ prompt, accepted, settings, onAnswer, onNext, placeholder, formatExpected = (a) => a }: Props) {
  const t = useT();
  const [value, setValue] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);

  const check = () => {
    if (result || value.trim() === "") return;
    const r = checkAnswer(value, accepted);
    setResult(r);
    onAnswer(isCorrect(r));
  };

  return (
    <div className="space-y-5">
      <div className="text-xl font-medium">{prompt}</div>
      <AnswerInput value={value} onChange={setValue} onSubmit={result ? onNext : check} disabled={!!result} placeholder={placeholder} autoFocus />
      {result ? (
        <>
          <Feedback
            status={result.status}
            expected={formatExpected(result.expected)}
            slow={settings.slowSpeech}
            alternatives={accepted.slice(1)}
          />
          <button type="button" onClick={onNext} autoFocus className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
            {t.common.continue}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={check}
          disabled={value.trim() === ""}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          {t.common.check}
        </button>
      )}
    </div>
  );
}
