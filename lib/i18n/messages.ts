// Interface text in English and Norwegian bokmål. Content (words, sentences)
// lives in data/ and is not translated here, except topic names in topics.ts.

import type { Mode } from "../modes";
import type { InflectionForm } from "../types";

export type Language = "en" | "nb";

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: "en", label: "English" },
  { id: "nb", label: "Norsk (bokmål)" },
];

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

const en = {
  nav: { overview: "Overview", due: "Due", settings: "Settings", about: "About" },
  common: {
    loading: "Loading…",
    check: "Check",
    continue: "Continue",
    cancel: "Cancel",
  },
  overview: {
    dayStreak: "Day streak",
    wordsLearned: "Words learned",
    ofTotal: (n: number) => `of ${n}`,
    mastered: (n: number) => `${n} mastered`,
    dueToday: "Due today ›",
    topics: "Topics",
    dueBadge: (n: number) => `${n} due`,
    topicProgressLabel: (title: string) => `${title}: words learned`,
    topicLine: (learned: number, words: number, practised: number, items: number) =>
      `${learned} / ${words} words learned · ${practised} / ${items} items practised`,
  },
  topic: {
    allTopics: "← All topics",
    allWordsHeading: "All words in this topic",
    wordsLearned: "Words learned",
    learnedOf: (learned: number, total: number) => `${learned} of ${total} words learned`,
    dueToday: (n: number) => `${n} due today`,
    percentCorrect: (pct: number) => `${pct}% correct`,
    loadingProgress: "Loading progress…",
  },
  modes: {
    flashcards: { title: "Flashcards", description: "See a Norwegian word, flip the card, and say if you knew it." },
    reverse: { title: "Flashcards: English → Norwegian", description: "See the English, think of the Norwegian word, then flip the card." },
    tiles: { title: "Build the sentence", description: "Translate from English by tapping word tiles." },
    write: { title: "Write it", description: "Type the Norwegian translation yourself." },
    inflection: { title: "Inflection", description: "Fill in the right form of a word in a sentence." },
  } satisfies Record<Mode, { title: string; description: string }>,
  forms: {
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
  } satisfies Record<InflectionForm, string>,
  practice: {
    nothingInMode: "This topic has nothing to practise in this mode yet.",
    sessionProgress: "Session progress",
    extraPractice: "Nothing is due right now, so this is extra practice with your weakest items.",
    rightOf: (right: number, total: number) => `${right} of ${total} right`,
    missedComeBack: "Items you missed will come back sooner.",
    again: "Practise again",
    backTo: (title: string) => `Back to ${title}`,
    missingWord: "Type the missing word…",
    tapToSee: "Tap to see the translation",
    tapToSeeNorwegian: "Say it in Norwegian, then tap to check",
    showAnswer: "Show answer",
    didntKnow: "I didn't know it",
    knewIt: "I knew it",
    tapInOrder: "Tap the words in the right order",
    typeNorwegian: "Type in Norwegian…",
  },
  feedback: {
    correct: "Correct!",
    notQuite: "Not quite.",
    letterHint: "Tip: remember the letters æ, ø and å. You can use the buttons under the text field.",
    correctAnswer: "Correct answer: ",
    alsoAccepted: "Also accepted: ",
  },
  speech: {
    noVoice: "No Norwegian voice on this device",
    checking: "Checking for a Norwegian voice…",
    listenTitle: (text: string) => `Listen: ${text}`,
    listenLabel: (text: string) => `Listen to "${text}"`,
    noVoiceNotice:
      "Pronunciation is off: this device has no Norwegian voice. On most phones and computers you can add one under the system's language or text-to-speech settings.",
    voice: (label: string) => `Voice: ${label}`,
  },
  settings: {
    title: "Settings",
    language: "Language",
    languageDescription: "Used for menus, buttons and feedback. The words you learn are always in Norwegian and English.",
    pronunciation: "Pronunciation",
    slowSpeech: "Slow speech",
    slowSpeechDescription: "Read Norwegian more slowly. Helpful when you are starting out.",
    autoPlay: "Play automatically",
    autoPlayDescription: "Read the word aloud when a new flashcard appears.",
    tryIt: (sample: string) => `Try it: “${sample}”`,
    reset: "Reset progress",
    resetDescription: "Deletes all progress and your streak on this device. Your settings are kept. This cannot be undone.",
    resetDone: "Progress has been reset.",
    resetConfirm: "Yes, delete my progress",
    resetButton: "Reset progress…",
  },
  due: {
    back: "← Overview",
    title: "Due today",
    whatIsDue: "What makes something due?",
    boxesIntro:
      "Each word, sentence and drill you have practised sits in one of five boxes. A right answer moves it up one box, a wrong answer sends it back to box 1. The box decides when you see it again:",
    boxInterval: (box: string, days: number) =>
      `Box ${box}: ${days === 0 ? "again the same day" : `after ${days} ${plural(days, "day", "days")}`}`,
    dueExplained:
      "An item is due when its review date has come. Items you have never practised are not due; they show up as new items in practice instead. A word counts as learned once you get it right, and as mastered from box 4.",
    nothingDue: "Nothing is due right now. 🎉 Pick a topic on the overview to learn something new.",
    review: (n: number, kind: "word" | "reverse" | "sentence" | "drill") =>
      `Review ${n} ${
        { word: plural(n, "word", "words"), reverse: `${plural(n, "word", "words")} (English → Norwegian)`, sentence: plural(n, "sentence", "sentences"), drill: plural(n, "inflection drill", "inflection drills") }[kind]
      }`,
    box: (box: number) => `Box ${box}`,
    missedLastTime: "missed last time",
    overdue: (days: number) => `${days} ${plural(days, "day", "days")} overdue`,
    dueToday: "due today",
  },
};

