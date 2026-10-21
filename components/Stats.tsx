"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReviewItem, ReviewTopic } from "@/lib/content";
import { activityTotals, hardestItems, recentDays, type DayPoint } from "@/lib/stats";
import { KIND_MODE } from "./DueList";
import { useLanguage, useT, useTopicText } from "./i18n";
import { useAppState } from "./useAppState";

const RANGES = [14, 30] as const;
type Range = (typeof RANGES)[number];

export function Stats({ topics }: { topics: ReviewTopic[] }) {
  const { ready, date, progress, settings, activity } = useAppState();
  const [range, setRange] = useState<Range>(14);
  const t = useT();
  const topicText = useTopicText();

  const totals = activityTotals(activity, settings.dailyGoal);
  const accuracy = totals.answered > 0 ? Math.round((totals.correct / totals.answered) * 100) : null;
  const days = ready ? recentDays(activity, date, range) : [];

  const items = new Map<string, { item: ReviewItem; topic: ReviewTopic }>();
  for (const topic of topics) for (const item of topic.items) items.set(item.id, { item, topic });
  const hardest = hardestItems(progress, 25)
    .filter((h) => items.has(h.itemId))
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="eyebrow">{t.stats.eyebrow}</p>
        <h1 className="text-4xl font-medium">{t.stats.title}</h1>
      </div>

      <div className="sheet grid grid-cols-2 gap-px overflow-hidden bg-line sm:grid-cols-4">
        <Tile label={t.stats.answered} value={ready ? `${totals.answered}` : "–"} accent="text-fjord" />
        <Tile label={t.stats.accuracy} value={ready && accuracy !== null ? `${accuracy} %` : "–"} accent="text-moss" />
        <Tile label={t.stats.activeDays} value={ready ? `${totals.activeDays}` : "–"} accent="text-ochre" />
        <Tile label={t.stats.goalDays} value={ready ? `${totals.goalDays}` : "–"} accent="text-rust" />
      </div>

      <section className="sheet space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-medium">{t.stats.chartTitle}</h2>
          <fieldset className="flex gap-1 rounded-xl bg-sunk p-1">
            <legend className="sr-only">{t.stats.range}</legend>
            {RANGES.map((r) => (
              <label
                key={r}
                className="cursor-pointer rounded-lg px-3 py-1 text-sm font-semibold text-muted transition has-checked:bg-card has-checked:text-ink has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-fjord"
              >
                <input type="radio" name="range" value={r} checked={range === r} onChange={() => setRange(r)} className="sr-only" />
                {t.stats.days(r)}
              </label>
            ))}
          </fieldset>
        </div>
        {!ready ? (
          <p className="text-sm text-muted">{t.common.loading}</p>
        ) : (
          <DayChart days={days} goal={settings.dailyGoal} />
        )}
        <p className="text-xs text-muted">{t.stats.since}</p>
      </section>

      <section className="space-y-3">
        <div className="space-y-1 border-b border-line pb-2">
          <h2 className="text-2xl font-medium">{t.stats.hardest}</h2>
          <p className="text-sm text-muted">{t.stats.hardestIntro}</p>
        </div>
        {!ready ? (
          <p className="text-muted">{t.common.loading}</p>
        ) : hardest.length === 0 ? (
          <p className="sheet p-5 text-muted">{t.stats.noHardest}</p>
        ) : (
          <ol className="sheet divide-y divide-dashed divide-line px-4">
            {hardest.map((h, i) => {
              const { item, topic } = items.get(h.itemId)!;
              const mode = KIND_MODE[item.kind];
              return (
                <li key={h.itemId} className="flex items-center gap-3 py-3">
                  <span className="w-5 shrink-0 text-xs font-semibold text-muted tabular-nums">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span lang="nb" className="font-display text-base font-medium">
                      {item.no}
                    </span>
                    <span className="block truncate text-sm text-muted">{item.en}</span>
                    <span className="block text-xs text-muted">
                      {topic.emoji} {topicText(topic).title} · {t.modes[mode].title}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block rounded-full bg-rust-soft px-2 py-0.5 text-xs font-semibold text-rust tabular-nums">
                      {t.stats.missed(h.missed, h.attempts)}
                    </span>
                    <Link href={`/practice/${topic.id}/${mode}`} className="mt-1 inline-block text-sm font-medium text-fjord hover:underline">
                      {t.stats.practise} ›
                    </Link>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex flex-col items-center bg-card px-2 py-4 text-center">
      <p className={`font-display text-3xl font-medium tabular-nums ${accent}`}>{value}</p>
      <p className="mt-1 text-xs leading-tight text-muted">{label}</p>
    </div>
  );
}

/** Stacked bars of right and wrong answers per day, with the daily goal as a dashed line. */
function DayChart({ days, goal }: { days: DayPoint[]; goal: number }) {
  const t = useT();
  const language = useLanguage();
  const format = new Intl.DateTimeFormat(language === "nb" ? "nb-NO" : "en-GB", { day: "numeric", month: "short" });
  const label = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return format.format(new Date(y, m - 1, d));
  };
  const answered = days.reduce((n, d) => n + d.answered, 0);
  const correct = days.reduce((n, d) => n + d.correct, 0);
  const scale = Math.max(goal, ...days.map((d) => d.answered)) * 1.1;
  const pct = (n: number) => `${(n / scale) * 100}%`;
  const labelEvery = days.length > 14 ? 7 : days.length > 7 ? 3 : 1;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex h-44 items-end gap-[3px] sm:gap-1" role="img" aria-label={t.stats.chartSummary(days.length, answered, correct)}>
          {days.map((d) => (
            <div key={d.date} className="flex h-full flex-1 flex-col justify-end" title={t.stats.dayLabel(label(d.date), d.answered, d.correct)}>
              {d.answered > 0 ? (
                <>
                  <div className="rounded-t-[3px] bg-rust/70" style={{ height: pct(d.answered - d.correct) }} />
                  <div className={`bg-moss ${d.answered === d.correct ? "rounded-t-[3px]" : ""}`} style={{ height: pct(d.correct) }} />
                </>
              ) : (
                <div className="h-[2px] rounded-full bg-line" />
              )}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-ochre" style={{ bottom: pct(goal) }} aria-hidden>
          <span className="absolute -top-5 right-0 rounded bg-card/90 px-1 text-[0.65rem] font-semibold text-ochre">{goal}</span>
        </div>
        {answered === 0 && (
          <p className="absolute inset-x-0 top-1/3 px-6 text-center text-sm text-muted">{t.stats.noActivity}</p>
        )}
      </div>
      <div className="flex gap-[3px] text-[0.65rem] text-muted tabular-nums sm:gap-1" aria-hidden>
        {days.map((d, i) => (
          <span key={d.date} className="flex-1 overflow-visible text-center whitespace-nowrap">
            {(days.length - 1 - i) % labelEvery === 0 ? label(d.date) : ""}
          </span>
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-moss" aria-hidden />
          {t.stats.correct}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-rust/70" aria-hidden />
          {t.stats.wrong}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="w-4 border-t-2 border-dashed border-ochre" aria-hidden />
          {t.stats.goalLine(goal)}
        </li>
      </ul>
    </div>
  );
}
