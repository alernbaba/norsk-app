"use client";

import { useRef } from "react";
import { useT } from "./i18n";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
};

const LETTERS = ["æ", "ø", "å"];

/** Text field with æ/ø/å buttons that insert at the cursor. */
export function AnswerInput({ value, onChange, onSubmit, disabled, placeholder, autoFocus }: Props) {
  const t = useT();
  const ref = useRef<HTMLInputElement>(null);

  const insert = (letter: string) => {
    const input = ref.current;
    const start = input?.selectionStart ?? value.length;
    const end = input?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + letter + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + letter.length, start + letter.length);
    });
  };

  return (
    <div className="space-y-2">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        disabled={disabled}
        placeholder={placeholder ?? t.practice.typeNorwegian}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        lang="nb"
        className="w-full rounded-2xl border border-line bg-card px-4 py-3.5 font-display text-xl shadow-[inset_0_1px_2px_rgb(0_0_0/0.05)] outline-none transition placeholder:font-sans placeholder:text-base placeholder:text-muted/70 focus:border-fjord focus:ring-4 focus:ring-fjord-soft focus-visible:outline-none disabled:bg-sunk/60"
      />
      <div className="flex gap-2">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insert(letter)}
            disabled={disabled}
            className="h-11 w-11 rounded-lg border border-line bg-card font-display text-xl shadow-[0_2px_0_0_var(--press)] transition hover:bg-sunk active:translate-y-0.5 active:shadow-none disabled:opacity-40"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}
