export type Mode = "flashcards" | "tiles" | "write" | "inflection";

export const MODES: { id: Mode; title: string; description: string; emoji: string }[] = [
  { id: "flashcards", title: "Flashcards", description: "See a Norwegian word, flip the card, and say if you knew it.", emoji: "🃏" },
  { id: "tiles", title: "Build the sentence", description: "Translate from English by tapping word tiles.", emoji: "🧱" },
  { id: "write", title: "Write it", description: "Type the Norwegian translation yourself.", emoji: "⌨️" },
  { id: "inflection", title: "Inflection", description: "Fill in the right form of a word in a sentence.", emoji: "🔤" },
];

export function isMode(value: string): value is Mode {
  return MODES.some((m) => m.id === value);
}
