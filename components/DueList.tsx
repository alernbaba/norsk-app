"use client";

import Link from "next/link";
import type { ReviewItem, ReviewTopic } from "@/lib/content";
import { daysBetween } from "@/lib/dates";
import type { Messages } from "@/lib/i18n/messages";
import type { Mode } from "@/lib/modes";
import { BOX_INTERVALS, isDue } from "@/lib/srs";
import type { ItemProgress } from "@/lib/types";
import { useT, useTopicText } from "./i18n";
import { useAppState } from "./useAppState";

const KIND_MODE: Record<ReviewItem["kind"], Mode> = {
  word: "flashcards",
  reverse: "reverse",
  sentence: "write",
  drill: "inflection",
};

function dueLabel(p: ItemProgress, date: string, t: Messages) {
  const late = daysBetween(p.nextReview, date);
  if (p.box === 1) return t.due.missedLastTime;
  return late > 0 ? t.due.overdue(late) : t.due.dueToday;
}

export function DueList({ topics }: { topics: ReviewTopic[] }) {
  const { ready, date, progress } = useAppState();
  const t = useT();
  const topicText = useTopicText();
  const groups = topics
    .map((topic) => ({ ...topic, items: topic.items.filter((i) => progress[i.id] && isDue(progress[i.id], date)) }))
    .filter((topic) => topic.items.length > 0);
  const total = groups.reduce((n, topic) => n + topic.items.length, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          {t.due.back}
        </Link>
        <h1 className="text-2xl font-bold">
          {t.due.title} {ready && <span className="text-slate-400">({total})</span>}
        </h1>
      </div>

      <details className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-100">{t.due.whatIsDue}</summary>
        <div className="mt-2 space-y-2">
          <p>{t.due.boxesIntro}</p>
          <ul className="list-inside list-disc">
            {Object.entries(BOX_INTERVALS).map(([box, days]) => (
              <li key={box}>{t.due.boxInterval(box, days)}</li>
            ))}
          </ul>
          <p>{t.due.dueExplained}</p>
        </div>
      </details>

      {!ready ? (
        <p className="text-slate-500">{t.common.loading}</p>
      ) : groups.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {t.due.nothingDue}
        </p>
      ) : (
        <ul className="space-y-4">
          {groups.map((group) => (
            <li key={group.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="font-semibold">
                {group.emoji} {topicText(group).title} <span className="text-slate-400">({group.items.length})</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(KIND_MODE) as ReviewItem["kind"][])
                  .map((kind) => [kind, group.items.filter((i) => i.kind === kind).length] as const)
                  .filter(([, n]) => n > 0)
                  .map(([kind, n]) => (
                    <Link
                      key={kind}
                      href={`/practice/${group.id}/${KIND_MODE[kind]}`}
                      className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      {t.due.review(n, kind)}
                    </Link>
                  ))}
              </div>
              <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                {group.items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-4 py-1.5">
                    <span>
                      <span lang="nb" className="font-medium">
                        {i.no}
                      </span>
                      <span className="block text-slate-500">{i.en}</span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-slate-400">
                      {t.due.box(progress[i.id].box)}
                      <span className="block">{dueLabel(progress[i.id], date, t)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
