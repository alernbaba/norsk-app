"use client";

import { useEffect, useState } from "react";
import { inflectionForWord, inflectionRows } from "@/lib/inflection";
import { getSpeech } from "@/lib/speech";
import type { InflectionTable, Settings, Word } from "@/lib/types";
import { useT } from "../i18n";
import { SpeakButton } from "../SpeakButton";

type Props = {
  word: Word;
  inflections: InflectionTable;
  settings: Settings;
  onAnswer: (knewIt: boolean) => void;
};

export function Flashcard({ word, inflections, settings, onAnswer }: Props) {
  const [flipped, setFlipped] = useState(false);
  const t = useT();
  const inflection = inflectionForWord(word, inflections);

  useEffect(() => {
    if (!settings.autoPlay) return;
    void getSpeech()
      .ready()
      .then((ok) => ok && getSpeech().speak(word.no, { slow: settings.slowSpeech }));
  }, [word.id, word.no, settings.autoPlay, settings.slowSpeech]);

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped(true)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlipped(true)}
        className="flex min-h-64 cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-center gap-3">
          <p className="text-3xl font-semibold" lang="nb">
            {word.no}
          </p>
          <SpeakButton text={word.no} slow={settings.slowSpeech} />
        </div>

        {flipped ? (
          <div className="w-full space-y-4">
            <p className="text-xl text-slate-600 dark:text-slate-300">{word.en.join(" · ")}</p>
            {inflection && (
              <table className="mx-auto w-full max-w-sm text-left text-sm">
                <tbody>
                  {inflectionRows(inflection).map((row) => (
                    <tr key={row.form} className="border-t border-slate-100 dark:border-slate-800">
                      <th className="py-1.5 pr-3 font-normal text-slate-500 dark:text-slate-400">{t.forms[row.form]}</th>
                      <td className="py-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span lang="nb">{row.values.join(" / ")}</span>
                          <SpeakButton text={row.values[0]} slow={settings.slowSpeech} size="sm" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t.practice.tapToSee}</p>
        )}
      </div>

      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onAnswer(false)}
            className="rounded-xl bg-rose-100 px-4 py-3 font-semibold text-rose-900 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-100"
          >
            {t.practice.didntKnow}
          </button>
          <button
            type="button"
            onClick={() => onAnswer(true)}
            className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            {t.practice.knewIt}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setFlipped(true)}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
        >
          {t.practice.showAnswer}
        </button>
      )}
    </div>
  );
}
