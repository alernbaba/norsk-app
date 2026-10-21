// Text-to-speech behind one small interface, so the browser's speechSynthesis
// can later be replaced with a cloud service (Google Cloud TTS, Azure).

export type SpeakOptions = { slow?: boolean };

/** A Norwegian voice the device offers, for the voice picker in Settings. */
export type VoiceOption = { id: string; name: string; lang: string };

export interface SpeechEngine {
  /** Resolves once we know whether a Norwegian voice exists. */
  ready(): Promise<boolean>;
  isAvailable(): boolean;
  /** The chosen voice, e.g. "Nora (nb-NO)", for troubleshooting. */
  voiceLabel(): string | null;
  /** All Norwegian voices on the device. */
  voices(): VoiceOption[];
  /** The voice the user picked, or null for the automatic choice. */
  preferredVoice(): string | null;
  setPreferredVoice(id: string | null): void;
  /** Calls back when the voice list or the chosen voice changes. */
  subscribe(onChange: () => void): () => void;
  speak(text: string, options?: SpeakOptions): void;
}

const LANG_PREFERENCE = ["nb-no", "no-no"];

type VoiceLike = Pick<SpeechSynthesisVoice, "lang" | "name"> & { localService?: boolean; voiceURI?: string };

const isLocal = (v: VoiceLike) => v.localService !== false;
const langOf = (v: VoiceLike) => v.lang.toLowerCase().replace("_", "-");
const voiceId = (v: VoiceLike) => v.voiceURI || v.name;

/** Every Norwegian voice (nb or no), never voices for other languages. */
export function norwegianVoices<V extends VoiceLike>(voices: V[]): V[] {
  return voices.filter((v) => /^(nb|no)\b/.test(langOf(v)));
}

/**
 * The voice to use: the user's pick if the device still has it (and it is
 * Norwegian), otherwise the automatic choice.
 */
export function chooseVoice<V extends VoiceLike>(voices: V[], preferredId: string | null): V | null {
  const preferred = preferredId ? norwegianVoices(voices).find((v) => voiceId(v) === preferredId) : undefined;
  return preferred ?? pickNorwegianVoice(voices);
}

/** Picks the best Norwegian voice: nb-NO, then no-NO, then anything starting with nb/no. */
export function pickNorwegianVoice<V extends VoiceLike>(voices: V[]): V | null {
  const lang = langOf;
  // Prefer voices installed on the device over network ones.
  voices = [...voices].sort((x, y) => Number(isLocal(y)) - Number(isLocal(x)));
  for (const pref of LANG_PREFERENCE) {
    const match = voices.find((v) => lang(v) === pref);
    if (match) return match;
  }
  return norwegianVoices(voices)[0] ?? null;
}

// The picked voice is kept per device (voices differ between devices), apart
// from the progress storage.
const VOICE_KEY = "norsk-app:voice";

function readPreferredVoice(): string | null {
  try {
    return window.localStorage.getItem(VOICE_KEY);
  } catch {
    return null;
  }
}

export const NORMAL_RATE = 1;
export const SLOW_RATE = 0.7;

class BrowserSpeech implements SpeechEngine {
  private voice: SpeechSynthesisVoice | null = null;
  private readyPromise: Promise<boolean> | null = null;
  private current: SpeechSynthesisUtterance | null = null;
  private preferred: string | null | undefined;
  private listeners = new Set<() => void>();
  private watching = false;

  private synth(): SpeechSynthesis | null {
    return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  }

