"use client";

import Link from "next/link";
import type { TopicSummary } from "@/lib/content";
import { currentStreak } from "@/lib/progress";
import { isLearned } from "@/lib/srs";
import { ProgressBar } from "./ProgressBar";
import { useAppState } from "./useAppState";

export function Overview({ topics }: { topics: TopicSummary[] }) {
  const { ready, date, progress, profile } = useAppState();
  const totalWords = topics.reduce((n, t) => n + t.wordIds.length, 0);
  const learned = topics.reduce((n, t) => n + t.wordIds.filter((id) => isLearned(progress[id])).length, 0);
  const due = topics.reduce((n, t) => n + t.itemIds.filter((id) => progress[id] && progress[id].nextReview <= date).length, 0);
  const streak = currentStreak(profile, date);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Day streak" value={ready ? `${streak} 🔥` : "–"} />
        <Stat label="Words learned" value={ready ? `${learned}` : "–"} sub={`of ${totalWords}`} />
        <Stat label="Due today" value={ready ? `${due}` : "–"} />
      </section>

      <section className="space-y-3">
        <h1 className="text-xl font-bold">Topics</h1>
        <ul className="grid gap-3 sm:grid-cols-2">
          {topics.map((t) => {
            const learnedHere = t.wordIds.filter((id) => isLearned(progress[id])).length;
            const practised = t.itemIds.filter((id) => progress[id]).length;
            const dueHere = t.itemIds.filter((id) => progress[id] && progress[id].nextReview <= date).length;
            return (
              <li key={t.id}>
                <Link
                  href={`/topics/${t.id}`}
                  className="block h-full space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">
                      <span className="mr-1.5">{t.emoji}</span>
                      {t.title}
                    </p>
                    {ready && dueHere > 0 && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                        {dueHere} due
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.description}</p>
                  <ProgressBar value={learnedHere} max={t.wordIds.length} label={`${t.title}: words learned`} />
                  <p className="text-xs text-slate-500">
                    {learnedHere} / {t.wordIds.length} words learned · {practised} / {t.itemIds.length} items practised
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
