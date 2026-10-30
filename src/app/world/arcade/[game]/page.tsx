import { notFound } from "next/navigation";
import { one } from "@/server/db";
import { GameRunner } from "@/components/play/Games";
import { PageTitle } from "@/components/ui";

export default async function GamePage({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  const g = await one<{ slug: string; title: string; tagline: string; emoji: string }>(`select slug, title, tagline, emoji from games where slug = $1 and active`, [game]);
  if (!g) notFound();
  return <><PageTitle title={`${g.emoji} ${g.title}`} subtitle={g.tagline} back="/world/arcade" /><GameRunner slug={g.slug} /></>;
}
