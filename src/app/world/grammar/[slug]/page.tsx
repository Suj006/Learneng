import { notFound } from "next/navigation";
import { requireChild } from "@/server/session";
import { one } from "@/server/db";
import { DRILL_TOPICS } from "@/server/practice";
import type { GrammarExercise } from "@/server/content/grammar";
import { PageTitle } from "@/components/ui";
import { GrammarMission, DrillRunner } from "./GrammarMission";

export default async function GrammarTopic({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireChild();
  if (slug.startsWith("drill-")) {
    const d = DRILL_TOPICS.find((x) => `drill-${x.key}` === slug);
    if (!d) notFound();
    return <><PageTitle title={`${d.emoji} ${d.title}`} subtitle="Endless practice" back="/world/grammar" /><DrillRunner topic={d.key} /></>;
  }
  const t = await one<{ slug: string; title: string; emoji: string; explanation: string; examples: { sentence: string; note: string }[]; exercises: GrammarExercise[] }>(
    `select slug, title, emoji, explanation, examples, exercises from grammar_topics where slug = $1`, [slug]);
  if (!t) notFound();
  // Sample up to 5 exercises from the (growing) bank, keeping their bank index for server-side scoring.
  const sample = t.exercises.map((e, i) => ({ ...e, i })).sort(() => Math.random() - 0.5).slice(0, 5).map(({ answer: _a, ...rest }) => rest);
  return <><PageTitle title={`${t.emoji} ${t.title}`} back="/world/grammar" /><GrammarMission topic={{ slug: t.slug, title: t.title, explanation: t.explanation, examples: t.examples }} exercises={sample} /></>;
}
