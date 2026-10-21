// Shared types for content (data/) and progress (lib/storage.ts).

export type PartOfSpeech = "noun" | "verb" | "adj" | "phrase" | "other";

export type Word = {
  id: string;
  /** Norwegian as shown on the card, e.g. "et eple" or "å spise". */
  no: string;
  /** Accepted English translations; the first one is shown. */
  en: string[];
  pos: PartOfSpeech;
  /** Dictionary form used to look up inflections, e.g. "eple". */
  lemma?: string;
  /** Picks one entry in Norsk ordbank when the lemma has homonyms. */
  ordbankId?: number;
};

export type Sentence = {
  id: string;
  en: string;
  /** Accepted Norwegian answers; the first is used for tiles and as the model answer. */
  no: string[];
  /** Wrong words mixed into the tiles. */
  distractors: string[];
};

export type InflectionDrill = {
  id: string;
  /** Norwegian sentence with "___" where the form goes. */
  no: string;
  en: string;
  lemma: string;
  pos: "noun" | "verb" | "adj";
  form: InflectionForm;
};

export type Topic = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  /** Position in the topic list. */
  order: number;
  words: Word[];
  sentences: Sentence[];
  inflectionDrills: InflectionDrill[];
};

export type NounForms = {
  gender: ("m" | "f" | "n")[];
  indefSg: string[];
  defSg: string[];
  indefPl: string[];
  defPl: string[];
};

export type VerbForms = {
  infinitive: string[];
  present: string[];
  past: string[];
  /** With "har": "har spist". */
  perfect: string[];
  /** Without "har": "spist". */
  participle: string[];
  imperative: string[];
};

export type AdjForms = {
  mf: string[];
  /** Only for adjectives with a separate feminine form (liten → lita). */
  f?: string[];
  n: string[];
  /** Definite singular: "den store bilen". */
  def: string[];
  /** Plural: "store biler". */
  pl: string[];
  comparative: string[];
  superlative: string[];
  /** Definite superlative: "den største". */
  superlativeDef: string[];
};

export type Inflection = (
  | ({ pos: "noun" } & NounForms)
  | ({ pos: "verb" } & VerbForms)
  | ({ pos: "adj" } & AdjForms)
) & {
  /** LEMMA_ID in Norsk ordbank. */
  ordbankId?: number;
};

export type InflectionForm =
  | Exclude<keyof NounForms, "gender">
  | keyof VerbForms
  | keyof AdjForms;

/** Keyed by "lemma:pos", e.g. "spise:verb". */
export type InflectionTable = Record<string, Inflection>;

export type ItemKind = "word" | "sentence" | "drill";

export type Box = 1 | 2 | 3 | 4 | 5;

export type ItemProgress = {
  itemId: string;
  attempts: number;
  correct: number;
  box: Box;
  /** ISO date (YYYY-MM-DD) when the item is due again. */
  nextReview: string;
  lastSeen: string;
};

export type Profile = {
  streak: number;
  lastActiveDate: string | null;
};

export type Settings = {
  slowSpeech: boolean;
  autoPlay: boolean;
};
