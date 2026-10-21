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
    <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <ProgressBar value={learned} max={wordIds.length} label={t.topic.wordsLearned} />
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {ready ? (
          <>
            {t.topic.learnedOf(learned, wordIds.length)} · {t.topic.dueToday(due)}
            {attempts > 0 && ` · ${t.topic.percentCorrect(Math.round((correct / attempts) * 100))}`}
          </>
        ) : (
          t.topic.loadingProgress
        )}
      </p>
    </div>
  );
}
