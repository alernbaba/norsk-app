"use client";

import { isLearned } from "@/lib/srs";
import { useT } from "./i18n";
import { ProgressBar } from "./ProgressBar";
import { useAppState } from "./useAppState";

export function TopicStats({ wordIds, itemIds }: { wordIds: string[]; itemIds: string[] }) {
  const { ready, date, progress } = useAppState();
  const t = useT();
  const learned = wordIds.filter((id) => isLearned(progress[id])).length;
  const due = itemIds.filter((id) => progress[id] && progress[id].nextReview <= date).length;
  const attempts = itemIds.reduce((n, id) => n + (progress[id]?.attempts ?? 0), 0);
  const correct = itemIds.reduce((n, id) => n + (progress[id]?.correct ?? 0), 0);

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-line p-4">
      <ProgressBar value={learned} max={wordIds.length} label={t.topic.wordsLearned} />
      {ready ? (
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <span className="text-ink">{t.topic.learnedOf(learned, wordIds.length)}</span>
          <span className="text-ochre">{t.topic.dueToday(due)}</span>
          {attempts > 0 && <span className="text-moss">{t.topic.percentCorrect(Math.round((correct / attempts) * 100))}</span>}
        </p>
      ) : (
        <p className="text-sm text-muted">{t.topic.loadingProgress}</p>
      )}
    </div>
  );
}
