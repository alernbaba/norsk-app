import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BackLink } from "@/components/BackLink";
import { Msg, TopicText } from "@/components/i18n";
import { ModeIcon } from "@/components/ModeIcon";
import { TopicStats } from "@/components/TopicStats";
import { getTopic, getTopics } from "@/lib/content";
import { MODES } from "@/lib/modes";
import { topicItemIds } from "@/lib/progress";

export function generateStaticParams() {
  return getTopics().map((t) => ({ topicId: t.id }));
}

type Params = PageProps<"/topics/[topicId]">["params"];

export default function TopicPage({ params }: PageProps<"/topics/[topicId]">) {
  return (
    <Suspense
      fallback={
        <p className="text-muted">
          <Msg id="common.loading" />
        </p>
      }
    >
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
    reverse: topic.words.length,
    tiles: topic.sentences.length,
    write: topic.sentences.length,
    inflection: topic.inflectionDrills.length,
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <BackLink href="/">
          <Msg id="topic.allTopics" />
        </BackLink>
        <div className="flex items-center gap-4">
          <span className="sheet grid h-16 w-16 shrink-0 -rotate-3 place-items-center text-4xl" aria-hidden>
            {topic.emoji}
          </span>
          <div className="min-w-0">
            <p className="eyebrow">
              <Msg id="topic.eyebrow" />
            </p>
            <h1 className="text-3xl font-medium sm:text-4xl">
              <TopicText id={topic.id} title={topic.title} description={topic.description} field="title" />
            </h1>
          </div>
        </div>
        <p className="text-muted">
          <TopicText id={topic.id} title={topic.title} description={topic.description} field="description" />
        </p>
      </div>

      <TopicStats
        wordIds={topic.words.map((w) => w.id)}
        itemIds={topicItemIds(topic)}
      />

      <section className="space-y-3">
        <h2 className="text-xl font-medium">
          <Msg id="topic.choose" />
        </h2>
        <ul className="sheet divide-y divide-line overflow-hidden">
          {MODES.filter((m) => counts[m.id] > 0).map((m) => (
            <li key={m.id}>
              <Link href={`/practice/${topic.id}/${m.id}`} className="group flex items-center gap-4 p-4 transition-colors hover:bg-sunk/60">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-fjord-soft text-fjord">
                  <ModeIcon mode={m.id} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">
                    <Msg id={`modes.${m.id}.title`} />
                  </span>
                  <span className="block text-sm leading-snug text-muted">
                    <Msg id={`modes.${m.id}.description`} />
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-sm text-muted tabular-nums">
                  {counts[m.id]}
                  <span aria-hidden className="text-lg transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <details className="sheet group p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
          <span>
            <Msg id="topic.wordList" /> <span className="font-normal text-muted tabular-nums">· {topic.words.length}</span>
          </span>
          <span aria-hidden className="text-muted transition-transform group-open:rotate-45">
            +
          </span>
        </summary>
        <ul className="mt-3 text-sm">
          {topic.words.map((w) => (
            <li key={w.id} className="flex items-baseline gap-2 py-1.5">
              <span lang="nb" className="font-display text-base font-medium">
                {w.no}
              </span>
              <span aria-hidden className="mb-1 min-w-4 flex-1 border-b border-dotted border-line" />
              <span className="text-right text-muted">{w.en.join(", ")}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
