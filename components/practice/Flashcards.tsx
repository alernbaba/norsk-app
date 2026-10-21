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
    <div className="space-y-5">
      <div className="relative">
        {/* Two cards peeking out underneath make it read as a deck. */}
        <div aria-hidden className="sheet absolute inset-x-4 top-3 -bottom-3 rotate-[1.6deg] opacity-60" />
        <div aria-hidden className="sheet absolute inset-x-2 top-1.5 -bottom-1.5 -rotate-[1deg] opacity-85" />
        <div
          role="button"
          tabIndex={0}
          onClick={() => setFlipped(true)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setFlipped(true)}
          className="sheet rise relative flex min-h-72 cursor-pointer flex-col items-center justify-center gap-5 p-6 text-center"
        >
          <p className="eyebrow absolute top-4 left-5">Bokmål</p>
          <div className="flex items-center gap-3">
            <p className="font-display text-4xl font-medium sm:text-5xl" lang="nb">
              {word.no}
            </p>
            <SpeakButton text={word.no} slow={settings.slowSpeech} />
          </div>

          {flipped ? (
            <div className="rise w-full space-y-4">
              <div className="mx-auto h-px w-16 bg-line" />
              <p className="text-xl text-muted">{word.en.join(" · ")}</p>
              {inflection && (
                <table className="mx-auto w-full max-w-sm text-left text-sm">
                  <tbody>
                    {inflectionRows(inflection).map((row) => (
                      <tr key={row.form} className="border-t border-dashed border-line">
                        <th className="py-1.5 pr-3 font-normal text-muted">{t.forms[row.form]}</th>
                        <td className="py-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span lang="nb" className="font-medium">
                              {row.values.join(" / ")}
                            </span>
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
            <p className="text-sm text-muted">{t.practice.tapToSee}</p>
          )}
        </div>
      </div>

      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => onAnswer(false)} className="btn btn-quiet text-rust">
            {t.practice.didntKnow}
          </button>
          <button type="button" onClick={() => onAnswer(true)} className="btn btn-moss">
            {t.practice.knewIt}
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setFlipped(true)} className="btn btn-ink w-full">
          {t.practice.showAnswer}
        </button>
      )}
    </div>
  );
}
