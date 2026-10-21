import Link from "next/link";
import { GrammarTips } from "@/components/GrammarTips";
import { Msg, TopicText } from "@/components/i18n";
import { getTopics, grammarForTopic } from "@/lib/content";

export const metadata = { title: "Grammar – Norsk" };

export default function GrammarPage() {
  const topics = getTopics()
    .map((topic) => ({ topic, tips: grammarForTopic(topic.id) }))
    .filter((t) => t.tips.length > 0);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="eyebrow">
          <Msg id="grammar.eyebrow" />
        </p>
        <h1 className="text-3xl font-medium sm:text-4xl">
          <Msg id="grammar.title" />
        </h1>
        <p className="text-muted">
          <Msg id="grammar.intro" />
        </p>
      </div>

      {topics.map(({ topic, tips }) => (
        <section key={topic.id} id={topic.id} className="scroll-mt-20 space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-medium">
              <span aria-hidden>{topic.emoji}</span>{" "}
              <TopicText id={topic.id} title={topic.title} description={topic.description} field="title" />
            </h2>
            <Link href={`/topics/${topic.id}`} className="shrink-0 text-sm text-muted transition-colors hover:text-ink">
              <Msg id="grammar.toTopic" /> →
            </Link>
          </div>
          <GrammarTips tips={tips} />
        </section>
      ))}
    </div>
  );
}
