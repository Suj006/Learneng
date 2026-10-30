import { notFound } from "next/navigation";
import { one } from "@/server/db";
import { ChallengePlayer } from "@/components/play/ChallengePlayer";
import { PageTitle } from "@/components/ui";

const GUIDE: Record<string, "lexi" | "grammy" | "story" | "speaky" | "max"> = { "vocabulary-forest": "lexi", "grammar-galaxy": "grammy", "storytelling-castle": "story", "speaking-mountains": "speaky", "reading-ocean": "story", "word-wizards-arena": "max" };

export default async function BossPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = await one<{ title: string; kingdom: string }>(`select title, kingdom from boss_battles where slug = $1`, [slug]);
  if (!b) notFound();
  return <><PageTitle title={b.title} back={`/world/map/${b.kingdom}`} /><ChallengePlayer kind="boss" ref={slug} guide={GUIDE[b.kingdom] ?? "max"} allowDifficulty backHref={`/world/map/${b.kingdom}`} /></>;
}
