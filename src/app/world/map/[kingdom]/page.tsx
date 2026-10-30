import { notFound } from "next/navigation";
import { requireChild } from "@/server/session";
import { one } from "@/server/db";
import { kingdomMap } from "@/server/world";
import { KingdomView } from "@/components/world/KingdomView";
import { CharacterSays } from "@/components/ui";

export default async function Kingdom({ params }: { params: Promise<{ kingdom: string }> }) {
  const { kingdom } = await params;
  const child = await requireChild();
  const p = await one<{ level_id: number }>(`select level_id from child_profiles where child_id = $1`, [child.id]);
  const k = (await kingdomMap(child.id, p!.level_id)).find((x) => x.slug === kingdom);
  if (!k) notFound();
  if (!k.unlocked) return <CharacterSays who="max" mood="encouraging">{k.title} unlocks at Level {k.unlock_level}. Keep learning — you're getting closer every day!</CharacterSays>;
  return <KingdomView k={k} level={p!.level_id} />;
}
