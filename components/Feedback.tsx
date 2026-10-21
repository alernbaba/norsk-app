"use client";

import type { CheckStatus } from "@/lib/answer-check";
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
  const right = status !== "wrong";
  return (
    <div
      role="status"
      className={`rounded-xl px-4 py-3 ${
        right
          ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
          : "bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-100"
      }`}
    >
      <p className="font-semibold">{right ? "Correct!" : "Not quite."}</p>
      {status === "correct-with-hint" && (
        <p className="mt-1 text-sm">Tip: remember the letters æ, ø and å. You can use the buttons under the text field.</p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <p className="text-lg">
          {right ? "" : "Correct answer: "}
          <span className="font-medium" lang="nb">
            {expected}
          </span>
        </p>
        <SpeakButton text={expected} slow={slow} size="sm" />
      </div>
      {alternatives.length > 0 && (
        <p className="mt-1 text-sm opacity-80">
          Also accepted: <span lang="nb">{alternatives.join(" · ")}</span>
        </p>
      )}
    </div>
  );
}
