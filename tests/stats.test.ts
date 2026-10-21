import { describe, expect, it } from "vitest";
import { activityTotals, goalState, hardestItems, recentDays, reminderFor } from "@/lib/stats";
import type { ItemProgress } from "@/lib/types";

const log = {
  "2026-10-19": { answered: 25, correct: 20 },
  "2026-10-21": { answered: 8, correct: 6 },
};

describe("goalState", () => {
  it("counts today's answers towards the goal", () => {
    expect(goalState(log, "2026-10-21", 20)).toEqual({ answered: 8, goal: 20, left: 12, met: false });
    expect(goalState(log, "2026-10-19", 20)).toEqual({ answered: 25, goal: 20, left: 0, met: true });
    expect(goalState(log, "2026-10-22", 20)).toMatchObject({ answered: 0, left: 20 });
  });
});

describe("reminderFor", () => {
  const open = goalState({}, "2026-10-21", 20);
  it("warns about the streak when the last active day was yesterday", () => {
    expect(reminderFor({ streak: 4, lastActiveDate: "2026-10-20" }, open, "2026-10-21")).toBe("streak");
  });
  it("nudges to start or to keep going otherwise", () => {
    expect(reminderFor({ streak: 0, lastActiveDate: null }, open, "2026-10-21")).toBe("start");
    expect(reminderFor({ streak: 4, lastActiveDate: "2026-10-21" }, goalState(log, "2026-10-21", 20), "2026-10-21")).toBe("goal");
  });
  it("says nothing once the goal is met", () => {
    expect(reminderFor({ streak: 4, lastActiveDate: "2026-10-21" }, goalState(log, "2026-10-21", 5), "2026-10-21")).toBeNull();
  });
});

describe("recentDays", () => {
  it("lists every day up to today, oldest first, across months", () => {
    const days = recentDays({ "2026-11-01": { answered: 3, correct: 2 } }, "2026-11-02", 4);
    expect(days.map((d) => d.date)).toEqual(["2026-10-30", "2026-10-31", "2026-11-01", "2026-11-02"]);
    expect(days[2]).toEqual({ date: "2026-11-01", answered: 3, correct: 2 });
    expect(days[3]).toEqual({ date: "2026-11-02", answered: 0, correct: 0 });
  });
});

describe("activityTotals", () => {
  it("adds up answers, active days and days the goal was met", () => {
    expect(activityTotals({ ...log, "2026-10-20": { answered: 0, correct: 0 } }, 20)).toEqual({
      answered: 33,
      correct: 26,
      activeDays: 2,
      goalDays: 1,
    });
  });
});

describe("hardestItems", () => {
  const p = (itemId: string, attempts: number, correct: number): ItemProgress => ({
    itemId,
    attempts,
    correct,
    box: 1,
    nextReview: "2026-10-21",
    lastSeen: "2026-10-21",
  });

  it("ranks by smoothed miss rate and leaves out items never missed", () => {
    const progress = { a: p("a", 1, 0), b: p("b", 4, 1), c: p("c", 10, 5), d: p("d", 3, 3) };
    expect(hardestItems(progress).map((h) => h.itemId)).toEqual(["b", "a", "c"]);
    expect(hardestItems(progress)[0]).toEqual({ itemId: "b", attempts: 4, missed: 3 });
    expect(hardestItems(progress, 1)).toHaveLength(1);
  });
});
