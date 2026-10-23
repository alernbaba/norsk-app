import { Shuffle } from "@/components/practice/Shuffle";
import { getTopics, inflectionsForTopic } from "@/lib/content";

export const metadata = { title: "Shuffle – Norsk" };

export default function ShufflePage() {
  const topics = getTopics();
  const inflections = Object.assign({}, ...topics.map(inflectionsForTopic));
  return <Shuffle topics={topics} inflections={inflections} />;
}
