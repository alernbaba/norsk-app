"use client";

import { useEffect, useSyncExternalStore } from "react";

// Like the interface language, the colour theme has its own localStorage key,
// so it survives "Reset progress". The script in THEME_SCRIPT applies it before
// first paint; ThemeSync keeps <html data-theme> right after that.

export type ThemeChoice = "system" | "light" | "dark";

export const THEME_CHOICES: ThemeChoice[] = ["system", "light", "dark"];

const THEME_KEY = "norsk-app:theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";
/** Browser toolbar colour per theme: the --paper colour in globals.css. */
const THEME_COLORS = { light: "#f4eee2", dark: "#11161c" };

const listeners = new Set<() => void>();
let current: ThemeChoice | null = null;

function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "system" || value === "light" || value === "dark";
}

function readTheme(): ThemeChoice {
  if (current === null) {
    try {
      const saved = window.localStorage.getItem(THEME_KEY);
      current = isThemeChoice(saved) ? saved : "system";
    } catch {
      current = "system";
    }
  }
  return current;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_KEY) return;
    current = null;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function setTheme(theme: ThemeChoice) {
  current = theme;
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage blocked (private mode): the choice lasts until the page is closed.
  }
  listeners.forEach((l) => l());
}

export function useTheme(): ThemeChoice {
  return useSyncExternalStore(subscribe, readTheme, () => "system");
}

/** Runs in <head> before the page is painted, so a saved dark theme never flashes light. */
export const THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem(${JSON.stringify(THEME_KEY)})}catch(e){}var d=t==="dark"||(t!=="light"&&matchMedia(${JSON.stringify(DARK_QUERY)}).matches);document.documentElement.dataset.theme=d?"dark":"light"})()`;

/** Keeps <html data-theme> and the toolbar colour in step with the choice and, for "system", the device. */
export function ThemeSync() {
  const theme = useTheme();
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const apply = () => {
      const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolved;
      document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", THEME_COLORS[resolved]));
    };
    apply();
    if (theme !== "system") return;
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);
  return null;
}
