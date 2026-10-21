// Recording answers, streaks and per-topic statistics on top of the storage layer.

import { daysBetween } from "./dates";
import { isLearned, review } from "./srs";
import type { StorageAdapter } from "./storage";
import type { ItemProgress, Profile, Topic } from "./types";

/** Updates the streak for activity on `date`. */
export function updateStreak(profile: Profile, date: string): Profile {
  if (profile.lastActiveDate === date) return profile;
  if (profile.lastActiveDate && daysBetween(profile.lastActiveDate, date) === 1) {
    return { streak: profile.streak + 1, lastActiveDate: date };
  }
  return { streak: 1, lastActiveDate: date };
}

/** The streak to show: 0 once a whole day has been missed. */
export function currentStreak(profile: Profile, date: string): number {
  if (!profile.lastActiveDate) return 0;
  return daysBetween(profile.lastActiveDate, date) <= 1 ? profile.streak : 0;
}

export async function recordAnswer(
  storage: StorageAdapter,
  itemId: string,
  correct: boolean,
  date: string,
): Promise<ItemProgress> {
  const all = await storage.getAllProgress();
  const next = review(all[itemId], itemId, correct, date);
  await storage.saveProgress(next);
  await storage.saveProfile(updateStreak(await storage.getProfile(), date));
  return next;
}

export type TopicStats = {
  topicId: string;
  words: number;
  learnedWords: number;
  /** Items (words, sentences, drills) practised at least once. */
  practised: number;
  total: number;
  /** Items due for review today, among those already practised. */
  due: number;
};

export function topicItemIds(topic: Topic): string[] {
  return [
    ...topic.words.map((w) => w.id),
    ...topic.sentences.map((s) => s.id),
    ...topic.inflectionDrills.map((d) => d.id),
  ];
}

export function topicStats(topic: Topic, progress: Record<string, ItemProgress>, date: string): TopicStats {
  const ids = topicItemIds(topic);
  return {
    topicId: topic.id,
    words: topic.words.length,
    learnedWords: topic.words.filter((w) => isLearned(progress[w.id])).length,
    practised: ids.filter((id) => progress[id]).length,
    total: ids.length,
    due: ids.filter((id) => progress[id] && progress[id].nextReview <= date).length,
  };
}
