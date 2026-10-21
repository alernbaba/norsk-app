import { describe, expect, it } from "vitest";
import { chooseVoice, norwegianVoices, pickNorwegianVoice } from "@/lib/speech";
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

describe("chooseVoice", () => {
  const nora = { lang: "nb-NO", name: "Nora", voiceURI: "com.apple.voice.compact.nb-NO.Nora" };
  const noraPlus = { lang: "nb-NO", name: "Nora (Enhanced)", voiceURI: "com.apple.voice.enhanced.nb-NO.Nora" };
  const henrik = { lang: "no-NO", name: "Henrik", voiceURI: "henrik" };
  const daniel = { lang: "en-GB", name: "Daniel", voiceURI: "daniel" };
  const all = [daniel, nora, noraPlus, henrik];

  it("lists only Norwegian voices", () => {
    expect(norwegianVoices(all).map((v) => v.name)).toEqual(["Nora", "Nora (Enhanced)", "Henrik"]);
  });

  it("uses the picked voice when the device has it", () => {
    expect(chooseVoice(all, "henrik")?.name).toBe("Henrik");
    expect(chooseVoice(all, noraPlus.voiceURI)?.name).toBe("Nora (Enhanced)");
  });

  it("falls back to the automatic choice", () => {
    expect(chooseVoice(all, null)?.name).toBe("Nora");
    expect(chooseVoice(all, "gone")?.name).toBe("Nora");
  });

  it("never picks a non-Norwegian voice, even if it was saved", () => {
    expect(chooseVoice(all, "daniel")?.name).toBe("Nora");
    expect(chooseVoice([daniel], "daniel")).toBeNull();
  });
});
