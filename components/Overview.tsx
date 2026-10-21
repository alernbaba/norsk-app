"use client";

import Link from "next/link";
import type { TopicSummary } from "@/lib/content";
import { currentStreak } from "@/lib/progress";
import { isLearned, isMastered } from "@/lib/srs";
import { useT, useTopicText } from "./i18n";
import { ProgressBar } from "./ProgressBar";
import { useAppState } from "./useAppState";

export function Overview({ topics }: { topics: TopicSummary[] }) {
  const { ready, date, progress, profile } = useAppState();
  const t = useT();
  const topicText = useTopicText();
  const totalWords = topics.reduce((n, topic) => n + topic.wordIds.length, 0);
  const learned = topics.reduce((n, topic) => n + topic.wordIds.filter((id) => isLearned(progress[id])).length, 0);
  const mastered = topics.reduce((n, topic) => n + topic.wordIds.filter((id) => isMastered(progress[id])).length, 0);
  const due = topics.reduce((n, topic) => n + topic.itemIds.filter((id) => progress[id] && progress[id].nextReview <= date).length, 0);
  const streak = currentStreak(profile, date);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-3 gap-3">
        <Stat label={t.overview.dayStreak} value={ready ? `${streak} 🔥` : "–"} />
        <Stat
          label={t.overview.wordsLearned}
          value={ready ? `${learned}` : "–"}
          sub={`${t.overview.ofTotal(totalWords)}${ready && mastered ? ` · ${t.overview.mastered(mastered)}` : ""}`}
        />
        <Link href="/due" className="block rounded-2xl transition hover:ring-2 hover:ring-emerald-400">
          <Stat label={t.overview.dueToday} value={ready ? `${due}` : "–"} />
        </Link>
      </section>

      <section className="space-y-3">
        <h1 className="text-xl font-bold">{t.overview.topics}</h1>
        <ul className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => {
            const { title, description } = topicText(topic);
            const learnedHere = topic.wordIds.filter((id) => isLearned(progress[id])).length;
            const practised = topic.itemIds.filter((id) => progress[id]).length;
            const dueHere = topic.itemIds.filter((id) => progress[id] && progress[id].nextReview <= date).length;
            return (
              <li key={topic.id}>
                <Link
                  href={`/topics/${topic.id}`}
                  className="block h-full space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">
                      <span className="mr-1.5">{topic.emoji}</span>
                      {title}
                    </p>
                    {ready && dueHere > 0 && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                        {t.overview.dueBadge(dueHere)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
                  <ProgressBar value={learnedHere} max={topic.wordIds.length} label={t.overview.topicProgressLabel(title)} />
                  <p className="text-xs text-slate-500">
                    {t.overview.topicLine(learnedHere, topic.wordIds.length, practised, topic.itemIds.length)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-slate-500">
        {label}
        {sub ? ` ${sub}` : ""}
      </p>
    </div>
  );
}
