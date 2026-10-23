"use client";

import { useState } from "react";
import { buildShuffleRound, type ShuffleItem } from "@/lib/shuffle";
import { getSpeech } from "@/lib/speech";
import { goalState, type GoalState } from "@/lib/stats";
import type { InflectionTable, ItemProgress, Settings, Topic } from "@/lib/types";
import { BackLink } from "../BackLink";
import { useT, useTopicText } from "../i18n";
import { ModeIcon } from "../ModeIcon";
import { ProgressBar } from "../ProgressBar";
import { NoVoiceNotice, useNorwegianVoice } from "../SpeakButton";
import { useAppState } from "../useAppState";
import { Exercise, listenTarget, RoundSummary } from "./Practice";
import { useQueue } from "./useSession";

type Props = { topics: Topic[]; inflections: InflectionTable };

/** A round that mixes every topic and every exercise type. */
export function Shuffle({ topics, inflections }: Props) {
  const { ready, date, progress, settings, activity, record } = useAppState();
  // Listening items are only mixed in when the device has a Norwegian voice,
  // so the round waits until that is known.
  const voice = useNorwegianVoice();
  const [round, setRound] = useState(0);
  const t = useT();

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <BackLink href="/">{t.shuffle.back}</BackLink>
        <div className="space-y-1">
          <h1 className="flex items-center gap-3 text-3xl font-medium">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-fjord-soft text-xl" aria-hidden>
              🔀
            </span>
            {t.shuffle.title}
          </h1>
          <p className="text-muted">{t.shuffle.description}</p>
        </div>
      </div>
      <NoVoiceNotice />
      {!ready || voice === null ? (
        <p className="text-muted">{t.common.loading}</p>
      ) : (
        <Round
          key={round}
          topics={topics}
          inflections={inflections}
          progress={progress}
          date={date}
          listen={voice}
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
  progress: Record<string, ItemProgress>;
  date: string;
  listen: boolean;
  settings: Settings;
  goal: GoalState;
  record: (itemId: string, correct: boolean) => Promise<unknown>;
  onRestart: () => void;
};

function Round({ topics, inflections, progress, date, listen, settings, goal, record, onRestart }: RoundProps) {
  const t = useT();
  const topicText = useTopicText();
  const session = useQueue<ShuffleItem>(() => {
    const { items, extra } = buildShuffleRound(topics, inflections, progress, date, { listen });
    return { queue: items, extra };
  });
  const item = session.current;
  const topicOf = (i: ShuffleItem) => topics.find((x) => x.id === i.topicId)!;

  const handleAnswer = (correct: boolean) => {
    if (!item) return;
    session.answer(item.itemId, correct);
    void record(item.itemId, correct);
  };

  // iOS only plays speech started from a tap, so a listening item is spoken by
  // the tap that leaves the item before it (see Practice).
  const next = () => {
    const nextItem = session.queue[session.index + 1];
    if (nextItem?.mode === "listen") getSpeech().speak(listenTarget(topicOf(nextItem), nextItem.itemId).text, { slow: settings.slowSpeech });
    session.next();
  };

  if (session.total === 0) return <p className="text-muted">{t.shuffle.nothing}</p>;
  if (session.done || !item) {
    return <RoundSummary results={session.results} goal={goal} onRestart={onRestart} backHref="/" backLabel={t.shuffle.back} />;
  }

  const topic = topicOf(item);
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <ProgressBar value={session.index} max={session.total} label={t.practice.sessionProgress} />
        <span className="shrink-0 text-sm font-medium tabular-nums text-muted">
          {session.index + 1} / {session.total}
        </span>
      </div>
      {session.extra && <p className="rounded-xl bg-fjord-soft px-3 py-2 text-sm text-fjord">{t.practice.extraPractice}</p>}
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-fjord-soft px-2.5 py-1 font-medium text-fjord">
          <ModeIcon mode={item.mode} className="h-4 w-4" />
          {t.modes[item.mode].title}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sunk px-2.5 py-1">
          <span aria-hidden>{topic.emoji}</span>
          {topicText(topic).title}
        </span>
      </p>
      <Exercise
        key={item.itemId}
        topic={topic}
        mode={item.mode}
        itemId={item.itemId}
        inflections={inflections}
        settings={settings}
        autoStarted={session.index > 0}
        onAnswer={handleAnswer}
        onNext={next}
      />
    </div>
  );
}
