import { requireChild } from "@/server/session";
import { query } from "@/server/db";
import { bandForGrade } from "@/lib/grades";
import { PageTitle } from "@/components/ui";
import { SpeakingArena } from "./SpeakingArena";

export const metadata = { title: "Speaking Arena" };
export default async function Speaking() {
  const child = await requireChild();
  const band = bandForGrade(child.grade);
  const [scenarios, words] = await Promise.all([
    query<{ slug: string; title: string; emoji: string; lines: string[] }>(`select slug, title, emoji, lines from speaking_scenarios where active and band <= $1 + 1 order by source, title`, [band]),
    query<{ word: string; example: string; phonetic: string; emoji: string }>(`select v.word, v.example, v.phonetic, v.emoji from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id where p.child_id = $1 order by p.last_practised_at desc nulls last, random() limit 8`, [child.id]),
  ]);
  return <><PageTitle title="🎤 Speaking Arena" subtitle="Listen, repeat and speak with confidence. Your voice is processed in your browser — nothing is recorded or saved." /><SpeakingArena scenarios={scenarios} words={words} /></>;
}
