"use client";

import { useMemo, useState } from "react";
import { checkAnswer, isCorrect, type CheckResult } from "@/lib/answer-check";
import { buildTiles, type Tile } from "@/lib/tiles";
import type { Sentence, Settings } from "@/lib/types";
import { Feedback } from "../Feedback";
import { useT } from "../i18n";

type Props = {
  sentence: Sentence;
  settings: Settings;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
};

export function TileBuilder({ sentence, settings, onAnswer, onNext }: Props) {
  const t = useT();
  const tiles = useMemo(() => buildTiles(sentence), [sentence]);
  const [chosen, setChosen] = useState<Tile[]>([]);
  const [result, setResult] = useState<CheckResult | null>(null);

  const available = tiles.filter((t) => !chosen.some((c) => c.key === t.key));

  const check = () => {
    const r = checkAnswer(chosen.map((t) => t.text).join(" "), sentence.no);
    setResult(r);
    onAnswer(isCorrect(r));
  };

  return (
    <div className="space-y-5">
      <p className="text-xl font-medium">{sentence.en}</p>

      <div className="flex min-h-16 flex-wrap content-start gap-2 rounded-xl border-2 border-dashed border-slate-300 p-3 dark:border-slate-600">
        {chosen.length === 0 && <span className="self-center text-sm text-slate-400">{t.practice.tapInOrder}</span>}
        {chosen.map((tile) => (
          <button
            key={tile.key}
            type="button"
            disabled={!!result}
            onClick={() => setChosen((c) => c.filter((x) => x.key !== tile.key))}
            className="rounded-lg bg-emerald-100 px-3 py-2 text-lg text-emerald-950 dark:bg-emerald-900 dark:text-emerald-50"
            lang="nb"
          >
            {tile.text}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {available.map((tile) => (
          <button
            key={tile.key}
            type="button"
            disabled={!!result}
            onClick={() => setChosen((c) => [...c, tile])}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg shadow-sm hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
            lang="nb"
          >
            {tile.text}
          </button>
        ))}
      </div>

      {result ? (
        <>
          <Feedback status={result.status} expected={result.expected} slow={settings.slowSpeech} alternatives={sentence.no.slice(1)} />
          <button type="button" onClick={onNext} className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white dark:bg-slate-100 dark:text-slate-900">
            {t.common.continue}
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={check}
          disabled={chosen.length === 0}
          className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          {t.common.check}
        </button>
      )}
    </div>
  );
}
