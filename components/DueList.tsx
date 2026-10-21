"use client";

import Link from "next/link";
import type { ReviewItem, ReviewTopic } from "@/lib/content";
import { daysBetween } from "@/lib/dates";
import type { Messages } from "@/lib/i18n/messages";
import type { Mode } from "@/lib/modes";
import { BOX_INTERVALS, isDue } from "@/lib/srs";
import type { ItemProgress } from "@/lib/types";
import { BackLink } from "./BackLink";
import { useT, useTopicText } from "./i18n";
import { useAppState } from "./useAppState";

export const KIND_MODE: Record<ReviewItem["kind"], Mode> = {
  word: "flashcards",
  reverse: "reverse",
  sentence: "write",
  drill: "inflection",
  listen: "listen",
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
      <div className="space-y-3">
        <BackLink href="/">{t.due.back}</BackLink>
        <div className="space-y-1">
          <p className="eyebrow">{t.due.eyebrow}</p>
          <h1 className="flex items-baseline gap-3 text-4xl font-medium">
            {t.due.title}
            {ready && <span className="rounded-full bg-ochre-soft px-2.5 py-0.5 font-sans text-base font-semibold text-ochre tabular-nums">{total}</span>}
          </h1>
        </div>
      </div>

      <details className="group rounded-2xl border border-dashed border-line p-4 text-sm text-muted">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-ink [&::-webkit-details-marker]:hidden">
          {t.due.whatIsDue}
          <span aria-hidden className="text-muted transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <div className="mt-3 space-y-2 leading-relaxed">
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
        <p className="text-muted">{t.common.loading}</p>
      ) : groups.length === 0 ? (
        <p className="sheet p-5 text-muted">
          {t.due.nothingDue}
        </p>
      ) : (
        <ul className="space-y-4">
          {groups.map((group) => (
            <li key={group.id} className="sheet space-y-3 p-4">
              <h2 className="flex items-center gap-2 text-lg font-medium">
                <span aria-hidden>{group.emoji}</span> {topicText(group).title}
                <span className="font-sans text-sm font-normal text-muted tabular-nums">· {group.items.length}</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(KIND_MODE) as ReviewItem["kind"][])
                  .map((kind) => [kind, group.items.filter((i) => i.kind === kind).length] as const)
                  .filter(([, n]) => n > 0)
                  .map(([kind, n]) => (
                    <Link
                      key={kind}
                      href={`/practice/${group.id}/${KIND_MODE[kind]}`}
                      className="btn btn-fjord px-3 py-1.5 text-sm"
                    >
                      {t.due.review(n, kind)}
                    </Link>
                  ))}
              </div>
              <ul className="divide-y divide-dashed divide-line text-sm">
                {group.items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-4 py-1.5">
                    <span>
                      <span lang="nb" className="font-display text-base font-medium">
                        {i.no}
                      </span>
                      <span className="block text-muted">{i.en}</span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-muted">
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
