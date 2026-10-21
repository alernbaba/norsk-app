export type Mode = "flashcards" | "reverse" | "tiles" | "write" | "inflection" | "listen";

// Titles and descriptions are in lib/i18n/messages.ts under "modes".
export const MODES: { id: Mode; emoji: string }[] = [
  { id: "flashcards", emoji: "🃏" },
  { id: "reverse", emoji: "🔁" },
  { id: "tiles", emoji: "🧱" },
  { id: "write", emoji: "⌨️" },
  { id: "inflection", emoji: "🔤" },
  { id: "listen", emoji: "👂" },
];

/**
 * English → Norwegian flashcards have their own progress, separate from the
 * Norwegian → English direction, so each word has a second item id.
 */
const REVERSE_SUFFIX = ":rev";

export function reverseId(wordId: string): string {
  return wordId + REVERSE_SUFFIX;
}

export function wordIdFromReverse(itemId: string): string {
  return itemId.endsWith(REVERSE_SUFFIX) ? itemId.slice(0, -REVERSE_SUFFIX.length) : itemId;
}

/**
 * Listening has its own progress too: hearing a word or sentence is a different
 * skill from reading it, so each word and sentence gets a listening item id.
 */
const LISTEN_SUFFIX = ":listen";

export function listenId(itemId: string): string {
  return itemId + LISTEN_SUFFIX;
}

export function idFromListen(itemId: string): string {
  return itemId.endsWith(LISTEN_SUFFIX) ? itemId.slice(0, -LISTEN_SUFFIX.length) : itemId;
}

export function isMode(value: string): value is Mode {
  return MODES.some((m) => m.id === value);
}
