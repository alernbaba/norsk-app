// Shuffle mode: one round mixing every topic and every exercise type.

import { drillAnswers } from "./inflection";
import { idFromListen, listenId, reverseId, wordIdFromReverse, type Mode } from "./modes";
import { isDue } from "./srs";
import type { InflectionTable, ItemProgress, Topic } from "./types";

/** One practice item and the exercise it is shown in. */
export type ShuffleItem = { itemId: string; topicId: string; mode: Mode };

/** A practice item before its exercise is picked: sentences can be shown as tiles or as "Write it". */
type Candidate = { itemId: string; topicId: string; modes: Mode[] };

/**
 * Every practice item in the given topics, with the exercises it can be shown in.
 * Drills without inflection data are left out, as in the inflection mode.
 */
function candidates(topics: Topic[], inflections: InflectionTable, { listen }: { listen: boolean }): Candidate[] {
  return topics.flatMap((t) => [
    ...t.words.map((w): Candidate => ({ itemId: w.id, topicId: t.id, modes: ["flashcards"] })),
    ...t.words.map((w): Candidate => ({ itemId: reverseId(w.id), topicId: t.id, modes: ["reverse"] })),
    ...t.sentences.map((s): Candidate => ({ itemId: s.id, topicId: t.id, modes: ["tiles", "write"] })),
    ...t.inflectionDrills
      .filter((d) => drillAnswers(d, inflections).length > 0)
      .map((d): Candidate => ({ itemId: d.id, topicId: t.id, modes: ["inflection"] })),
    ...(listen
      ? [...t.words, ...t.sentences].map((x): Candidate => ({ itemId: listenId(x.id), topicId: t.id, modes: ["listen"] }))
      : []),
  ]);
}

/** The word or sentence behind an item, so its flashcard and listening items count as one. */
function baseId(itemId: string): string {
  return wordIdFromReverse(idFromListen(itemId));
}

export function shuffled<T>(items: T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type ShuffleOptions = {
  size?: number;
  /** Max new (never seen) items per round. */
  newLimit?: number;
  /** Include listening items (off when the device has no Norwegian voice). */
  listen?: boolean;
  random?: () => number;
};

export type ShuffleRound = { items: ShuffleItem[]; extra: boolean };

/**
 * Picks a mixed round across all topics: due items first (lowest box, then most
 * overdue), then new items picked at random from every topic. When nothing is
 * due or new, it is extra practice with the weakest items. Each word or sentence
 * appears at most once, so the flashcard doesn't give away the listening answer.
 * The picked items are shuffled, and each sentence gets tiles or "Write it" at random.
 */
export function buildShuffleRound(
  topics: Topic[],
  inflections: InflectionTable,
  progress: Record<string, ItemProgress>,
  date: string,
  { size = 15, newLimit = 8, listen = true, random = Math.random }: ShuffleOptions = {},
): ShuffleRound {
  // Shuffle first so ties (same box, same date, or all new) are broken at random.
  const all = shuffled(candidates(topics, inflections, { listen }), random);
  const due = all
    .filter((c) => progress[c.itemId] && isDue(progress[c.itemId], date))
    .sort((a, b) => progress[a.itemId].box - progress[b.itemId].box || progress[a.itemId].nextReview.localeCompare(progress[b.itemId].nextReview));
  const fresh = all.filter((c) => !progress[c.itemId]);

  const picked: Candidate[] = [];
  const used = new Set<string>();
  const take = (list: Candidate[], limit: number) => {
    let n = 0;
    for (const c of list) {
      if (picked.length >= size || n >= limit) break;
      if (used.has(baseId(c.itemId))) continue;
      used.add(baseId(c.itemId));
      picked.push(c);
      n++;
    }
  };
  take(due, size);
  take(fresh, newLimit);

  let extra = false;
  if (picked.length === 0) {
    extra = true;
    const weakest = [...all].sort((a, b) => {
      const pa = progress[a.itemId];
      const pb = progress[b.itemId];
      return (pa?.box ?? 0) - (pb?.box ?? 0) || (pa?.nextReview ?? "").localeCompare(pb?.nextReview ?? "");
    });
    take(weakest, size);
  }

  return {
    extra,
    items: shuffled(picked, random).map((c) => ({
      itemId: c.itemId,
      topicId: c.topicId,
      mode: c.modes[Math.floor(random() * c.modes.length)],
    })),
  };
}
