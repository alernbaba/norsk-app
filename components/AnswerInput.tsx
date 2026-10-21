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
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:focus:ring-emerald-900 dark:disabled:bg-slate-800"
      />
      <div className="flex gap-2">
        {LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => insert(letter)}
            disabled={disabled}
            className="h-11 w-11 rounded-lg border border-slate-300 bg-white text-lg font-medium hover:bg-slate-100 active:scale-95 disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}
