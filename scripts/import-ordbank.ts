// Builds data/inflections.json from Norsk ordbank, only for the words used in data/topics/.
//
//   npm run import:ordbank
//
// Expects the unpacked ordbank files in data/raw/ordbank/ (lemma.txt and
// fullformsliste.txt are required). Words that are not found are logged and
// written to data/inflections-missing.txt.
//
// Homonyms: when a lemma has several entries of the same word class (bok
// "book" / bok "beech"), set "ordbankId" on the word in the topic file to pick
// one. Without it, the entry whose forms are most common wins if
// data/raw/frequency.txt ("word count" per line) exists, otherwise the entry
// with the most forms. Every such choice is logged.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Inflection, InflectionTable, Topic } from "../lib/types";
import {
  buildInflection,
  formCount,
  parseFullforms,
  parseLemmas,
  rowsForClass,
  type FullformRow,
  type WordClass,
} from "./ordbank";

const ROOT = path.resolve(__dirname, "..");
const RAW = path.join(ROOT, "data/raw/ordbank");
const TOPICS = path.join(ROOT, "data/topics");
const OUT = path.join(ROOT, "data/inflections.json");
const MISSING = path.join(ROOT, "data/inflections-missing.txt");
const FREQUENCY = path.join(ROOT, "data/raw/frequency.txt");

type Wanted = { lemma: string; pos: WordClass; ordbankId?: number; usedIn: Set<string> };

function readLatin1(file: string): string {
  const full = path.join(RAW, file);
  if (!existsSync(full)) {
    console.error(`Missing ${path.relative(ROOT, full)}. Download Norsk ordbank bokmål 2005 and unpack it into data/raw/ordbank/.`);
    process.exit(1);
  }
  return readFileSync(full).toString("latin1");
}

function collectWanted(): Map<string, Wanted> {
  const wanted = new Map<string, Wanted>();
  const want = (lemma: string, pos: WordClass, where: string, ordbankId?: number) => {
    const key = `${lemma}:${pos}`;
    const entry = wanted.get(key) ?? { lemma, pos, usedIn: new Set<string>() };
    if (ordbankId) entry.ordbankId = ordbankId;
    entry.usedIn.add(where);
    wanted.set(key, entry);
  };
  for (const file of readdirSync(TOPICS).filter((f) => f.endsWith(".json"))) {
    const topic = JSON.parse(readFileSync(path.join(TOPICS, file), "utf8")) as Topic;
    for (const w of topic.words) {
      if (w.lemma && (w.pos === "noun" || w.pos === "verb" || w.pos === "adj")) want(w.lemma, w.pos, w.id, w.ordbankId);
    }
    for (const d of topic.inflectionDrills) want(d.lemma, d.pos, d.id);
  }
  return wanted;
}

function loadFrequency(): Map<string, number> | null {
  if (!existsSync(FREQUENCY)) return null;
  const freq = new Map<string, number>();
  for (const line of readFileSync(FREQUENCY, "utf8").split(/\r?\n/)) {
    const [word, count] = line.trim().split(/\s+/);
    if (word && count) freq.set(word.toLowerCase(), Number(count));
  }
  return freq;
}

function main() {
  const wanted = collectWanted();
  console.log(`Looking up ${wanted.size} lemmas from data/topics/ …`);

  const lemmas = parseLemmas(readLatin1("lemma.txt"));
  const idsByForm = new Map<string, number[]>();
  for (const [id, grunnform] of lemmas) {
    const key = grunnform.toLowerCase();
    idsByForm.set(key, [...(idsByForm.get(key) ?? []), id]);
  }

  const candidateIds = new Set<number>();
  for (const w of wanted.values()) {
    for (const id of idsByForm.get(w.lemma.toLowerCase()) ?? []) candidateIds.add(id);
    if (w.ordbankId) candidateIds.add(w.ordbankId);
  }

  const rowsById = new Map<number, FullformRow[]>();
  for (const row of parseFullforms(readLatin1("fullformsliste.txt"), candidateIds)) {
    rowsById.set(row.lemmaId, [...(rowsById.get(row.lemmaId) ?? []), row]);
  }

  const frequency = loadFrequency();
  const score = (rows: FullformRow[]) =>
    frequency ? [...new Set(rows.map((r) => r.form.toLowerCase()))].reduce((s, f) => s + (frequency.get(f) ?? 0), 0) : 0;

  const table: InflectionTable = {};
  const missing: string[] = [];
  const ambiguous: string[] = [];

  for (const [key, w] of [...wanted].sort(([a], [b]) => a.localeCompare(b, "nb"))) {
    const ids = w.ordbankId ? [w.ordbankId] : idsByForm.get(w.lemma.toLowerCase()) ?? [];
    const candidates = ids
      .map((id) => ({ id, rows: rowsForClass(rowsById.get(id) ?? [], w.pos) }))
      .filter((c) => c.rows.length > 0)
      .map((c) => ({ ...c, inflection: buildInflection(c.rows, w.pos), score: score(c.rows) }));

    if (candidates.length === 0) {
      missing.push(`${key}\t(used in ${[...w.usedIn].join(", ")})`);
      continue;
    }

    candidates.sort((a, b) => b.score - a.score || formCount(b.inflection) - formCount(a.inflection) || a.id - b.id);
    const chosen = candidates[0];
    if (candidates.length > 1) {
      const describe = (c: (typeof candidates)[number]) => `${c.id} [${sample(c.inflection)}]`;
      ambiguous.push(`${key}: chose ${describe(chosen)}; other: ${candidates.slice(1).map(describe).join("; ")}`);
    }
    table[key] = { ...chosen.inflection, ordbankId: chosen.id };
  }

  writeFileSync(OUT, JSON.stringify(table, null, 2) + "\n");
  writeFileSync(
    MISSING,
    missing.length
      ? `# Words not found in Norsk ordbank. Fix the lemma or pos in data/topics/, then run npm run import:ordbank again.\n${missing.join("\n")}\n`
      : "# All words were found in Norsk ordbank.\n",
  );

  console.log(`Wrote ${Object.keys(table).length} entries to ${path.relative(ROOT, OUT)}.`);
  if (ambiguous.length) {
    console.log(`\n${ambiguous.length} lemmas had several ordbank entries. Set "ordbankId" on the word to override:`);
    for (const line of ambiguous) console.log(`  ${line}`);
  }
  if (missing.length) {
    console.log(`\n${missing.length} lemmas were NOT found (also written to ${path.relative(ROOT, MISSING)}):`);
    for (const line of missing) console.log(`  ${line}`);
  } else {
    console.log("All lemmas were found.");
  }
}

function sample(inflection: Inflection): string {
  const { pos: _pos, ...rest } = inflection; // eslint-disable-line @typescript-eslint/no-unused-vars
  return Object.entries(rest)
    .filter(([k]) => k !== "gender")
    .flatMap(([, v]) => v as string[])
    .slice(0, 5)
    .join(", ");
}

main();
