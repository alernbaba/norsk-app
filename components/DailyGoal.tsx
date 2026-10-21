"use client";

import Link from "next/link";
import type { Messages } from "@/lib/i18n/messages";
import { goalState, reminderFor } from "@/lib/stats";
import type { ActivityLog, Profile, Settings } from "@/lib/types";
import { GoalRing } from "./GoalRing";
import { useT } from "./i18n";

type Props = { ready: boolean; date: string; activity: ActivityLog; profile: Profile; settings: Settings; due: number };

function reminderText(kind: "streak" | "goal" | "start", streak: number, t: Messages) {
  if (kind === "streak") return t.goal.reminderStreak(streak);
  return kind === "goal" ? t.goal.reminderGoal : t.goal.reminderStart;
}

/** Today's goal on the overview: a progress ring and, if enabled, a reminder. */
export function DailyGoal({ ready, date, activity, profile, settings, due }: Props) {
  const t = useT();
  const goal = goalState(activity, date, settings.dailyGoal);
  const reminder = ready && settings.goalReminder ? reminderFor(profile, goal, date) : null;

  return (
    <div className="sheet space-y-4 p-4">
      <div className="flex items-center gap-4">
        <GoalRing value={ready ? goal.answered : 0} goal={goal.goal} label={t.goal.ringLabel} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-medium">{t.goal.title}</h2>
            <Link href="/stats" className="shrink-0 text-sm font-medium text-fjord hover:underline">
              {t.goal.seeStats}
            </Link>
          </div>
          {ready ? (
            <>
              <p className="text-sm tabular-nums">{t.goal.progress(goal.answered, goal.goal)}</p>
              <p className={`text-sm ${goal.met ? "font-medium text-moss" : "text-muted"}`}>{goal.met ? t.goal.met : t.goal.left(goal.left)}</p>
            </>
          ) : (
            <p className="text-sm text-muted">{t.common.loading}</p>
          )}
        </div>
      </div>
      {reminder && (
        <div
          role="status"
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm ${
            reminder === "streak" ? "bg-rust-soft text-rust" : "bg-ochre-soft text-ochre"
          }`}
        >
          <p className="font-medium">
            <span aria-hidden>{reminder === "streak" ? "🔥 " : "⏰ "}</span>
            {reminderText(reminder, profile.streak, t)}
          </p>
          {due > 0 && (
            <Link href="/due" className="shrink-0 font-semibold underline-offset-2 hover:underline">
              {t.goal.practiseDue} ›
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
