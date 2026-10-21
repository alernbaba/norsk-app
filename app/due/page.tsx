import { DueList } from "@/components/DueList";
import { reviewTopics } from "@/lib/content";

export const metadata = { title: "Due today – Norsk" };

export default function DuePage() {
  return <DueList topics={reviewTopics()} />;
}
