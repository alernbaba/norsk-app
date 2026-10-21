import { describe, expect, it } from "vitest";
import { getInflections, getTopics } from "@/lib/content";
import { drillAnswers, inflectionForWord } from "@/lib/inflection";
import { sentenceToWords } from "@/lib/tiles";

const topics = getTopics();
const inflections = getInflections();

describe("content in data/", () => {
  it("has at least 5 topics", () => {
    expect(topics.length).toBeGreaterThanOrEqual(5);
  });

  it("covers at least 1000 words and 100 expressions", () => {
    const words = topics.flatMap((t) => t.words);
    expect(words.filter((w) => w.pos !== "phrase").length).toBeGreaterThanOrEqual(1000);
    expect(words.filter((w) => w.pos === "phrase").length).toBeGreaterThanOrEqual(100);
  });

  it("uses unique topic ids and item ids", () => {
    expect(new Set(topics.map((t) => t.id)).size).toBe(topics.length);
    const ids = topics.flatMap((t) => [...t.words, ...t.sentences, ...t.inflectionDrills].map((i) => i.id));
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dupes).toEqual([]);
  });

  for (const topic of topics) {
    describe(topic.id, () => {
      it("has the required fields", () => {
        expect(topic.title).toBeTruthy();
        expect(topic.words.length).toBeGreaterThan(0);
        expect(topic.sentences.length).toBeGreaterThanOrEqual(10);
        for (const w of topic.words) {
          expect(w.no, w.id).toBeTruthy();
          expect(w.en.length, w.id).toBeGreaterThan(0);
        }
        for (const s of topic.sentences) {
          expect(s.no.length, s.id).toBeGreaterThan(0);
          expect(s.en, s.id).toBeTruthy();
        }
      });

      it("has distractors that are single words and not part of the answer", () => {
        for (const s of topic.sentences) {
          const answer = new Set(sentenceToWords(s.no[0]).map((w) => w.toLowerCase()));
          for (const d of s.distractors) {
            expect(d.includes(" "), `${s.id}: "${d}"`).toBe(false);
            expect(answer.has(d.toLowerCase()), `${s.id}: "${d}"`).toBe(false);
          }
        }
      });

      it("has an answer in data/inflections.json for every inflection drill", () => {
        for (const d of topic.inflectionDrills) {
          expect(d.no.split("___").length, d.id).toBe(2);
          expect(drillAnswers(d, inflections).length, `${d.id} (${d.lemma}:${d.pos} ${d.form})`).toBeGreaterThan(0);
        }
      });

      it("finds inflections for nouns, verbs and adjectives with a lemma", () => {
        const missing = topic.words.filter((w) => w.lemma && ["noun", "verb", "adj"].includes(w.pos) && !inflectionForWord(w, inflections));
        expect(missing.map((w) => w.id)).toEqual([]);
      });
    });
  }
});