export type Messages = typeof en;

const nb: Messages = {
  nav: { overview: "Oversikt", due: "Repetere", settings: "Innstillinger", about: "Om" },
  common: {
    loading: "Laster…",
    check: "Sjekk",
    continue: "Fortsett",
    cancel: "Avbryt",
  },
  overview: {
    dayStreak: "Dager på rad",
    wordsLearned: "Ord lært",
    ofTotal: (n) => `av ${n}`,
    mastered: (n) => `${n} mestret`,
    dueToday: "Repeter i dag ›",
    topics: "Emner",
    dueBadge: (n) => `${n} venter`,
    topicProgressLabel: (title) => `${title}: ord lært`,
    topicLine: (learned, words, practised, items) => `${learned} / ${words} ord lært · ${practised} / ${items} oppgaver øvd på`,
  },
  topic: {
    allTopics: "← Alle emner",
    allWordsHeading: "Alle ordene i dette emnet",
    wordsLearned: "Ord lært",
    learnedOf: (learned, total) => `${learned} av ${total} ord lært`,
    dueToday: (n) => `${n} å repetere i dag`,
    percentCorrect: (pct) => `${pct} % riktig`,
    loadingProgress: "Laster fremgang…",
  },
  modes: {
    flashcards: { title: "Ordkort", description: "Se et norsk ord, snu kortet og si om du kunne det." },
    reverse: { title: "Ordkort: engelsk → norsk", description: "Se det engelske ordet, tenk på det norske og snu kortet." },
    tiles: { title: "Bygg setningen", description: "Oversett fra engelsk ved å trykke på ordbrikker." },
    write: { title: "Skriv det", description: "Skriv den norske oversettelsen selv." },
    inflection: { title: "Bøying", description: "Fyll inn riktig form av et ord i en setning." },
  },
  forms: {
    indefSg: "ubestemt entall",
    defSg: "bestemt entall",
    indefPl: "ubestemt flertall",
    defPl: "bestemt flertall",
    infinitive: "infinitiv",
    present: "presens",
    past: "preteritum",
    perfect: "presens perfektum",
    participle: "perfektum partisipp",
    imperative: "imperativ",
    mf: "hankjønn/hunkjønn",
    f: "hunkjønn",
    n: "intetkjønn",
    def: "bestemt form",
    pl: "flertall",
    comparative: "komparativ",
    superlative: "superlativ",
    superlativeDef: "bestemt superlativ",
  },
  practice: {
    nothingInMode: "Dette emnet har ingenting å øve på i denne modusen ennå.",
    sessionProgress: "Fremdrift i økten",
    extraPractice: "Ingenting skal repeteres akkurat nå, så dette er ekstra øving med det du synes er vanskeligst.",
    rightOf: (right, total) => `${right} av ${total} riktige`,
    missedComeBack: "Det du bommet på, kommer tilbake raskere.",
    again: "Øv igjen",
    backTo: (title) => `Tilbake til ${title}`,
    missingWord: "Skriv ordet som mangler…",
    tapToSee: "Trykk for å se oversettelsen",
    tapToSeeNorwegian: "Si det på norsk, og trykk for å sjekke",
    showAnswer: "Vis svaret",
    didntKnow: "Jeg kunne det ikke",
    knewIt: "Jeg kunne det",
    tapInOrder: "Trykk på ordene i riktig rekkefølge",
    typeNorwegian: "Skriv på norsk…",
  },
  feedback: {
    correct: "Riktig!",
    notQuite: "Ikke helt.",
    letterHint: "Tips: husk bokstavene æ, ø og å. Du kan bruke knappene under tekstfeltet.",
    correctAnswer: "Riktig svar: ",
    alsoAccepted: "Godtas også: ",
  },
  speech: {
    noVoice: "Ingen norsk stemme på denne enheten",
    checking: "Ser etter en norsk stemme…",
    listenTitle: (text) => `Lytt: ${text}`,
    listenLabel: (text) => `Lytt til «${text}»`,
    noVoiceNotice:
      "Uttale er slått av: denne enheten har ingen norsk stemme. På de fleste telefoner og datamaskiner kan du legge til en under systemets innstillinger for språk eller tekst til tale.",
    voice: (label) => `Stemme: ${label}`,
  },
  settings: {
    title: "Innstillinger",
    language: "Språk",
    languageDescription: "Brukes i menyer, knapper og tilbakemeldinger. Ordene du lærer, er alltid på norsk og engelsk.",
    pronunciation: "Uttale",
    slowSpeech: "Sakte tale",
    slowSpeechDescription: "Les norsk saktere. Nyttig når du er nybegynner.",
    autoPlay: "Spill av automatisk",
    autoPlayDescription: "Les ordet høyt når et nytt ordkort vises.",
    tryIt: (sample) => `Prøv: «${sample}»`,
    reset: "Nullstill fremgang",
    resetDescription: "Sletter all fremgang og rekken din på denne enheten. Innstillingene beholdes. Dette kan ikke angres.",
    resetDone: "Fremgangen er nullstilt.",
    resetConfirm: "Ja, slett fremgangen min",
    resetButton: "Nullstill fremgang…",
  },
  due: {
    back: "← Oversikt",
    title: "Repeter i dag",
    whatIsDue: "Hva avgjør når noe skal repeteres?",
    boxesIntro:
      "Hvert ord, hver setning og hver øvelse du har øvd på, ligger i én av fem bokser. Et riktig svar flytter det én boks opp, et feil svar sender det tilbake til boks 1. Boksen avgjør når du ser det igjen:",
    boxInterval: (box, days) => `Boks ${box}: ${days === 0 ? "igjen samme dag" : `etter ${days} ${plural(days, "dag", "dager")}`}`,
    dueExplained:
      "Noe skal repeteres når repetisjonsdatoen er kommet. Det du aldri har øvd på, skal ikke repeteres; det dukker i stedet opp som noe nytt når du øver. Et ord regnes som lært når du har svart riktig på det, og som mestret fra boks 4.",
    nothingDue: "Ingenting skal repeteres akkurat nå. 🎉 Velg et emne i oversikten for å lære noe nytt.",
    review: (n, kind) =>
      `Repeter ${n} ${
        { word: "ord", reverse: "ord (engelsk → norsk)", sentence: plural(n, "setning", "setninger"), drill: plural(n, "bøyingsøvelse", "bøyingsøvelser") }[kind]
      }`,
    box: (box) => `Boks ${box}`,
    missedLastTime: "feil sist",
    overdue: (days) => `${days} ${plural(days, "dag", "dager")} på etterskudd`,
    dueToday: "skal repeteres i dag",
  },
};

export const MESSAGES: Record<Language, Messages> = { en, nb };

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "nb";
}
