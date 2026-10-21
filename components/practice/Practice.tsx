"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { capitalize, drillAnswers, drillHint } from "@/lib/inflection";
import type { Mode } from "@/lib/modes";
import type { InflectionTable, ItemProgress, Settings, Topic } from "@/lib/types";
import { useT, useTopicText } from "../i18n";
import { ProgressBar } from "../ProgressBar";
import { NoVoiceNotice } from "../SpeakButton";
import { useAppState } from "../useAppState";
import { Flashcard } from "./Flashcards";
import { TileBuilder } from "./TileBuilder";
import { useSession } from "./useSession";
import { WriteAnswer } from "./WriteAnswer";

type Props = { topic: Topic; mode: Mode; inflections: InflectionTable };

export function Practice({ topic, mode, inflections }: Props) {
  const { ready, progress, settings, record } = useAppState();
  const [round, setRound] = useState(0);
  const t = useT();
  const { title } = useTopicText()(topic);

  const itemIds = useMemo(() => {
    if (mode === "flashcards") return topic.words.map((w) => w.id);
    if (mode === "inflection") return topic.inflectionDrills.filter((d) => drillAnswers(d, inflections).length > 0).map((d) => d.id);
    return topic.sentences.map((s) => s.id);
  }, [topic, mode, inflections]);

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/topics/${topic.id}`} className="text-sm text-slate-500 hover:underline">
          ← {topic.emoji} {title}
        </Link>
        <h1 className="text-2xl font-bold">{t.modes[mode].title}</h1>
      </div>
      <NoVoiceNotice />
      {!ready ? (
        <p className="text-slate-500">{t.common.loading}</p>
      ) : itemIds.length === 0 ? (
        <p className="text-slate-500">{t.practice.nothingInMode}</p>
      ) : (
        <Round
          key={round}
          topic={topic}
          mode={mode}
          inflections={inflections}
          itemIds={itemIds}
          progress={progress}
          settings={settings}
          record={record}
          onRestart={() => setRound((r) => r + 1)}
        />
      )}
    </div>
  );
}

type RoundProps = Props & {
  itemIds: string[];
  progress: Record<string, ItemProgress>;
  settings: Settings;
  record: (itemId: string, correct: boolean) => Promise<unknown>;
  onRestart: () => void;
};

function Round({ topic, mode, inflections, itemIds, progress, settings, record, onRestart }: RoundProps) {
  const t = useT();
  const { title } = useTopicText()(topic);
  const session = useSession(itemIds, progress);
  const id = session.current;

  const handleAnswer = (correct: boolean) => {
    if (!id) return;
    session.answer(id, correct);
    void record(id, correct);
  };

  let body: ReactNode = null;
  if (session.done) {
    const right = session.results.filter((r) => r.correct).length;
    body = (
      <div className="space-y-4 text-center">
        <p className="text-5xl">{right === session.results.length ? "🎉" : "💪"}</p>
        <p className="text-2xl font-semibold">
          {t.practice.rightOf(right, session.results.length)}
        </p>
        <p className="text-slate-600 dark:text-slate-300">{t.practice.missedComeBack}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onRestart} className="rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700">
            {t.practice.again}
          </button>
          <Link href={`/topics/${topic.id}`} className="rounded-xl border border-slate-300 px-4 py-3 font-semibold hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
            {t.practice.backTo(title)}
          </Link>
        </div>
      </div>
    );
  } else if (id && mode === "flashcards") {
    const word = topic.words.find((w) => w.id === id)!;
    body = (
      <Flashcard
        key={id}
        word={word}
        inflections={inflections}
        settings={settings}
        onAnswer={(knewIt) => {
          handleAnswer(knewIt);
          session.next();
        }}
      />
    );
  } else if (id && mode === "tiles") {
    const sentence = topic.sentences.find((s) => s.id === id)!;
    body = <TileBuilder key={id} sentence={sentence} settings={settings} onAnswer={handleAnswer} onNext={session.next} />;
  } else if (id && mode === "write") {
    const sentence = topic.sentences.find((s) => s.id === id)!;
    body = (
      <WriteAnswer key={id} prompt={<p>{sentence.en}</p>} accepted={sentence.no} settings={settings} onAnswer={handleAnswer} onNext={session.next} />
    );
  } else if (id && mode === "inflection") {
    const drill = topic.inflectionDrills.find((d) => d.id === id)!;
    const [before, after] = drill.no.split("___");
    body = (
      <WriteAnswer
        key={id}
        prompt={
          <div className="space-y-2">
            <p lang="nb">
              {before}
              <span className="mx-1 inline-block min-w-16 border-b-2 border-slate-400 text-center">&nbsp;</span>
              {after}
            </p>
            <p className="text-base font-normal text-slate-500 dark:text-slate-400">
              ({drillHint(drill, t.forms)}) · {drill.en}
            </p>
          </div>
        }
        accepted={drillAnswers(drill, inflections)}
        settings={settings}
        onAnswer={handleAnswer}
        onNext={session.next}
        placeholder={t.practice.missingWord}
        formatExpected={(answer) => capitalize(`${before}${answer}${after}`)}
      />
    );
  }

  return (
    <div className="space-y-5">
      {!session.done && (
        <>
          <div className="flex items-center gap-3">
            <ProgressBar value={session.index} max={session.total} label={t.practice.sessionProgress} />
            <span className="shrink-0 text-sm tabular-nums text-slate-500">
              {session.index + 1} / {session.total}
            </span>
          </div>
          {session.extra && <p className="text-sm text-slate-500">{t.practice.extraPractice}</p>}
        </>
      )}
      {body}
    </div>
  );
}
