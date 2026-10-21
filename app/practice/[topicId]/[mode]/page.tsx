import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Msg } from "@/components/i18n";
import { Practice } from "@/components/practice/Practice";
import { getTopic, getTopics, inflectionsForTopic } from "@/lib/content";
import { isMode, MODES } from "@/lib/modes";

export function generateStaticParams() {
  return getTopics().flatMap((t) => MODES.map((m) => ({ topicId: t.id, mode: m.id })));
}

type Params = PageProps<"/practice/[topicId]/[mode]">["params"];

export default function PracticePage({ params }: PageProps<"/practice/[topicId]/[mode]">) {
  return (
    <Suspense fallback={<p className="text-slate-500">
          <Msg id="common.loading" />
        </p>}>
      <PracticeContent params={params} />
    </Suspense>
  );
}

async function PracticeContent({ params }: { params: Params }) {
  const { topicId, mode } = await params;
  const topic = getTopic(topicId);
  if (!topic || !isMode(mode)) notFound();
  return <Practice topic={topic} mode={mode} inflections={inflectionsForTopic(topic)} />;
}
