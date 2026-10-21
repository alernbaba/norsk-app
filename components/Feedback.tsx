"use client";

import type { CheckStatus } from "@/lib/answer-check";
import { useT } from "./i18n";
import { SpeakButton } from "./SpeakButton";

type Props = {
  status: CheckStatus;
  /** Model answer (shown when wrong, and as confirmation when right). */
  expected: string;
  slow?: boolean;
  /** Other accepted answers, shown in small print. */
  alternatives?: string[];
};

export function Feedback({ status, expected, slow, alternatives = [] }: Props) {
  const t = useT();
  const right = status !== "wrong";
  return (
    <div
      role="status"
      className={`rise rounded-2xl border-l-4 px-4 py-3 ${right ? "border-moss bg-moss-soft" : "border-rust bg-rust-soft"}`}
    >
      <p className={`font-display text-lg font-semibold italic ${right ? "text-moss" : "text-rust"}`}>
        {right ? t.feedback.correct : t.feedback.notQuite}
      </p>
      {status === "correct-with-hint" && (
        <p className="mt-1 text-sm">{t.feedback.letterHint}</p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <p className="text-lg">
          {right ? "" : t.feedback.correctAnswer}
          <span className="font-display font-medium" lang="nb">
            {expected}
          </span>
        </p>
        <SpeakButton text={expected} slow={slow} size="sm" />
      </div>
      {alternatives.length > 0 && (
        <p className="mt-1 text-sm text-muted">
          {t.feedback.alsoAccepted}
          <span lang="nb">{alternatives.join(" · ")}</span>
        </p>
      )}
    </div>
  );
}
