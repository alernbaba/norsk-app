"use client";

import Link from "next/link";
import type { ReviewItem, ReviewTopic } from "@/lib/content";
import { daysBetween } from "@/lib/dates";
import type { Mode } from "@/lib/modes";
import { BOX_INTERVALS, isDue } from "@/lib/srs";
import type { ItemProgress } from "@/lib/types";
import { useAppState } from "./useAppState";

const KIND_MODE: Record<ReviewItem["kind"], { mode: Mode; label: string }> = {
  word: { mode: "flashcards", label: "words" },
  sentence: { mode: "write", label: "sentences" },
  drill: { mode: "inflection", label: "inflection drills" },
};

function dueLabel(p: ItemProgress, date: string) {
  const late = daysBetween(p.nextReview, date);
  if (p.box === 1) return "missed last time";
  return late > 0 ? `${late} ${late === 1 ? "day" : "days"} overdue` : "due today";
}

export function DueList({ topics }: { topics: ReviewTopic[] }) {
  const { ready, date, progress } = useAppState();
  const groups = topics
    .map((t) => ({ ...t, items: t.items.filter((i) => progress[i.id] && isDue(progress[i.id], date)) }))
    .filter((t) => t.items.length > 0);
  const total = groups.reduce((n, t) => n + t.items.length, 0);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          ← Overview
        </Link>
        <h1 className="text-2xl font-bold">Due today {ready && <span className="text-slate-400">({total})</span>}</h1>
      </div>

      <details className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <summary className="cursor-pointer font-semibold text-slate-800 dark:text-slate-100">What makes something due?</summary>
        <div className="mt-2 space-y-2">
          <p>
            Each word, sentence and drill you have practised sits in one of five boxes. A right answer moves it up one
            box, a wrong answer sends it back to box 1. The box decides when you see it again:
          </p>
          <ul className="list-inside list-disc">
            {Object.entries(BOX_INTERVALS).map(([box, days]) => (
              <li key={box}>
                Box {box}: {days === 0 ? "again the same day" : `after ${days} ${days === 1 ? "day" : "days"}`}
              </li>
            ))}
          </ul>
          <p>
            An item is due when its review date has come. Items you have never practised are not due; they show up as
            new items in practice instead. A word counts as learned once you get it right, and as mastered from box 4.
          </p>
        </div>
      </details>

      {!ready ? (
        <p className="text-slate-500">Loading…</p>
      ) : groups.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Nothing is due right now. 🎉 Pick a topic on the overview to learn something new.
        </p>
      ) : (
        <ul className="space-y-4">
          {groups.map((t) => (
            <li key={t.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <h2 className="font-semibold">
                {t.emoji} {t.title} <span className="text-slate-400">({t.items.length})</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(KIND_MODE) as ReviewItem["kind"][])
                  .map((kind) => [kind, t.items.filter((i) => i.kind === kind).length] as const)
                  .filter(([, n]) => n > 0)
                  .map(([kind, n]) => (
                    <Link
                      key={kind}
                      href={`/practice/${t.id}/${KIND_MODE[kind].mode}`}
                      className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Review {n} {KIND_MODE[kind].label}
                    </Link>
                  ))}
              </div>
              <ul className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
                {t.items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-4 py-1.5">
                    <span>
                      <span lang="nb" className="font-medium">
                        {i.no}
                      </span>
                      <span className="block text-slate-500">{i.en}</span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-slate-400">
                      Box {progress[i.id].box}
                      <span className="block">{dueLabel(progress[i.id], date)}</span>
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
