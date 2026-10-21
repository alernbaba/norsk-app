"use client";

import { useCallback, useState } from "react";
import { today } from "@/lib/dates";
import { buildExtraPractice, buildSession } from "@/lib/srs";
import type { ItemProgress } from "@/lib/types";

export type SessionResult = { itemId: string; correct: boolean };

function pickQueue(itemIds: string[], progress: Record<string, ItemProgress>, size: number) {
  const due = buildSession(itemIds, progress, today(), { size, newLimit: Math.min(5, size) });
  return due.length ? { queue: due, extra: false } : { queue: buildExtraPractice(itemIds, progress, size), extra: true };
}

/**
 * A fixed queue of items for one practice round. The queue is picked once, from
 * the progress at mount time, so answering doesn't reshuffle the round.
 * Mount a new round (e.g. with a React key) to start over.
 */
export function useSession(itemIds: string[], progress: Record<string, ItemProgress>, size = 10) {
  const [{ queue, extra }] = useState(() => pickQueue(itemIds, progress, size));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);

  const answer = useCallback((itemId: string, correct: boolean) => {
    setResults((r) => [...r, { itemId, correct }]);
  }, []);

  const next = useCallback(() => setIndex((i) => i + 1), []);

  return {
    queue,
    current: index < queue.length ? queue[index] : null,
    index,
    total: queue.length,
    done: index >= queue.length,
    extra,
    results,
    answer,
    next,
  };
}
