"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { capitalize, drillAnswers, drillHint } from "@/lib/inflection";
import { idFromListen, reverseId, wordIdFromReverse, type Mode } from "@/lib/modes";
import { listenItemIds } from "@/lib/progress";
import { getSpeech } from "@/lib/speech";
import { goalState, type GoalState } from "@/lib/stats";
import type { InflectionTable, ItemProgress, Settings, Topic } from "@/lib/types";
import { BackLink } from "../BackLink";
import { useT, useTopicText } from "../i18n";
import { ModeIcon } from "../ModeIcon";
import { ProgressBar } from "../ProgressBar";
import { NoVoiceNotice } from "../SpeakButton";
import { useAppState } from "../useAppState";
import { Flashcard } from "./Flashcards";
import { ListenPrompt } from "./Listen";
import { TileBuilder } from "./TileBuilder";
import { useSession, type SessionResult } from "./useSession";
import { WriteAnswer } from "./WriteAnswer";

type Props = { topic: Topic; mode: Mode; inflections: InflectionTable };

export function Practice({ topic, mode, inflections }: Props) {
  const { ready, date, progress, settings, activity, record } = useAppState();
  const [round, setRound] = useState(0);
  const t = useT();
  const { title } = useTopicText()(topic);

  const itemIds = useMemo(() => {
    if (mode === "flashcards") return topic.words.map((w) => w.id);
    if (mode === "reverse") return topic.words.map((w) => reverseId(w.id));
    if (mode === "listen") return listenItemIds(topic);
    if (mode === "inflection") return topic.inflectionDrills.filter((d) => drillAnswers(d, inflections).length > 0).map((d) => d.id);
    return topic.sentences.map((s) => s.id);
  }, [topic, mode, inflections]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <BackLink href={`/topics/${topic.id}`}>
          {topic.emoji} {title}
        </BackLink>
        <h1 className="flex items-center gap-3 text-3xl font-medium">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-fjord-soft text-fjord">
            <ModeIcon mode={mode} />
          </span>
          {t.modes[mode].title}
        </h1>
      </div>
      <NoVoiceNotice />
      {!ready ? (
        <p className="text-muted">{t.common.loading}</p>
      ) : itemIds.length === 0 ? (
        <p className="text-muted">{t.practice.nothingInMode}</p>
      ) : (
        <Round
          key={round}
          topic={topic}
          mode={mode}
          inflections={inflections}
          itemIds={itemIds}
          progress={progress}
          settings={settings}
          goal={goalState(activity, date, settings.dailyGoal)}
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
  goal: GoalState;
  record: (itemId: string, correct: boolean) => Promise<unknown>;
  onRestart: () => void;
};

function Round({ topic, mode, inflections, itemIds, progress, settings, goal, record, onRestart }: RoundProps) {
  const t = useT();
  const { title } = useTopicText()(topic);
  const session = useSession(itemIds, progress);
  const id = session.current;

  const handleAnswer = (correct: boolean) => {
    if (!id) return;
    session.answer(id, correct);
    void record(id, correct);
  };

  // iOS only plays speech started from a tap, so the next listening item is
  // spoken in the "Continue" handler itself rather than when it mounts.
  const next = () => {
    const nextId = session.queue[session.index + 1];
    if (nextId && mode === "listen") getSpeech().speak(listenTarget(topic, nextId).text, { slow: settings.slowSpeech });
    session.next();
  };

  let body: ReactNode = null;
  if (session.done) {
    body = (
      <RoundSummary results={session.results} goal={goal} onRestart={onRestart} backHref={`/topics/${topic.id}`} backLabel={t.practice.backTo(title)} />
    );
  } else if (id) {
    body = (
      <Exercise
        key={id}
        topic={topic}
        mode={mode}
        itemId={id}
        inflections={inflections}
        settings={settings}
        autoStarted={session.index > 0}
        onAnswer={handleAnswer}
        onNext={next}
      />
    );
  }

  return (
    <div className="space-y-5">
      {!session.done && (
        <>
          <div className="flex items-center gap-3">
            <ProgressBar value={session.index} max={session.total} label={t.practice.sessionProgress} />
            <span className="shrink-0 text-sm font-medium tabular-nums text-muted">
              {session.index + 1} / {session.total}
            </span>
          </div>
          {session.extra && <p className="rounded-xl bg-fjord-soft px-3 py-2 text-sm text-fjord">{t.practice.extraPractice}</p>}
        </>
      )}
      {body}
    </div>
  );
}

/** What the listening exercise plays for an item, and the answers it accepts. */
export function listenTarget(topic: Topic, itemId: string) {
  const baseId = idFromListen(itemId);
  const word = topic.words.find((w) => w.id === baseId);
  if (word) return { text: word.no, accepted: [word.no], meaning: word.en.join(", ") };
  const sentence = topic.sentences.find((s) => s.id === baseId)!;
  return { text: sentence.no[0], accepted: sentence.no, meaning: sentence.en };
}

type ExerciseProps = {
  topic: Topic;
  mode: Mode;
  itemId: string;
  inflections: InflectionTable;
  settings: Settings;
  /** The listening item was already spoken by the tap that brought it up. */
  autoStarted: boolean;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
};

/** One item in one exercise type. Mount it with the item id as key. */
export function Exercise({ topic, mode, itemId: id, inflections, settings, autoStarted, onAnswer, onNext }: ExerciseProps) {
  const t = useT();
  if (mode === "flashcards" || mode === "reverse") {
    const word = topic.words.find((w) => w.id === wordIdFromReverse(id))!;
    return (
      <Flashcard
        word={word}
        reverse={mode === "reverse"}
        inflections={inflections}
        settings={settings}
        onAnswer={(knewIt) => {
          onAnswer(knewIt);
          onNext();
        }}
      />
    );
  }
  if (mode === "tiles") {
    const sentence = topic.sentences.find((s) => s.id === id)!;
    return <TileBuilder sentence={sentence} settings={settings} onAnswer={onAnswer} onNext={onNext} />;
  }
  if (mode === "write") {
    const sentence = topic.sentences.find((s) => s.id === id)!;
    return <WriteAnswer prompt={<p>{sentence.en}</p>} accepted={sentence.no} settings={settings} onAnswer={onAnswer} onNext={onNext} />;
  }
  if (mode === "listen") {
    const target = listenTarget(topic, id);
    return (
      <WriteAnswer
        prompt={<ListenPrompt text={target.text} settings={settings} autoStarted={autoStarted} />}
        accepted={target.accepted}
        settings={settings}
        onAnswer={onAnswer}
        onNext={onNext}
        placeholder={t.practice.typeWhatYouHear}
        alternatives={[]}
        note={
          <p className="text-sm text-muted">
            {t.practice.meaning}
            {target.meaning}
          </p>
        }
      />
    );
  }
  const drill = topic.inflectionDrills.find((d) => d.id === id)!;
  const [before, after] = drill.no.split("___");
  return (
    <WriteAnswer
      prompt={
        <div className="space-y-2">
          <p lang="nb">
            {before}
            <span className="mx-1 inline-block min-w-16 border-b-2 border-fjord text-center">&nbsp;</span>
            {after}
          </p>
          <p className="font-sans text-base font-normal text-muted">
            ({drillHint(drill, t.forms)}) · {drill.en}
          </p>
        </div>
      }
      accepted={drillAnswers(drill, inflections)}
      settings={settings}
      onAnswer={onAnswer}
      onNext={onNext}
      placeholder={t.practice.missingWord}
      formatExpected={(answer) => capitalize(`${before}${answer}${after}`)}
    />
  );
}

type SummaryProps = {
  results: SessionResult[];
  goal: GoalState;
  onRestart: () => void;
  backHref: string;
  backLabel: string;
};

/** The score at the end of a round, with today's goal. */
export function RoundSummary({ results, goal, onRestart, backHref, backLabel }: SummaryProps) {
  const t = useT();
  const right = results.filter((r) => r.correct).length;
  return (
    <div className="sheet rise space-y-5 px-5 py-8 text-center">
      <p className="eyebrow">{right === results.length ? t.practice.perfect : t.practice.wellDone}</p>
      <p className="font-display text-6xl font-medium tabular-nums">
        <span aria-hidden>
          {right}
          <span className="text-muted">/{results.length}</span>
        </span>
        <span className="sr-only">{t.practice.rightOf(right, results.length)}</span>
      </p>
      <p className="text-muted">{right === results.length ? t.practice.allRight : t.practice.missedComeBack}</p>
      {goal.met ? (
        <p className="text-sm font-medium text-moss">{t.practice.goalReached}</p>
      ) : (
        <div className="mx-auto flex max-w-xs items-center gap-3">
          <ProgressBar value={goal.answered} max={goal.goal} label={t.goal.ringLabel} />
          <span className="shrink-0 text-sm font-medium text-muted tabular-nums">{t.practice.goalToday(goal.answered, goal.goal)}</span>
        </div>
      )}
      <div className="grid gap-3 pt-2 sm:grid-cols-2">
        <button type="button" onClick={onRestart} className="btn btn-fjord">
          {t.practice.again}
        </button>
        <Link href={backHref} className="btn btn-quiet">
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
