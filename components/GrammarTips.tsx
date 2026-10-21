"use client";

import type { GrammarTip } from "@/lib/types";
import { useLanguage } from "./i18n";

/** Text with *stars* around words to show in bold (mostly Norwegian examples). */
export function Marked({ text }: { text: string }) {
  return text.split("*").map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-ink">
        {part}
      </strong>
    ) : (
      part
    ),
  );
}

export function GrammarTipCard({ tip }: { tip: GrammarTip }) {
  const language = useLanguage();
  return (
    <article className="sheet space-y-3 p-5">
      <h3 className="text-lg font-medium">{tip.title[language]}</h3>
      {tip.text[language].map((p, i) => (
        <p key={i} className="leading-relaxed text-muted">
          <Marked text={p} />
        </p>
      ))}
      <ul className="space-y-2 rounded-xl bg-sunk/60 p-4 text-sm">
        {tip.examples.map((e, i) => (
          <li key={i}>
            <span lang="nb" className="block font-display text-base">
              <Marked text={e.no} />
            </span>
            <span className="block text-muted">{e.en}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function GrammarTips({ tips }: { tips: GrammarTip[] }) {
  return (
    <div className="space-y-4">
      {tips.map((tip) => (
        <GrammarTipCard key={tip.id} tip={tip} />
      ))}
    </div>
  );
}
