// Leitner-box spaced repetition.
// Right answers move an item up one box; a wrong answer sends it back to box 1.

import { addDays } from "./dates";
import type { Box, ItemProgress } from "./types";

/** Days until the next review for each box. */
export const BOX_INTERVALS: Record<Box, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14 };

/** An item counts as learned from this box upwards. */
export const LEARNED_BOX: Box = 4;

export function newProgress(itemId: string, date: string): ItemProgress {
  return { itemId, attempts: 0, correct: 0, box: 1, nextReview: date, lastSeen: date };
}

export function review(
  progress: ItemProgress | undefined,
  itemId: string,
  correct: boolean,
  date: string,
): ItemProgress {
  const current = progress ?? newProgress(itemId, date);
  const box: Box = correct ? (Math.min(current.box + 1, 5) as Box) : 1;
  return {
    itemId,
    attempts: current.attempts + 1,
    correct: current.correct + (correct ? 1 : 0),
    box,
    nextReview: addDays(date, BOX_INTERVALS[box]),
    lastSeen: date,
  };
}

export function isDue(progress: ItemProgress, date: string): boolean {
  return progress.nextReview <= date;
}

export function isLearned(progress: ItemProgress | undefined): boolean {
  return !!progress && progress.box >= LEARNED_BOX;
}

export type SessionOptions = {
  /** Max new (never seen) items per session. */
  newLimit?: number;
  /** Max items in total. */
  size?: number;
};

/**
 * Picks the items for a practice session: due items first (lowest box,
 * then most overdue), then up to `newLimit` new items in content order.
 */
export function buildSession(
  itemIds: string[],
  progress: Record<string, ItemProgress>,
  date: string,
  { newLimit = 5, size = 10 }: SessionOptions = {},
): string[] {
  const due = itemIds
    .map((id) => progress[id])
    .filter((p): p is ItemProgress => !!p && isDue(p, date))
    .sort((a, b) => a.box - b.box || a.nextReview.localeCompare(b.nextReview))
    .map((p) => p.itemId);
  const fresh = itemIds.filter((id) => !progress[id]).slice(0, newLimit);
  return [...due, ...fresh].slice(0, size);
}

/** Extra practice when nothing is due: the weakest items first. */
export function buildExtraPractice(
  itemIds: string[],
  progress: Record<string, ItemProgress>,
  size = 10,
): string[] {
  return [...itemIds]
    .sort((a, b) => {
      const pa = progress[a];
      const pb = progress[b];
      return (pa?.box ?? 0) - (pb?.box ?? 0) || (pa?.nextReview ?? "").localeCompare(pb?.nextReview ?? "");
    })
    .slice(0, size);
}
