"use client";

import Link from "next/link";
import type { TopicSummary } from "@/lib/content";
import { currentStreak } from "@/lib/progress";
import { isLearned, isMastered } from "@/lib/srs";
import { DailyGoal } from "./DailyGoal";
import { useT, useTopicText } from "./i18n";
import { ProgressBar } from "./ProgressBar";
import { useAppState } from "./useAppState";

export function Overview({ topics }: { topics: TopicSummary[] }) {
  const { ready, date, progress, profile, settings, activity } = useAppState();
  const t = useT();
  const topicText = useTopicText();
  const totalWords = topics.reduce((n, topic) => n + topic.wordIds.length, 0);
  const learned = topics.reduce((n, topic) => n + topic.wordIds.filter((id) => isLearned(progress[id])).length, 0);
  const mastered = topics.reduce((n, topic) => n + topic.wordIds.filter((id) => isMastered(progress[id])).length, 0);
  const due = topics.reduce((n, topic) => n + topic.itemIds.filter((id) => progress[id] && progress[id].nextReview <= date).length, 0);
  const streak = currentStreak(profile, date);

  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <div className="space-y-1">
          <p className="eyebrow">{t.overview.eyebrow}</p>
          <h1 className="text-4xl font-medium sm:text-5xl">
            <span lang="nb" className="italic">
              Hei
            </span>
            {t.overview.greeting}
          </h1>
        </div>
        <div className="sheet grid grid-cols-3 divide-x divide-dashed divide-line overflow-hidden">
          <Stat label={t.overview.dayStreak} value={ready ? `${streak}` : "–"} accent="text-rust" />
          <Stat
            label={t.overview.wordsLearned}
            value={ready ? `${learned}` : "–"}
            suffix={`/${totalWords}`}
            note={ready && mastered ? t.overview.mastered(mastered) : undefined}
            accent="text-fjord"
          />
          <Link href="/due" className="group transition-colors hover:bg-ochre-soft/60">
            <Stat label={t.overview.dueToday} value={ready ? `${due}` : "–"} accent="text-ochre" />
          </Link>
        </div>
        <DailyGoal ready={ready} date={date} activity={activity} profile={profile} settings={settings} due={due} />
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
          <h2 className="text-2xl font-medium">{t.overview.topics}</h2>
          <p className="text-sm text-muted tabular-nums">{t.overview.topicCount(topics.length)}</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic, i) => {
            const { title, description } = topicText(topic);
            const learnedHere = topic.wordIds.filter((id) => isLearned(progress[id])).length;
            const practised = topic.itemIds.filter((id) => progress[id]).length;
            const dueHere = topic.itemIds.filter((id) => progress[id] && progress[id].nextReview <= date).length;
            return (
              <li key={topic.id}>
                <Link
                  href={`/topics/${topic.id}`}
                  className="sheet flex h-full flex-col gap-3 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-fjord/40"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sunk text-2xl" aria-hidden>
                      {topic.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.7rem] font-semibold tracking-widest text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                      <p className="font-display text-lg leading-tight font-medium">{title}</p>
                    </div>
                    {ready && dueHere > 0 && (
                      <span className="shrink-0 rounded-full bg-ochre-soft px-2 py-0.5 text-xs font-semibold text-ochre">
                        {t.overview.dueBadge(dueHere)}
                      </span>
                    )}
                  </div>
                  <p className="flex-1 text-sm leading-snug text-muted">{description}</p>
                  <div className="space-y-1.5">
                    <ProgressBar value={learnedHere} max={topic.wordIds.length} label={t.overview.topicProgressLabel(title)} />
                    <p className="flex justify-between gap-2 text-xs text-muted tabular-nums">
                      <span>{t.overview.topicLearned(learnedHere, topic.wordIds.length)}</span>
                      <span>{t.overview.topicPractised(practised, topic.itemIds.length)}</span>
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, suffix, note, accent }: { label: string; value: string; suffix?: string; note?: string; accent: string }) {
  return (
    <div className="flex h-full flex-col items-center px-2 py-4 text-center">
      <p className={`font-display text-3xl font-medium tabular-nums sm:text-4xl ${accent}`}>
        {value}
        {suffix ? <span className="ml-0.5 font-sans text-xs font-normal text-muted">{suffix}</span> : null}
      </p>
      <p className="mt-1 text-xs leading-tight text-muted">{label}</p>
      {note ? <p className="mt-0.5 text-[0.7rem] leading-tight text-muted/80">{note}</p> : null}
    </div>
  );
}
