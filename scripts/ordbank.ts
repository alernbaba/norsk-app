// Parser for Norsk ordbank bokmål 2005 (Språkbanken, CC-BY 4.0).
//
// The download is a set of tab-separated, Latin-1 encoded text files. Two of
// them are enough to get every inflected form of a word:
//
//   lemma.txt           LOEPENR  LEMMA_ID  GRUNNFORM  ...
//                       One row per dictionary entry. Homonyms (bok "book" and
//                       bok "beech") have separate LEMMA_IDs.
//   fullformsliste.txt  LOEPENR  LEMMA_ID  OPPSLAG  TAG  PARADIGME_ID  BOY_NUMMER
//                       FRADATO  TILDATO  NORMERING
//                       One row per inflected form. TAG is a space-separated
//                       list such as "subst fem appell ent be normert" or
//                       "verb pret normert", where the first word is the word
//                       class and the rest describe the form (see boying.txt).
//                       Optional forms (boka/boken) appear as separate rows,
//                       often from different paradigms (PARADIGME_ID).

import type { AdjForms, Inflection, NounForms, VerbForms } from "../lib/types";

export type WordClass = "noun" | "verb" | "adj";

export type FullformRow = {
  lemmaId: number;
  form: string;
  tags: string[];
};

const CLASS_TAG: Record<WordClass, string> = { noun: "subst", verb: "verb", adj: "adj" };

/** Splits a tab-separated file into rows, skipping the header and blank lines. */
export function parseTsv(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "")
    .slice(1)
    .map((line) => line.split("\t"));
}

/** lemma.txt → LEMMA_ID → grunnform. */
export function parseLemmas(text: string): Map<number, string> {
  const lemmas = new Map<number, string>();
  for (const [, id, grunnform] of parseTsv(text)) {
    if (id && grunnform) lemmas.set(Number(id), grunnform);
  }
  return lemmas;
}

/** Removes valency annotations such as "<trans1>" from a TAG string. */
export function cleanTags(tag: string): string[] {
  return tag
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** fullformsliste.txt rows for the given lemma ids (or all, when ids is omitted). */
export function parseFullforms(text: string, ids?: Set<number>): FullformRow[] {
  const rows: FullformRow[] = [];
  for (const cols of parseTsv(text)) {
    const lemmaId = Number(cols[1]);
    if (ids && !ids.has(lemmaId)) continue;
    const normering = cols[8]?.trim();
    if (normering && normering !== "normert") continue;
    rows.push({ lemmaId, form: cols[2], tags: cleanTags(cols[3] ?? "") });
  }
  return rows;
}

function add(list: string[], value: string) {
  if (!list.includes(value)) list.push(value);
}

const has = (tags: string[], ...wanted: string[]) => wanted.every((t) => tags.includes(t));

/** Rows that belong to the word class (verb participles are tagged "adj" and are skipped for adjectives). */
export function rowsForClass(rows: FullformRow[], wordClass: WordClass): FullformRow[] {
  return rows.filter((r) => {
    if (r.tags[0] !== CLASS_TAG[wordClass]) return false;
    if (wordClass === "adj") return r.tags.some((t) => t === "pos" || t === "komp" || t === "sup");
    if (wordClass === "noun") return !r.tags.includes("prop");
    return true;
  });
}

const ARTICLE = { mask: "en", fem: "ei", "nøyt": "et" } as const;
const GENDER = { mask: "m", fem: "f", "nøyt": "n" } as const;

export function buildNoun(rows: FullformRow[]): NounForms {
  const forms: NounForms = { gender: [], indefSg: [], defSg: [], indefPl: [], defPl: [] };
  for (const { form, tags } of rows) {
    const g = (["mask", "fem", "nøyt"] as const).find((x) => tags.includes(x));
    if (g && !forms.gender.includes(GENDER[g])) forms.gender.push(GENDER[g]);
    if (has(tags, "ent", "ub")) add(forms.indefSg, g ? `${ARTICLE[g]} ${form}` : form);
    else if (has(tags, "ent", "be")) add(forms.defSg, form);
    else if (has(tags, "fl", "ub")) add(forms.indefPl, form);
    else if (has(tags, "fl", "be")) add(forms.defPl, form);
  }
  return forms;
}

export function buildVerb(rows: FullformRow[]): VerbForms {
  const forms: VerbForms = { infinitive: [], present: [], past: [], perfect: [], participle: [], imperative: [] };
  for (const { form, tags } of rows) {
    if (tags.includes("pass")) continue; // "spises" (passive) is not a form we drill
    if (tags.includes("inf")) add(forms.infinitive, `å ${form}`);
    else if (tags.includes("pres")) add(forms.present, form);
    else if (tags.includes("pret")) add(forms.past, form);
    else if (tags.includes("perf-part")) {
      add(forms.perfect, `har ${form}`);
      add(forms.participle, form);
    }
    else if (tags.includes("imp")) add(forms.imperative, form);
  }
  return forms;
}

export function buildAdj(rows: FullformRow[]): AdjForms {
  const forms: AdjForms = { mf: [], n: [], def: [], pl: [], comparative: [], superlative: [], superlativeDef: [] };
  const f: string[] = [];
  for (const { form, tags } of rows) {
    if (tags.includes("komp")) add(forms.comparative, form);
    else if (tags.includes("sup")) add(tags.includes("be") ? forms.superlativeDef : forms.superlative, form);
    else if (has(tags, "nøyt", "ub", "ent")) add(forms.n, form);
    else if (has(tags, "fem", "ub", "ent")) add(f, form);
    else if (has(tags, "m/f", "ub", "ent") || has(tags, "mask", "ub", "ent")) add(forms.mf, form);
    else if (tags.includes("fl")) add(forms.pl, form);
    else if (has(tags, "be", "ent")) add(forms.def, form);
    else if (tags.length === 2 && tags[1] === "pos") add(forms.mf, form); // adverb-like adjectives
  }
  // "ulik m/f" adjectives (liten/lita) list the feminine separately.
  if (f.length && f.some((x) => !forms.mf.includes(x))) forms.f = f;
  return forms;
}

export function buildInflection(rows: FullformRow[], wordClass: WordClass): Inflection {
  const own = rowsForClass(rows, wordClass);
  switch (wordClass) {
    case "noun":
      return { pos: "noun", ...buildNoun(own) };
    case "verb":
      return { pos: "verb", ...buildVerb(own) };
    case "adj":
      return { pos: "adj", ...buildAdj(own) };
  }
}

/** Number of distinct forms, used to compare homonyms. */
export function formCount(inflection: Inflection): number {
  const { pos: _pos, ...rest } = inflection; // eslint-disable-line @typescript-eslint/no-unused-vars
  return Object.entries(rest)
    .filter(([k]) => k !== "gender")
    .reduce((n, [, v]) => n + (v as string[]).length, 0);
}
