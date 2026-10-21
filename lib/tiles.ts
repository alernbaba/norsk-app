// Word tiles for "Build the sentence".

import type { Sentence } from "./types";

export type Tile = { key: string; text: string };

/** Splits a sentence into words, keeping punctuation off the tiles. */
export function sentenceToWords(sentence: string): string[] {
  return sentence
    .replace(/[.,!?;:"«»]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Fisher-Yates shuffle with an injectable random source for tests. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** The sentence's words plus up to `maxDistractors` wrong words, shuffled. */
export function buildTiles(sentence: Sentence, random: () => number = Math.random, maxDistractors = 4): Tile[] {
  const words = sentenceToWords(sentence.no[0]);
  const lower = new Set(words.map((w) => w.toLowerCase()));
  const distractors = shuffle(sentence.distractors, random)
    .filter((d) => !lower.has(d.toLowerCase()))
    .slice(0, maxDistractors);
  return shuffle([...words, ...distractors], random).map((text, i) => ({ key: `${i}-${text}`, text }));
}
