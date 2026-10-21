import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Msg, TopicText } from "@/components/i18n";
import { TopicStats } from "@/components/TopicStats";
import { getTopic, getTopics } from "@/lib/content";
import { MODES } from "@/lib/modes";

export function generateStaticParams() {
  return getTopics().map((t) => ({ topicId: t.id }));
}

type Params = PageProps<"/topics/[topicId]">["params"];

export default function TopicPage({ params }: PageProps<"/topics/[topicId]">) {
  return (
    <Suspense fallback={<p className="text-slate-500">
          <Msg id="common.loading" />
        </p>}>
      <TopicContent params={params} />
    </Suspense>
  );
}

async function TopicContent({ params }: { params: Params }) {
  const { topicId } = await params;
  const topic = getTopic(topicId);
  if (!topic) notFound();

  const counts = {
    flashcards: topic.words.length,
    tiles: topic.sentences.length,
    write: topic.sentences.length,
    inflection: topic.inflectionDrills.length,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link href="/" className="text-sm text-slate-500 hover:underline">
          <Msg id="topic.allTopics" />
        </Link>
        <h1 className="text-2xl font-bold">
          {topic.emoji} <TopicText id={topic.id} title={topic.title} description={topic.description} field="title" />
        </h1>
        <p className="text-slate-600 dark:text-slate-300">
          <TopicText id={topic.id} title={topic.title} description={topic.description} field="description" />
        </p>
      </div>

      <TopicStats
        wordIds={topic.words.map((w) => w.id)}
        itemIds={[...topic.words, ...topic.sentences, ...topic.inflectionDrills].map((i) => i.id)}
      />

      <ul className="grid gap-3">
        {MODES.filter((m) => counts[m.id] > 0).map((m) => (
          <li key={m.id}>
            <Link
              href={`/practice/${topic.id}/${m.id}`}
              className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"
            >
              <span className="text-3xl" aria-hidden>
                {m.emoji}
              </span>
              <span className="flex-1">
                <span className="block font-semibold">
                  <Msg id={`modes.${m.id}.title`} />
                </span>
                <span className="block text-sm text-slate-500 dark:text-slate-400">
                  <Msg id={`modes.${m.id}.description`} />
                </span>
              </span>
              <span className="text-sm tabular-nums text-slate-400">{counts[m.id]}</span>
            </Link>
          </li>
        ))}
      </ul>

      <details className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <summary className="cursor-pointer font-semibold">
          <Msg id="topic.allWordsHeading" /> ({topic.words.length})
        </summary>
        <ul className="mt-3 divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {topic.words.map((w) => (
            <li key={w.id} className="flex justify-between gap-4 py-1.5">
              <span lang="nb" className="font-medium">
                {w.no}
              </span>
              <span className="text-right text-slate-500">{w.en.join(", ")}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
