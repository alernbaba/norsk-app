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
      <p className="font-display text-2xl leading-snug">{sentence.en}</p>

      <div className="flex min-h-[4.5rem] flex-wrap content-start gap-2 rounded-2xl bg-sunk/70 p-3 shadow-[inset_0_1px_3px_rgb(0_0_0/0.08)]">
        {chosen.length === 0 && <span className="self-center px-1 text-sm text-muted">{t.practice.tapInOrder}</span>}
        {chosen.map((tile) => (
          <button
            key={tile.key}
            type="button"
            disabled={!!result}
            onClick={() => setChosen((c) => c.filter((x) => x.key !== tile.key))}
            className="rise rounded-lg border border-fjord/30 bg-fjord-soft px-3 py-2 text-lg font-medium text-fjord shadow-[0_2px_0_0_color-mix(in_oklab,var(--fjord)_35%,transparent)]"
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
            className="rounded-lg border border-line bg-card px-3 py-2 text-lg shadow-[0_2px_0_0_var(--press)] transition hover:bg-sunk active:translate-y-0.5 active:shadow-none disabled:opacity-50"
            lang="nb"
          >
            {tile.text}
          </button>
        ))}
      </div>

      {result ? (
        <>
          <Feedback status={result.status} expected={result.expected} slow={settings.slowSpeech} alternatives={sentence.no.slice(1)} />
          <button type="button" onClick={onNext} className="btn btn-ink w-full">
            {t.common.continue}
          </button>
        </>
      ) : (
        <button type="button" onClick={check} disabled={chosen.length === 0} className="btn btn-fjord w-full">
          {t.common.check}
        </button>
      )}
    </div>
  );
}
