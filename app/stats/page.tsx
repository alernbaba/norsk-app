import { Stats } from "@/components/Stats";
import { reviewTopics } from "@/lib/content";

export const metadata = { title: "Statistics – Norsk" };

export default function StatsPage() {
  return <Stats topics={reviewTopics()} />;
}
