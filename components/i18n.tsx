"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isLanguage, MESSAGES, type Language, type Messages } from "@/lib/i18n/messages";
import { TOPICS_NB } from "@/lib/i18n/topics";

// The interface language is kept in its own localStorage key, so it survives
// "Reset progress" and stays out of the progress storage adapter. Prerendered
// HTML is always English; the saved language takes over right after hydration.

const LANGUAGE_KEY = "norsk-app:language";
const listeners = new Set<() => void>();
let current: Language | null = null;

function readLanguage(): Language {
  if (current === null) {
    try {
      const saved = window.localStorage.getItem(LANGUAGE_KEY);
      current = isLanguage(saved) ? saved : "en";
    } catch {
      current = "en";
    }
  }
  return current;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Keep other open tabs in step.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== LANGUAGE_KEY) return;
    current = null;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setLanguage(language: Language) {
  current = language;
  try {
    window.localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Storage blocked (private mode): the choice lasts until the page is closed.
  }
  listeners.forEach((l) => l());
}

export function useLanguage(): Language {
  return useSyncExternalStore(subscribe, readLanguage, () => "en");
}

/** The interface text for the chosen language. */
export function useT(): Messages {
  return MESSAGES[useLanguage()];
}

/** A topic's title and description in the chosen language. */
export function useTopicText() {
  const language = useLanguage();
  return <T extends { id: string; title: string; description?: string }>(topic: T) => {
    const nb = language === "nb" ? TOPICS_NB[topic.id] : undefined;
    return { title: nb?.title ?? topic.title, description: nb?.description ?? topic.description ?? "" };
  };
}

type StringPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends (...args: never[]) => unknown
      ? never
      : StringPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageId = StringPaths<Messages>;

/** A plain interface string, for use inside server components. */
export function Msg({ id }: { id: MessageId }) {
  const t = useT();
  return id.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown>)[key], t) as string;
}

/** A topic's title or description, for use inside server components. */
export function TopicText({ id, title, description, field }: { id: string; title: string; description: string; field: "title" | "description" }) {
  return useTopicText()({ id, title, description })[field];
}

/** Keeps <html lang> in step with the interface language. */
export function HtmlLang() {
  const language = useLanguage();
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return null;
}
