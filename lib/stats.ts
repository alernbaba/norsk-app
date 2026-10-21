// Daily goal and statistics, computed from the activity log and item progress.

import { addDays } from "./dates";
import type { ActivityLog, DayActivity, ItemProgress, Profile } from "./types";

export const GOAL_CHOICES = [10, 20, 30, 50] as const;

const NO_ACTIVITY: DayActivity = { answered: 0, correct: 0 };

export function dayActivity(log: ActivityLog, date: string): DayActivity {
  return log[date] ?? NO_ACTIVITY;
}

export type GoalState = {
  answered: number;
  goal: number;
  /** Answers still needed today; 0 once the goal is met. */
  left: number;
  met: boolean;
};

export function goalState(log: ActivityLog, date: string, goal: number): GoalState {
  const answered = dayActivity(log, date).answered;
  return { answered, goal, left: Math.max(0, goal - answered), met: answered >= goal };
}

/**
 * The reminder to show on the overview, if any. "streak" when the streak ends
 * unless the learner practises today, "goal" when they have started today but
 * not reached the goal yet, "start" when nothing has been done today.
 */
export function reminderFor(profile: Profile, goal: GoalState, date: string): "streak" | "goal" | "start" | null {
  if (goal.met) return null;
  if (profile.streak > 0 && profile.lastActiveDate === addDays(date, -1)) return "streak";
  return goal.answered > 0 ? "goal" : "start";
}

export type DayPoint = DayActivity & { date: string };

/** The last `days` days up to and including `date`, oldest first, with empty days filled in. */
export function recentDays(log: ActivityLog, date: string, days: number): DayPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const d = addDays(date, i - days + 1);
    return { date: d, ...dayActivity(log, d) };
  });
}

export type ActivityTotals = {
  answered: number;
  correct: number;
  /** Days with at least one answer. */
  activeDays: number;
  /** Days on which the given goal was met. */
  goalDays: number;
};

export function activityTotals(log: ActivityLog, goal: number): ActivityTotals {
  const days = Object.values(log);
  return {
    answered: days.reduce((n, d) => n + d.answered, 0),
    correct: days.reduce((n, d) => n + d.correct, 0),
    activeDays: days.filter((d) => d.answered > 0).length,
    goalDays: days.filter((d) => d.answered >= goal).length,
  };
}

export type HardItem = { itemId: string; attempts: number; missed: number };

/**
 * Items missed most often, relative to how often they were tried. The rate is
 * smoothed so one miss in one try doesn't outrank three misses in four.
 */
export function hardestItems(progress: Record<string, ItemProgress>, limit = 10): HardItem[] {
  const score = (h: HardItem) => (h.missed + 1) / (h.attempts + 2);
  return Object.values(progress)
    .map((p) => ({ itemId: p.itemId, attempts: p.attempts, missed: p.attempts - p.correct }))
    .filter((h) => h.missed > 0)
    .sort((a, b) => score(b) - score(a) || b.missed - a.missed || a.itemId.localeCompare(b.itemId))
    .slice(0, limit);
}
