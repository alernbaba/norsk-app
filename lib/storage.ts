// Storage layer. The rest of the app only talks to StorageAdapter, so the
// localStorage adapter can later be swapped for a database behind a login.

import { isLevelChoice } from "./levels";
import type { ActivityLog, DayActivity, ItemProgress, Profile, Settings } from "./types";

export interface StorageAdapter {
  getAllProgress(): Promise<Record<string, ItemProgress>>;
  saveProgress(progress: ItemProgress): Promise<void>;
  getProfile(): Promise<Profile>;
  saveProfile(profile: Profile): Promise<void>;
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;
  getActivity(): Promise<ActivityLog>;
  saveDayActivity(date: string, activity: DayActivity): Promise<void>;
  /** Clears progress, streak and activity. Settings are kept. */
  reset(): Promise<void>;
}

export const DEFAULT_PROFILE: Profile = { streak: 0, lastActiveDate: null };
export const DEFAULT_SETTINGS: Settings = { slowSpeech: false, autoPlay: false, dailyGoal: 20, goalReminder: true, level: "all" };

type StoredState = {
  version: 1;
  progress: Record<string, ItemProgress>;
  profile: Profile;
  settings: Settings;
  activity: ActivityLog;
};

function emptyState(settings: Settings = DEFAULT_SETTINGS): StoredState {
  return { version: 1, progress: {}, profile: { ...DEFAULT_PROFILE }, settings: { ...settings }, activity: {} };
}

/** Minimal key/value interface so tests can pass a fake instead of window.localStorage. */
export type KeyValueStore = Pick<Storage, "getItem" | "setItem">;

export const STORAGE_KEY = "norsk-app:v1";

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private store: KeyValueStore, private key = STORAGE_KEY) {}

  private read(): StoredState {
    try {
      const raw = this.store.getItem(this.key);
      if (!raw) return emptyState();
      const parsed = JSON.parse(raw) as Partial<StoredState>;
      const settings = { ...DEFAULT_SETTINGS, ...parsed.settings };
      if (!isLevelChoice(settings.level)) settings.level = DEFAULT_SETTINGS.level;
      return {
        version: 1,
        progress: parsed.progress ?? {},
        profile: { ...DEFAULT_PROFILE, ...parsed.profile },
        settings,
        activity: parsed.activity ?? {},
      };
    } catch {
      return emptyState();
    }
  }

  private write(state: StoredState): void {
    try {
      this.store.setItem(this.key, JSON.stringify(state));
    } catch {
      // Storage full or blocked (private mode): progress is simply not kept.
    }
  }

  async getAllProgress() {
    return this.read().progress;
  }

  async saveProgress(progress: ItemProgress) {
    const state = this.read();
    state.progress[progress.itemId] = progress;
    this.write(state);
  }

  async getProfile() {
    return this.read().profile;
  }

  async saveProfile(profile: Profile) {
    const state = this.read();
    state.profile = profile;
    this.write(state);
  }

  async getSettings() {
    return this.read().settings;
  }

  async saveSettings(settings: Settings) {
    const state = this.read();
    state.settings = settings;
    this.write(state);
  }

  async getActivity() {
    return this.read().activity;
  }

  async saveDayActivity(date: string, activity: DayActivity) {
    const state = this.read();
    state.activity[date] = activity;
    this.write(state);
  }

  async reset() {
    this.write(emptyState(this.read().settings));
  }
}

/** In-memory store, used on the server and in tests. */
export class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

let adapter: StorageAdapter | null = null;

/** The app-wide storage. Swap the adapter here to move to a database. */
export function getStorage(): StorageAdapter {
  if (!adapter) {
    const store = typeof window !== "undefined" ? window.localStorage : new MemoryStore();
    adapter = new LocalStorageAdapter(store);
  }
  return adapter;
}
