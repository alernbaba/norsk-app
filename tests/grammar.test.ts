import { describe, expect, it } from "vitest";
import { loadGrammar, loadTopics } from "@/lib/content";

const grammar = loadGrammar();
const topicIds = new Set(loadTopics().map((t) => t.id));

describe("grammar tips in data/grammar/", () => {
  it("belong to topics that exist", () => {
    expect(grammar.map((g) => g.topicId).filter((id) => !topicIds.has(id))).toEqual([]);
  });

  it("has tips for every topic", () => {
    const covered = new Set(grammar.map((g) => g.topicId));
    expect([...topicIds].filter((id) => !covered.has(id))).toEqual([]);
  });

  it("uses one file per topic and unique tip ids", () => {
    const topics = grammar.map((g) => g.topicId);
    expect(new Set(topics).size).toBe(topics.length);
    const ids = grammar.flatMap((g) => g.tips.map((t) => t.id));
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
  });

  for (const tip of grammar.flatMap((g) => g.tips)) {
    it(`${tip.id} is complete in English and Norwegian`, () => {
      for (const lang of ["en", "nb"] as const) {
        expect(tip.title[lang], lang).toBeTruthy();
        expect(tip.text[lang].length, lang).toBeGreaterThan(0);
      }
      expect(tip.examples.length).toBeGreaterThan(0);
      for (const e of tip.examples) expect(e.no && e.en, e.no).toBeTruthy();
    });

    it(`${tip.id} closes every *bold* mark`, () => {
      const texts = [...tip.text.en, ...tip.text.nb, ...tip.examples.map((e) => e.no)];
      expect(texts.filter((t) => t.split("*").length % 2 === 0)).toEqual([]);
    });
  }
});
