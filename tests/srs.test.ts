import { describe, expect, it } from "vitest";
import { BOX_INTERVALS, buildExtraPractice, buildSession, isDue, isLearned, isMastered, newProgress, review } from "@/lib/srs";
import type { ItemProgress } from "@/lib/types";

const DAY = "2026-10-21";

describe("review", () => {
  it("starts new items in box 1 and moves them to box 2 when right", () => {
    const p = review(undefined, "w1", true, DAY);
    expect(p).toMatchObject({ itemId: "w1", attempts: 1, correct: 1, box: 2, nextReview: "2026-10-22", lastSeen: DAY });
  });

  it("keeps a wrong new item in box 1, due today", () => {
    const p = review(undefined, "w1", false, DAY);
    expect(p).toMatchObject({ attempts: 1, correct: 0, box: 1, nextReview: DAY });
  });

  it("moves up one box per right answer, with growing intervals", () => {
    let p: ItemProgress | undefined;
    const boxes: number[] = [];
    const next: string[] = [];
    for (let i = 0; i < 5; i++) {
      p = review(p, "w1", true, DAY);
      boxes.push(p.box);
      next.push(p.nextReview);
    }
    expect(boxes).toEqual([2, 3, 4, 5, 5]);
    expect(next).toEqual(["2026-10-22", "2026-10-24", "2026-10-28", "2026-11-04", "2026-11-04"]);
    expect(p!.attempts).toBe(5);
    expect(p!.correct).toBe(5);
  });

  it("sends an item back to box 1 when it is wrong", () => {
    const p = review({ ...newProgress("w1", DAY), box: 4, attempts: 3, correct: 3 }, "w1", false, DAY);
    expect(p).toMatchObject({ box: 1, nextReview: DAY, attempts: 4, correct: 3 });
  });

  it("has increasing intervals", () => {
    const values = Object.values(BOX_INTERVALS);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });
});

describe("isDue / isLearned", () => {
  it("is due on and after the review date", () => {
    const p = { ...newProgress("w1", DAY), nextReview: "2026-10-22" };
    expect(isDue(p, DAY)).toBe(false);
    expect(isDue(p, "2026-10-22")).toBe(true);
    expect(isDue(p, "2026-11-01")).toBe(true);
  });

  it("counts an item as learned after a right answer, and mastered from box 4", () => {
    expect(isLearned(undefined)).toBe(false);
    expect(isLearned(newProgress("w", DAY))).toBe(false);
    expect(isLearned(review(undefined, "w", true, DAY))).toBe(true);
    expect(isLearned(review(review(undefined, "w", true, DAY), "w", false, DAY))).toBe(false);
    expect(isMastered({ ...newProgress("w", DAY), box: 3 })).toBe(false);
    expect(isMastered({ ...newProgress("w", DAY), box: 4 })).toBe(true);
  });
});

describe("buildSession", () => {
  const ids = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const p = (itemId: string, box: ItemProgress["box"], nextReview: string): ItemProgress => ({
    ...newProgress(itemId, DAY),
    box,
    nextReview,
  });

  it("takes due items first, weakest box first, then new items", () => {
    const progress = {
      a: p("a", 3, "2026-10-20"),
      b: p("b", 1, DAY),
      c: p("c", 2, "2026-10-30"), // not due
    };
    expect(buildSession(ids, progress, DAY, { newLimit: 2, size: 10 })).toEqual(["b", "a", "d", "e"]);
  });

  it("puts struggling items before new ones and respects the size", () => {
    const progress = { h: p("h", 1, DAY) };
    expect(buildSession(ids, progress, DAY, { newLimit: 5, size: 3 })).toEqual(["h", "a", "b"]);
  });

  it("returns nothing when all items are learned ahead of time", () => {
    const progress = Object.fromEntries(ids.map((id) => [id, p(id, 5, "2026-12-01")]));
    expect(buildSession(ids, progress, DAY)).toEqual([]);
  });

  it("offers extra practice with the weakest items when nothing is due", () => {
    const progress = {
      a: p("a", 5, "2026-12-01"),
      b: p("b", 2, "2026-10-25"),
      c: p("c", 3, "2026-10-26"),
    };
    expect(buildExtraPractice(["a", "b", "c"], progress, 2)).toEqual(["b", "c"]);
  });
});
