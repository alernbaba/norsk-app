import { describe, expect, it } from "vitest";
import { idFromListen, isMode, listenId, reverseId, wordIdFromReverse } from "@/lib/modes";
import { listenItemIds } from "@/lib/progress";
import type { Topic } from "@/lib/types";

describe("mode item ids", () => {
  it("round-trips listening and reverse ids", () => {
    expect(idFromListen(listenId("food-eple"))).toBe("food-eple");
    expect(idFromListen("food-eple")).toBe("food-eple");
    expect(wordIdFromReverse(reverseId("food-eple"))).toBe("food-eple");
    expect(listenId("w1")).not.toBe(reverseId("w1"));
  });

  it("knows the listening mode", () => {
    expect(isMode("listen")).toBe(true);
  });

  it("lists a listening item per word and sentence", () => {
    const topic = {
      words: [{ id: "w1" }, { id: "w2" }],
      sentences: [{ id: "s1" }],
    } as unknown as Topic;
    expect(listenItemIds(topic)).toEqual(["w1:listen", "w2:listen", "s1:listen"]);
  });
});
