import { describe, expect, it } from "vitest";
import { pickNorwegianVoice } from "@/lib/speech";
import { buildTiles, sentenceToWords } from "@/lib/tiles";

describe("tiles", () => {
  it("splits a sentence into words without punctuation", () => {
    expect(sentenceToWords("Hei, jeg heter Ola.")).toEqual(["Hei", "jeg", "heter", "Ola"]);
  });

  it("contains every word of the answer plus distractors that are not in the answer", () => {
    const tiles = buildTiles({ id: "s", en: "I eat an apple.", no: ["Jeg spiser et eple."], distractors: ["en", "spiser", "eplet"] });
    const texts = tiles.map((t) => t.text).sort();
    expect(texts).toEqual(["Jeg", "en", "eple", "eplet", "et", "spiser"].sort());
    expect(new Set(tiles.map((t) => t.key)).size).toBe(tiles.length);
  });
});

describe("pickNorwegianVoice", () => {
  const v = (lang: string, name = lang) => ({ lang, name });

  it("prefers a voice installed on the device", () => {
    const remote = { lang: "nb-NO", name: "Remote", localService: false };
    const local = { lang: "nb-NO", name: "Nora", localService: true };
    expect(pickNorwegianVoice([remote, local])?.name).toBe("Nora");
  });

  it("prefers nb-NO, then no-NO, then other nb/no voices", () => {
    expect(pickNorwegianVoice([v("en-US"), v("no-NO"), v("nb-NO")])?.lang).toBe("nb-NO");
    expect(pickNorwegianVoice([v("en-US"), v("no-NO")])?.lang).toBe("no-NO");
    expect(pickNorwegianVoice([v("en-GB"), v("nb")])?.lang).toBe("nb");
    expect(pickNorwegianVoice([v("nb_NO")])?.lang).toBe("nb_NO");
  });

  it("returns null without a Norwegian voice", () => {
    expect(pickNorwegianVoice([v("en-US"), v("sv-SE"), v("da-DK")])).toBeNull();
    expect(pickNorwegianVoice([])).toBeNull();
  });
});
