import { describe, expect, it } from "vitest";
import { loadTopics } from "@/lib/content";
import { drillHint } from "@/lib/inflection";
import { MESSAGES } from "@/lib/i18n/messages";
import { TOPICS_NB } from "@/lib/i18n/topics";

describe("interface translations", () => {
  it("has a Norwegian title and description for every topic", () => {
    const missing = loadTopics().filter((t) => !TOPICS_NB[t.id]?.title || !TOPICS_NB[t.id]?.description);
    expect(missing.map((t) => t.id)).toEqual([]);
  });

  it("has no Norwegian names for topics that don't exist", () => {
    const ids = new Set(loadTopics().map((t) => t.id));
    expect(Object.keys(TOPICS_NB).filter((id) => !ids.has(id))).toEqual([]);
  });

  it("names inflection forms in the chosen language", () => {
    const drill = { id: "d", no: "Jeg ___ fisk.", en: "I ate fish.", lemma: "spise", pos: "verb", form: "past" } as const;
    expect(drillHint(drill)).toBe("å spise, past");
    expect(drillHint(drill, MESSAGES.nb.forms)).toBe("å spise, preteritum");
  });
});
