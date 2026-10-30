import { notFound, redirect } from "next/navigation";
import { requireChild } from "@/server/session";
import { one, query } from "@/server/db";
import { PageTitle } from "@/components/ui";
import { StoryReader } from "./StoryReader";

export default async function Story({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const child = await requireChild();
  const s = await one<{ slug: string; title: string; emoji: string; reward: string | null; pages: { scene: string; text: string }[]; glossary: { word: string; meaning: string }[]; questions: { q: string; options: string[] }[] }>(
    `select slug, title, emoji, reward, pages, glossary, questions from reading_stories where slug = $1 and active`, [slug]);
  if (!s) notFound();
  if (s.reward && !(await one(`select 1 from child_rewards where child_id = $1 and slug = $2`, [child.id, s.reward]))) redirect("/world/rewards");
  const known = await query<{ word: string }>(`select v.word from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id where p.child_id = $1`, [child.id]);
  return <><PageTitle title={`${s.emoji} ${s.title}`} back="/world/reading" /><StoryReader slug={s.slug} pages={s.pages} glossary={s.glossary} questions={s.questions.map((q) => ({ q: q.q, options: q.options }))} known={known.map((k) => k.word.toLowerCase())} /></>;
}
