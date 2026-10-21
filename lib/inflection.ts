// Helpers for showing inflections and checking "Inflection" drills. Safe to use in the browser.

import type { Inflection, InflectionDrill, InflectionForm, InflectionTable, Word } from "./types";

export const FORM_LABELS: Record<InflectionForm, string> = {
  indefSg: "indefinite singular",
  defSg: "definite singular",
  indefPl: "indefinite plural",
  defPl: "definite plural",
  infinitive: "infinitive",
  present: "present",
  past: "past",
  perfect: "present perfect",
  participle: "past participle",
  imperative: "imperative",
  mf: "masculine/feminine",
  f: "feminine",
  n: "neuter",
  def: "definite",
  pl: "plural",
  comparative: "comparative",
  superlative: "superlative",
  superlativeDef: "definite superlative",
};

/** The rows shown on the back of a flashcard, in reading order. */
const DISPLAY_ORDER: Record<Inflection["pos"], InflectionForm[]> = {
  noun: ["indefSg", "defSg", "indefPl", "defPl"],
  verb: ["infinitive", "present", "past", "perfect", "imperative"],
  adj: ["mf", "f", "n", "def", "pl", "comparative", "superlative"],
};

export type InflectionRow = { form: InflectionForm; label: string; values: string[] };

export function inflectionRows(inflection: Inflection): InflectionRow[] {
  const record = inflection as unknown as Record<string, string[] | undefined>;
  return DISPLAY_ORDER[inflection.pos]
    .map((form) => ({ form, label: FORM_LABELS[form], values: record[form] ?? [] }))
    .filter((row) => row.values.length > 0);
}

export function inflectionKey(lemma: string, pos: string): string {
  return `${lemma}:${pos}`;
}

export function inflectionForWord(word: Word, table: InflectionTable): Inflection | undefined {
  if (!word.lemma || (word.pos !== "noun" && word.pos !== "verb" && word.pos !== "adj")) return undefined;
  return table[inflectionKey(word.lemma, word.pos)];
}

/** All accepted answers for a drill (several when bokmål allows more than one form). */
export function drillAnswers(drill: InflectionDrill, table: InflectionTable): string[] {
  const entry = table[inflectionKey(drill.lemma, drill.pos)] as unknown as Record<string, string[] | undefined> | undefined;
  return entry?.[drill.form] ?? [];
}

/** The hint shown after the blank, e.g. "(å spise, past)". */
export function drillHint(drill: InflectionDrill): string {
  const base = drill.pos === "verb" ? `å ${drill.lemma}` : drill.lemma;
  return `${base}, ${FORM_LABELS[drill.form]}`;
}

/** Puts a sentence's first letter in upper case (drills can start with the blank). */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