  ready(): Promise<boolean> {
    if (this.readyPromise) return this.readyPromise;
    const synth = this.synth();
    if (!synth) return (this.readyPromise = Promise.resolve(false));

    this.readyPromise = new Promise((resolve) => {
      const tryPick = () => this.pick() !== null;
      if (tryPick()) return resolve(true);
      // The voice list loads asynchronously. Safari on iOS often never fires
      // voiceschanged, so poll as well as listening for the event.
      const finish = (ok: boolean) => {
        synth.removeEventListener("voiceschanged", onChange);
        clearInterval(poll);
        clearTimeout(timeout);
        // Let a later page try again if the voices simply weren't loaded yet.
        if (!ok) this.readyPromise = null;
        resolve(ok);
      };
      const onChange = () => tryPick() && finish(true);
      synth.addEventListener("voiceschanged", onChange);
      const poll = setInterval(onChange, 250);
      const timeout = setTimeout(() => finish(tryPick()), 5000);
    });
    // Better voices can show up after the first one (iOS loads them in steps).
    if (!this.watching) {
      this.watching = true;
      synth.addEventListener("voiceschanged", () => {
        this.pick();
        this.notify();
      });
    }
    return this.readyPromise;
  }

  private pick() {
    const synth = this.synth();
    if (this.preferred === undefined) this.preferred = readPreferredVoice();
    this.voice = synth ? chooseVoice(synth.getVoices(), this.preferred) : null;
    return this.voice;
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  voices() {
    const synth = this.synth();
    if (!synth) return [];
    return norwegianVoices(synth.getVoices()).map((v) => ({ id: voiceId(v), name: v.name, lang: v.lang }));
  }

  preferredVoice() {
    if (this.preferred === undefined) this.preferred = readPreferredVoice();
    return this.preferred;
  }

  setPreferredVoice(id: string | null) {
    this.preferred = id;
    try {
      if (id) window.localStorage.setItem(VOICE_KEY, id);
      else window.localStorage.removeItem(VOICE_KEY);
    } catch {
      // Storage blocked: the choice lasts until the page is closed.
    }
    this.pick();
    this.notify();
  }

  subscribe(onChange: () => void) {
    this.listeners.add(onChange);
    return () => {
      this.listeners.delete(onChange);
    };
  }

  isAvailable() {
    return this.voice !== null;
  }

  voiceLabel() {
    return this.voice ? `${this.voice.name} (${this.voice.lang})` : null;
  }

  speak(text: string, { slow = false }: SpeakOptions = {}) {
    const synth = this.synth();
    // Never fall back to a non-Norwegian voice: wrong pronunciation is worse than none.
    if (!synth || !this.voice) return;
    // On iOS, cancel() right before speak() can swallow the new utterance,
    // so only cancel when something is actually playing.
    if (synth.speaking || synth.pending) synth.cancel();
    // Safari sometimes leaves the queue paused, after which nothing plays.
    if (synth.paused) synth.resume();
    this.say(synth, text, slow ? SLOW_RATE : NORMAL_RATE, true);
  }

  /**
   * Speaks one utterance. iOS Safari can list a voice it then refuses to use
   * (silently, or with an error), so if a chosen voice never starts we try once
   * more with only the language set. That still uses a Norwegian voice.
   */
  private say(synth: SpeechSynthesis, text: string, rate: number, withVoice: boolean) {
    const voice = this.voice!;
    const utterance = new SpeechSynthesisUtterance(text);
    if (withVoice) utterance.voice = voice;
    utterance.lang = voice.lang.replace("_", "-");
    utterance.rate = rate;

    let started = false;
    const retry = () => {
      if (started || !withVoice || this.current !== utterance) return;
      clearTimeout(watchdog);
      synth.cancel();
      this.say(synth, text, rate, false);
    };
    const watchdog = setTimeout(retry, 1200);
    utterance.onstart = () => {
      started = true;
      clearTimeout(watchdog);
    };
    utterance.onerror = (e) => {
      if (e.error !== "interrupted" && e.error !== "canceled") retry();
    };
    utterance.onend = () => {
      clearTimeout(watchdog);
      if (this.current === utterance) this.current = null;
    };
    // Keep a reference: Safari can garbage-collect an utterance mid-speech.
    this.current = utterance;
    synth.speak(utterance);
  }
}

let engine: SpeechEngine | null = null;

export function getSpeech(): SpeechEngine {
  if (!engine) engine = new BrowserSpeech();
  return engine;
}

export function speak(text: string, options?: SpeakOptions) {
  getSpeech().speak(text, options);
}
