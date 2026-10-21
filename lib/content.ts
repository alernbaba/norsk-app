// Loads topics and inflections from data/. Server-side only (reads files at build time).

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { listenId, reverseId } from "./modes";
import { topicItemIds } from "./progress";
import type { GrammarTip, InflectionTable, Topic, TopicGrammar } from "./types";

let topicsCache: Topic[] | null = null;
let inflectionsCache: InflectionTable | null = null;
let grammarCache: TopicGrammar[] | null = null;

export function loadTopics(): Topic[] {
  return readdirSync(path.join(process.cwd(), "data", "topics"))
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(path.join(process.cwd(), "data", "topics", f), "utf8")) as Topic)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title));
}

export function getTopics(): Topic[] {
  if (!topicsCache) topicsCache = loadTopics();
  return topicsCache;
}

export function getTopic(id: string): Topic | undefined {
  return getTopics().find((t) => t.id === id);
}

export function getInflections(): InflectionTable {
  if (!inflectionsCache) {
    try {
      inflectionsCache = JSON.parse(readFileSync(path.join(process.cwd(), "data", "inflections.json"), "utf8")) as InflectionTable;
    } catch {
      inflectionsCache = {};
    }
  }
  return inflectionsCache;
}

export function loadGrammar(): TopicGrammar[] {
  const dir = path.join(process.cwd(), "data", "grammar");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")) as TopicGrammar);
}

/** Grammar tips for one topic, or an empty list. */
export function grammarForTopic(topicId: string): GrammarTip[] {
  if (!grammarCache) grammarCache = loadGrammar();
  return grammarCache.find((g) => g.topicId === topicId)?.tips ?? [];
}

/** Only the inflections a topic needs, so pages don't ship the whole table. */
export function inflectionsForTopic(topic: Topic): InflectionTable {
  const all = getInflections();
  const keys = new Set<string>();
  for (const w of topic.words) if (w.lemma) keys.add(`${w.lemma}:${w.pos}`);
  for (const d of topic.inflectionDrills) keys.add(`${d.lemma}:${d.pos}`);
  return Object.fromEntries([...keys].filter((k) => all[k]).map((k) => [k, all[k]]));
}

/** Small per-topic summary for the overview page. */
export type TopicSummary = Pick<Topic, "id" | "title" | "description" | "emoji"> & {
  wordIds: string[];
  itemIds: string[];
};

export function topicSummaries(): TopicSummary[] {
  return getTopics().map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    emoji: t.emoji,
    wordIds: t.words.map((w) => w.id),
    itemIds: topicItemIds(t),
  }));
}

export type ReviewItem = { id: string; kind: "word" | "reverse" | "sentence" | "drill" | "listen"; no: string; en: string };
export type ReviewTopic = Pick<Topic, "id" | "title" | "emoji"> & { items: ReviewItem[] };

/** Every practice item with its display text, for the "due today" list. */
export function reviewTopics(): ReviewTopic[] {
  return getTopics().map((t) => ({
    id: t.id,
    title: t.title,
    emoji: t.emoji,
    items: [
      ...t.words.map((w): ReviewItem => ({ id: w.id, kind: "word", no: w.no, en: w.en.join(", ") })),
      ...t.words.map((w): ReviewItem => ({ id: reverseId(w.id), kind: "reverse", no: w.no, en: w.en.join(", ") })),
      ...t.sentences.map((s): ReviewItem => ({ id: s.id, kind: "sentence", no: s.no[0], en: s.en })),
      ...t.inflectionDrills.map((d): ReviewItem => ({ id: d.id, kind: "drill", no: d.no, en: d.en })),
      ...t.words.map((w): ReviewItem => ({ id: listenId(w.id), kind: "listen", no: w.no, en: w.en.join(", ") })),
      ...t.sentences.map((s): ReviewItem => ({ id: listenId(s.id), kind: "listen", no: s.no[0], en: s.en })),
    ],
  }));
}
