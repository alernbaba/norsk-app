export type Mode = "flashcards" | "tiles" | "write" | "inflection";

// Titles and descriptions are in lib/i18n/messages.ts under "modes".
export const MODES: { id: Mode; emoji: string }[] = [
  { id: "flashcards", emoji: "🃏" },
  { id: "tiles", emoji: "🧱" },
  { id: "write", emoji: "⌨️" },
  { id: "inflection", emoji: "🔤" },
];

export function isMode(value: string): value is Mode {
  return MODES.some((m) => m.id === value);
}
