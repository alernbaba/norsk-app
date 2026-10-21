// Tolerant answer checking for typed and tile answers.

export type CheckStatus = "correct" | "correct-with-hint" | "wrong";

export type CheckResult = {
  status: CheckStatus;
  /** The model answer to show (the first accepted variant). */
  expected: string;
};

const PUNCTUATION = /[.,!?;:"'«»“”‘’()\[\]…–—]/g;

/** Lowercase, drop punctuation and collapse whitespace. */
export function normalize(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(PUNCTUATION, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Replace æ/ø/å with the usual keyboard fallbacks ae/o/aa. */
export function foldNorwegian(text: string): string {
  return text.replace(/æ/g, "ae").replace(/ø/g, "o").replace(/å/g, "aa");
}

/**
 * Checks an answer against a list of accepted variants.
 * Exact match after normalization is correct. A match that only works once
 * æ/ø/å are written as ae/o/aa (or oe for ø) is correct with a hint.
 */
export function checkAnswer(answer: string, accepted: string[]): CheckResult {
  if (accepted.length === 0) throw new Error("checkAnswer needs at least one accepted answer");
  const expected = accepted[0];
  const given = normalize(answer);
  if (given === "") return { status: "wrong", expected };

  const variants = accepted.map(normalize);
  if (variants.includes(given)) return { status: "correct", expected };

  const folded = variants.map(foldNorwegian);
  const givenFolded = foldNorwegian(given);
  const candidates = [givenFolded, givenFolded.replace(/oe/g, "o")];
  if (candidates.some((c) => folded.includes(c))) {
    return { status: "correct-with-hint", expected };
  }
  return { status: "wrong", expected };
}

export function isCorrect(result: CheckResult): boolean {
  return result.status !== "wrong";
}
