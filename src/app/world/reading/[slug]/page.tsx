import { notFound, redirect } from "next/navigation";
import { requireChild } from "@/server/session";
import { one, query } from "@/server/db";
import { PageTitle } from "@/components/ui";
import { bandForGrade } from "@/lib/grades";
import { skillBand } from "@/server/journey";
import { StoryReader } from "./StoryReader";

export default async function Story({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const child = await requireChild();
  const s = await one<{ slug: string; title: string; emoji: string; reward: string | null; band: number; pages: { scene: string; text: string }[]; glossary: { word: string; meaning: string }[]; questions: { q: string; options: string[] }[] }>(
    `select slug, title, emoji, reward, band, pages, glossary, questions from reading_stories where slug = $1 and active`, [slug]);
  if (!s) notFound();
  if (s.reward && !(await one(`select 1 from child_rewards where child_id = $1 and slug = $2`, [child.id, s.reward]))) redirect("/world/rewards");
  const prof = await one<{ skill_reading: number }>(`select skill_reading from child_profiles where child_id = $1`, [child.id]);
  const rBand = skillBand(bandForGrade(child.grade), prof?.skill_reading ?? 50);
  const level = s.band < rBand ? { label: `Level ${s.band}`, note: "an easy, relaxing read" } : s.band === rBand ? { label: `Level ${s.band}`, note: "just right for you" } : { label: `Level ${s.band}`, note: "a stretch — take your time" };
  const known = await query<{ word: string; meaning: string }>(`select v.word, v.meaning from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id where p.child_id = $1`, [child.id]);
  return <><PageTitle title={`${s.emoji} ${s.title}`} back="/world/reading" /><StoryReader slug={s.slug} pages={s.pages} glossary={s.glossary} questions={s.questions.map((q) => ({ q: q.q, options: q.options }))} known={known} level={level} /></>;
}
