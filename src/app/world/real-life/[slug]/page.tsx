import { notFound } from "next/navigation";
import { requireChild } from "@/server/session";
import { one } from "@/server/db";
import { bandForGrade } from "@/lib/grades";
import { realWorldScore } from "@/server/reallife";
import { suggestLevel, type Level, type Scenario } from "@/lib/reallife";
import { PageTitle } from "@/components/ui";
import { RealLifePlayer } from "./RealLifePlayer";

export default async function RealLifeScenario({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ level?: string }> }) {
  const child = await requireChild();
  const { slug } = await params; const sp = await searchParams;
  const row = await one<{ content: Scenario }>(`select content from real_life_scenarios where slug = $1 and active`, [slug]);
  if (!row) notFound();
  const s = row.content; const band = bandForGrade(child.grade);
  const suggested = suggestLevel(band, await realWorldScore(child.id));
  const level = (["beginner", "developing", "advanced"].includes(sp.level ?? "") ? sp.level : suggested) as Level;
  // Only presentation data goes to the browser; answers and scoring stay on the server.
  const pub = { slug: s.slug, title: s.title, emoji: s.emoji, place: s.place, character: s.character, intro: s.intro, mission: s.mission, words: s.words, phrases: s.phrases, reflection: s.reflection };
  return <><PageTitle title={`${s.emoji} ${s.title}`} subtitle={s.place} back="/world/real-life" /><RealLifePlayer s={pub} level={level} suggested={suggested} band={band} name={child.display_name} /></>;
}
