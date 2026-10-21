"use client";

import { useCallback, useEffect, useState } from "react";
import { today } from "@/lib/dates";
import { recordAnswer } from "@/lib/progress";
import { DEFAULT_PROFILE, DEFAULT_SETTINGS, getStorage } from "@/lib/storage";
import type { ItemProgress, Profile, Settings } from "@/lib/types";

type State = {
  ready: boolean;
  /** Today's date, read on the client after mount so prerendered HTML never holds a stale date. */
  date: string;
  progress: Record<string, ItemProgress>;
  profile: Profile;
  settings: Settings;
};

const INITIAL: State = { ready: false, date: "", progress: {}, profile: DEFAULT_PROFILE, settings: DEFAULT_SETTINGS };

async function readState(): Promise<State> {
  const storage = getStorage();
  const [progress, profile, settings] = await Promise.all([storage.getAllProgress(), storage.getProfile(), storage.getSettings()]);
  return { ready: true, date: today(), progress, profile, settings };
}

/** Progress, streak and settings from the storage layer, loaded after mount. */
export function useAppState() {
  const [state, setState] = useState<State>(INITIAL);

  useEffect(() => {
    let active = true;
    readState().then((s) => active && setState(s));
    return () => {
      active = false;
    };
  }, []);

  const record = useCallback(async (itemId: string, correct: boolean) => {
    const storage = getStorage();
    const next = await recordAnswer(storage, itemId, correct, today());
    const profile = await storage.getProfile();
    setState((s) => ({ ...s, progress: { ...s.progress, [itemId]: next }, profile }));
    return next;
  }, []);

  const updateSettings = useCallback(async (settings: Settings) => {
    setState((s) => ({ ...s, settings }));
    await getStorage().saveSettings(settings);
  }, []);

  const reset = useCallback(async () => {
    await getStorage().reset();
    setState(await readState());
  }, []);

  return { ...state, record, updateSettings, reset };
}
