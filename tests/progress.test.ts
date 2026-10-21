import { describe, expect, it } from "vitest";
import { currentStreak, recordAnswer, topicStats, updateStreak } from "@/lib/progress";
import { DEFAULT_SETTINGS, LocalStorageAdapter, MemoryStore, STORAGE_KEY } from "@/lib/storage";
import type { Topic } from "@/lib/types";

describe("updateStreak", () => {
  it("starts at 1 on the first active day", () => {
    expect(updateStreak({ streak: 0, lastActiveDate: null }, "2026-10-21")).toEqual({ streak: 1, lastActiveDate: "2026-10-21" });
  });

  it("does not change on the same day", () => {
    const p = { streak: 3, lastActiveDate: "2026-10-21" };
    expect(updateStreak(p, "2026-10-21")).toBe(p);
  });

  it("grows on the next day, also across months", () => {
    expect(updateStreak({ streak: 3, lastActiveDate: "2026-10-21" }, "2026-10-22").streak).toBe(4);
    expect(updateStreak({ streak: 3, lastActiveDate: "2026-10-31" }, "2026-11-01").streak).toBe(4);
  });

  it("starts again after a missed day", () => {
    expect(updateStreak({ streak: 9, lastActiveDate: "2026-10-19" }, "2026-10-21")).toEqual({ streak: 1, lastActiveDate: "2026-10-21" });
  });
});

describe("currentStreak", () => {
  it("still shows yesterday's streak, but 0 after a missed day", () => {
    const p = { streak: 5, lastActiveDate: "2026-10-20" };
    expect(currentStreak(p, "2026-10-20")).toBe(5);
    expect(currentStreak(p, "2026-10-21")).toBe(5);
    expect(currentStreak(p, "2026-10-22")).toBe(0);
    expect(currentStreak({ streak: 0, lastActiveDate: null }, "2026-10-22")).toBe(0);
  });
});

describe("storage + recordAnswer", () => {
  it("saves progress per item and updates the streak", async () => {
    const storage = new LocalStorageAdapter(new MemoryStore());
    await recordAnswer(storage, "w1", true, "2026-10-21");
    await recordAnswer(storage, "w1", false, "2026-10-22");
    const all = await storage.getAllProgress();
    expect(all.w1).toMatchObject({ attempts: 2, correct: 1, box: 1, nextReview: "2026-10-22" });
    expect(await storage.getProfile()).toEqual({ streak: 2, lastActiveDate: "2026-10-22" });
    expect(await storage.getActivity()).toEqual({
      "2026-10-21": { answered: 1, correct: 1 },
      "2026-10-22": { answered: 1, correct: 0 },
    });
  });

  it("reset clears progress, streak and activity but keeps settings", async () => {
    const storage = new LocalStorageAdapter(new MemoryStore());
    const settings = { slowSpeech: true, autoPlay: true, dailyGoal: 30, goalReminder: false };
    await storage.saveSettings(settings);
    await recordAnswer(storage, "w1", true, "2026-10-21");
    await storage.reset();
    expect(await storage.getAllProgress()).toEqual({});
    expect(await storage.getProfile()).toEqual({ streak: 0, lastActiveDate: null });
    expect(await storage.getActivity()).toEqual({});
    expect(await storage.getSettings()).toEqual(settings);
  });

  it("survives corrupt stored data", async () => {
    const store = new MemoryStore();
    store.setItem(STORAGE_KEY, "{not json");
    const storage = new LocalStorageAdapter(store);
    expect(await storage.getAllProgress()).toEqual({});
    expect(await storage.getSettings()).toEqual(DEFAULT_SETTINGS);
    expect(await storage.getActivity()).toEqual({});
  });

  it("fills in new settings and activity for data saved by an older version", async () => {
    const store = new MemoryStore();
    store.setItem(STORAGE_KEY, JSON.stringify({ version: 1, progress: {}, profile: { streak: 2, lastActiveDate: "2026-10-20" }, settings: { slowSpeech: true, autoPlay: false } }));
    const storage = new LocalStorageAdapter(store);
    expect(await storage.getSettings()).toEqual({ ...DEFAULT_SETTINGS, slowSpeech: true });
    expect(await storage.getActivity()).toEqual({});
  });
});

describe("topicStats", () => {
  it("counts learned words, practised and due items", () => {
    const topic: Topic = {
      id: "t",
      title: "T",
      description: "",
      emoji: "",
      order: 1,
      words: [
        { id: "w1", no: "et eple", en: ["an apple"], pos: "noun" },
        { id: "w2", no: "en banan", en: ["a banana"], pos: "noun" },
      ],
      sentences: [{ id: "s1", en: "Hi", no: ["Hei"], distractors: [] }],
      inflectionDrills: [],
    };
    const base = { attempts: 1, correct: 1, lastSeen: "2026-10-01" };
    const stats = topicStats(
      topic,
      {
        w1: { ...base, itemId: "w1", box: 4, nextReview: "2026-11-01" },
        "w2:rev": { ...base, itemId: "w2:rev", box: 2, nextReview: "2026-10-21" },
        s1: { ...base, itemId: "s1", box: 1, nextReview: "2026-10-21" },
        "s1:listen": { ...base, itemId: "s1:listen", box: 2, nextReview: "2026-10-25" },
      },
      "2026-10-21",
    );
    // Each word counts three times among the items: once per flashcard direction
    // and once for listening. Each sentence counts twice: written and listening.
    expect(stats).toEqual({ topicId: "t", words: 2, learnedWords: 1, practised: 4, total: 8, due: 2 });
  });
});
