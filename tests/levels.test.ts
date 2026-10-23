import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getTopics, topicLevel, topicSummaries } from "@/lib/content";
import { matchesLevel } from "@/lib/levels";
import { DEFAULT_SETTINGS, LocalStorageAdapter, MemoryStore, STORAGE_KEY } from "@/lib/storage";
import type { InflectionTable } from "@/lib/types";

const read = (file: string) => JSON.parse(readFileSync(path.join(process.cwd(), "data", file), "utf8")) as InflectionTable;

describe("levels", () => {
  it("treats topics without a level as A1–A2", () => {
    expect(topicLevel({})).toBe("a1-a2");
    expect(topicLevel({ level: "b1-b2" })).toBe("b1-b2");
  });

  it("has B1–B2 topics after the A1–A2 topics", () => {
    const levels = getTopics().map(topicLevel);
    expect(levels.filter((l) => l === "b1-b2").length).toBeGreaterThanOrEqual(5);
    expect(levels.indexOf("b1-b2")).toBeGreaterThan(levels.lastIndexOf("a1-a2"));
  });

  it("filters topics by the chosen level", () => {
    const summaries = topicSummaries();
    const shown = (choice: "all" | "a1-a2" | "b1-b2") => summaries.filter((t) => matchesLevel(t.level, choice)).length;
    expect(shown("all")).toBe(summaries.length);
    expect(shown("a1-a2") + shown("b1-b2")).toBe(summaries.length);
    expect(shown("b1-b2")).toBeGreaterThan(0);
  });

  it("shows all levels by default, also for settings saved before levels existed", async () => {
    expect(DEFAULT_SETTINGS.level).toBe("all");
    const store = new MemoryStore();
    store.setItem(STORAGE_KEY, JSON.stringify({ settings: { slowSpeech: true } }));
    expect((await new LocalStorageAdapter(store).getSettings()).level).toBe("all");
    store.setItem(STORAGE_KEY, JSON.stringify({ settings: { level: "c1" } }));
    expect((await new LocalStorageAdapter(store).getSettings()).level).toBe("all");
  });
});

describe("hand-written inflections in data/inflections-pending.json", () => {
  const pending = read("inflections-pending.json");
  const ordbank = read("inflections.json");
  const used = new Set(
    getTopics().flatMap((t) => [
      ...t.words.filter((w) => w.lemma).map((w) => `${w.lemma}:${w.pos}`),
      ...t.inflectionDrills.map((d) => `${d.lemma}:${d.pos}`),
    ]),
  );

  it("only covers words that are used and not yet imported from the ordbank", () => {
    expect(Object.keys(pending).filter((k) => !used.has(k) || ordbank[k])).toEqual([]);
  });

  it("puts the article on indefinite singular nouns and «har» on the perfect", () => {
    for (const [key, entry] of Object.entries(pending)) {
      if (entry.pos === "noun") for (const f of entry.indefSg) expect(f, key).toMatch(/^(en|ei|et) /);
      if (entry.pos === "verb") for (const f of entry.perfect) expect(f, key).toMatch(/^har /);
    }
  });
});
