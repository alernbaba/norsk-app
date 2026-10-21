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

type VoiceLike = Pick<SpeechSynthesisVoice, "lang" | "name">;

/** Picks the best Norwegian voice: nb-NO, then no-NO, then anything starting with nb/no. */
export function pickNorwegianVoice<V extends VoiceLike>(voices: V[]): V | null {
  const lang = (v: V) => v.lang.toLowerCase().replace("_", "-");
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
      // Some browsers load the voice list asynchronously.
      const onChange = () => {
        if (tryPick()) {
          synth.removeEventListener("voiceschanged", onChange);
          resolve(true);
        }
      };
      synth.addEventListener("voiceschanged", onChange);
      // Give up after a while if no Norwegian voice ever shows up.
      setTimeout(() => {
        synth.removeEventListener("voiceschanged", onChange);
        resolve(tryPick());
      }, 3000);
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
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.lang = this.voice.lang;
    utterance.rate = slow ? SLOW_RATE : NORMAL_RATE;
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
