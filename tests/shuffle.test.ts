import { describe, expect, it } from "vitest";
import { buildShuffleRound, shuffled } from "@/lib/shuffle";
import type { InflectionTable, ItemProgress, Topic } from "@/lib/types";

function topic(id: string, words: number, sentences: number): Topic {
  return {
    id,
    title: id,
    description: "",
    emoji: "",
    order: 0,
    words: Array.from({ length: words }, (_, i) => ({ id: `${id}-w${i}`, no: `ord${i}`, en: [`word${i}`], pos: "other" })),
    sentences: Array.from({ length: sentences }, (_, i) => ({ id: `${id}-s${i}`, no: [`setning ${i}`], en: `sentence ${i}`, distractors: [] })),
    inflectionDrills: [
      { id: `${id}-d0`, no: "Jeg ___ nå.", en: "I eat now.", lemma: "spise", pos: "verb", form: "present" },
      { id: `${id}-d1`, no: "Jeg ___ nå.", en: "I run now.", lemma: "springe", pos: "verb", form: "present" },
    ],
  };
}

const inflections = { "spise:verb": { pos: "verb", present: ["spiser"] } } as unknown as InflectionTable;
const topics = [topic("a", 6, 4), topic("b", 6, 4), topic("c", 6, 4)];
const base = (id: string) => id.replace(/:(rev|listen)$/, "");

function seeded(seed: number) {
  return () => {
    seed = (seed * 1103515245 + 12345) % 2 ** 31;
    return seed / 2 ** 31;
  };
}

function progress(itemId: string, box: ItemProgress["box"], nextReview: string): ItemProgress {
  return { itemId, attempts: 1, correct: 1, box, nextReview, lastSeen: "2026-01-01" };
}

describe("shuffle round", () => {
  it("shuffles without losing items", () => {
    expect(shuffled([1, 2, 3, 4, 5], seeded(1)).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("puts due items first, then new ones, from every topic", () => {
    const p = {
      "a-w0": progress("a-w0", 1, "2026-01-01"),
      "b-s1": progress("b-s1", 2, "2026-01-01"),
      "c-w2:listen": progress("c-w2:listen", 3, "2026-01-01"),
      "c-w3": progress("c-w3", 3, "2026-12-01"),
    };
    const { items, extra } = buildShuffleRound(topics, inflections, p, "2026-06-01", { size: 10, newLimit: 7, random: seeded(2) });
    expect(extra).toBe(false);
    expect(items).toHaveLength(10);
    const ids = items.map((i) => i.itemId);
    expect(ids).toEqual(expect.arrayContaining(["a-w0", "b-s1", "c-w2:listen"]));
    expect(ids).not.toContain("c-w3");
    expect(ids.filter((id) => !p[id as keyof typeof p])).toHaveLength(7);
  });

  it("mixes exercise types and never repeats a word or sentence", () => {
    const modes = new Set<string>();
    for (let seed = 1; seed < 20; seed++) {
      const { items } = buildShuffleRound(topics, inflections, {}, "2026-06-01", { size: 15, newLimit: 15, random: seeded(seed) });
      expect(new Set(items.map((i) => base(i.itemId))).size).toBe(items.length);
      items.forEach((i) => modes.add(i.mode));
      expect(items.map((i) => i.itemId)).not.toContain("a-d1");
    }
    expect([...modes].sort()).toEqual(["flashcards", "inflection", "listen", "reverse", "tiles", "write"]);
  });

  it("leaves out listening when there is no voice", () => {
    const { items } = buildShuffleRound(topics, inflections, {}, "2026-06-01", { size: 40, newLimit: 40, listen: false, random: seeded(3) });
    expect(items.some((i) => i.mode === "listen")).toBe(false);
  });

  it("falls back to the weakest items when nothing is due or new", () => {
    const one = [topic("a", 2, 0)];
    one[0].inflectionDrills = [];
    const p = Object.fromEntries(
      ["a-w0", "a-w0:rev", "a-w0:listen", "a-w1", "a-w1:rev", "a-w1:listen"].map((id) => [id, progress(id, id === "a-w1:rev" ? 2 : 5, "2026-12-01")]),
    );
    const { items, extra } = buildShuffleRound(one, inflections, p, "2026-06-01", { size: 1, random: seeded(4) });
    expect(extra).toBe(true);
    expect(items.map((i) => i.itemId)).toEqual(["a-w1:rev"]);
  });
});
