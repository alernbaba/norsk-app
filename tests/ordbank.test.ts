import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildInflection, cleanTags, parseFullforms, parseLemmas } from "../scripts/ordbank";

// A small extract of the real ordbank files (Latin-1, CRLF), with the entries for
// bok (two homonyms), spise, stor, liten, være and finnes.
const FIXTURES = path.join(__dirname, "fixtures/ordbank");
const read = (file: string) => readFileSync(path.join(FIXTURES, file)).toString("latin1");

const lemmas = parseLemmas(read("lemma.txt"));
const rows = parseFullforms(read("fullformsliste.txt"));
const rowsFor = (id: number) => rows.filter((r) => r.lemmaId === id);

describe("parsing", () => {
  it("reads lemma ids and base forms, decoding Latin-1", () => {
    expect(lemmas.get(64622)).toBe("spise");
    expect(lemmas.get(80034)).toBe("være");
    expect(lemmas.get(7999)).toBe("bok");
    expect(lemmas.get(8000)).toBe("bok");
  });

  it("removes valency annotations from tags", () => {
    expect(cleanTags("verb inf <intrans1> <trans1> <part3/i> normert")).toEqual(["verb", "inf", "normert"]);
  });

  it("can limit rows to some lemma ids", () => {
    const only = parseFullforms(read("fullformsliste.txt"), new Set([64622]));
    expect(only.length).toBeGreaterThan(0);
    expect(only.every((r) => r.lemmaId === 64622)).toBe(true);
  });
});

describe("nouns", () => {
  it("lists all allowed forms of bok, including boka/boken", () => {
    expect(buildInflection(rowsFor(8000), "noun")).toEqual({
      pos: "noun",
      gender: ["f", "m"],
      indefSg: ["ei bok", "en bok"],
      defSg: ["boka", "boken"],
      indefPl: ["bøker"],
      defPl: ["bøkene"],
    });
  });

  it("keeps homonyms apart", () => {
    expect(buildInflection(rowsFor(7999), "noun")).toMatchObject({ indefPl: ["boker"] });
  });
});

describe("verbs", () => {
  it("builds infinitive, present, past, perfect and imperative for spise", () => {
    expect(buildInflection(rowsFor(64622), "verb")).toEqual({
      pos: "verb",
      infinitive: ["å spise"],
      present: ["spiser"],
      past: ["spiste"],
      perfect: ["har spist"],
      participle: ["spist"],
      imperative: ["spis"],
    });
  });

  it("handles irregular verbs", () => {
    expect(buildInflection(rowsFor(80034), "verb")).toMatchObject({
      present: ["er"],
      past: ["var"],
      perfect: ["har vært"],
      imperative: ["vær"],
    });
  });

  it("skips passive forms and handles s-verbs", () => {
    const finnes = buildInflection(rowsFor(17088), "verb");
    expect(finnes).toMatchObject({ infinitive: expect.arrayContaining(["å finnes"]) });
    expect(JSON.stringify(finnes)).not.toContain("pass");
  });

  it("ignores rows of other word classes for the same lemma", () => {
    // "spise" also has participle rows tagged "adj"; they must not end up in the verb.
    const verb = buildInflection(rowsFor(64622), "verb");
    expect(Object.values(verb).flat()).not.toContain("spisende");
  });
});

describe("adjectives", () => {
  it("builds all forms of stor", () => {
    expect(buildInflection(rowsFor(65721), "adj")).toEqual({
      pos: "adj",
      mf: ["stor"],
      n: ["stort"],
      def: ["store"],
      pl: ["store"],
      comparative: ["større"],
      superlative: ["størst"],
      superlativeDef: ["største"],
    });
  });

  it("keeps a separate feminine and plural for liten", () => {
    const liten = buildInflection(rowsFor(41179), "adj");
    expect(liten).toMatchObject({ mf: ["liten"], pl: ["små"], comparative: ["mindre"], superlative: ["minst"] });
    expect(liten).toMatchObject({ f: expect.arrayContaining(["lita"]), def: expect.arrayContaining(["lille"]) });
  });
});
