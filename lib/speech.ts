// Text-to-speech behind one small interface, so the browser's speechSynthesis
// can later be replaced with a cloud service (Google Cloud TTS, Azure).

export type SpeakOptions = { slow?: boolean };

export interface SpeechEngine {
  /** Resolves once we know whether a Norwegian voice exists. */
  ready(): Promise<boolean>;
  isAvailable(): boolean;
  speak(text: string, options?: SpeakOptions): void;
}

const LANG_PREFERENCE = ["nb-no", "no-no"];

type VoiceLike = Pick<SpeechSynthesisVoice, "lang" | "name"> & { localService?: boolean };

const isLocal = (v: VoiceLike) => v.localService !== false;

/** Picks the best Norwegian voice: nb-NO, then no-NO, then anything starting with nb/no. */
export function pickNorwegianVoice<V extends VoiceLike>(voices: V[]): V | null {
  const lang = (v: V) => v.lang.toLowerCase().replace("_", "-");
  // Prefer voices installed on the device over network ones.
  voices = [...voices].sort((x, y) => Number(isLocal(y)) - Number(isLocal(x)));
  for (const pref of LANG_PREFERENCE) {
    const match = voices.find((v) => lang(v) === pref);
    if (match) return match;
  }
  return voices.find((v) => /^(nb|no)\b/.test(lang(v))) ?? null;
}

export const NORMAL_RATE = 1;
export const SLOW_RATE = 0.7;

class BrowserSpeech implements SpeechEngine {
  private voice: SpeechSynthesisVoice | null = null;
  private readyPromise: Promise<boolean> | null = null;
  private current: SpeechSynthesisUtterance | null = null;

  private synth(): SpeechSynthesis | null {
    return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  }

  ready(): Promise<boolean> {
    if (this.readyPromise) return this.readyPromise;
    const synth = this.synth();
    if (!synth) return (this.readyPromise = Promise.resolve(false));

    this.readyPromise = new Promise((resolve) => {
      const tryPick = () => {
        this.voice = pickNorwegianVoice(synth.getVoices());
        return this.voice !== null;
      };
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
    return this.readyPromise;
  }

  isAvailable() {
    return this.voice !== null;
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
