import { Overview } from "@/components/Overview";
import { topicSummaries } from "@/lib/content";

export default function Home() {
  return <Overview topics={topicSummaries()} />;
}
