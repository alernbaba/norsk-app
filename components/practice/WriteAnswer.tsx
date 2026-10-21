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
  /** Other accepted answers to show; defaults to every variant but the first. */
  alternatives?: string[];
  /** Extra line under the feedback, e.g. the meaning in the listening exercise. */
  note?: ReactNode;
};

/** A prompt plus a free-text answer, checked tolerantly. Used for "Write it", "Inflection" and "Listening". */
export function WriteAnswer({
  prompt,
  accepted,
  settings,
  onAnswer,
  onNext,
  placeholder,
  formatExpected = (a) => a,
  alternatives = accepted.slice(1),
  note,
}: Props) {
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
      <div className="font-display text-2xl leading-snug">{prompt}</div>
      <AnswerInput value={value} onChange={setValue} onSubmit={result ? onNext : check} disabled={!!result} placeholder={placeholder} autoFocus />
      {result ? (
        <>
          <Feedback
            status={result.status}
            expected={formatExpected(result.expected)}
            slow={settings.slowSpeech}
            alternatives={alternatives}
          />
          {note}
          <button type="button" onClick={onNext} autoFocus className="btn btn-ink w-full">
            {t.common.continue}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={check}
          disabled={value.trim() === ""}
          className="btn btn-fjord w-full"
        >
          {t.common.check}
        </button>
      )}
    </div>
  );
}
