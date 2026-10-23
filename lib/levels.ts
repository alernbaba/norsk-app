// CEFR levels for topics. Safe to use in the browser.

import type { Level, LevelChoice, Topic } from "./types";

export const LEVEL_CHOICES: LevelChoice[] = ["all", "a1-a2", "b1-b2"];

export function isLevelChoice(value: unknown): value is LevelChoice {
  return LEVEL_CHOICES.includes(value as LevelChoice);
}

export function topicLevel(topic: Pick<Topic, "level">): Level {
  return topic.level ?? "a1-a2";
}

/** Whether a topic at `level` is shown when the user has picked `choice`. */
export function matchesLevel(level: Level, choice: LevelChoice): boolean {
  return choice === "all" || level === choice;
}
