import { requireChild } from "@/server/session";
import { query } from "@/server/db";
import { getAvatar, HAIR_COLORS } from "@/server/avatar";
import { worldContext } from "@/server/world-context";
import { PageTitle } from "@/components/ui";
import { AvatarStudio } from "./AvatarStudio";

export const metadata = { title: "Avatar Studio" };
export default async function AvatarPage({ searchParams }: { searchParams: Promise<{ tab?: string; try?: string }> }) {
  const sp = await searchParams;
  const child = await requireChild();
  const [avatar, items, w] = await Promise.all([
    getAvatar(child.id),
    query<{ slug: string; title: string; category: string; emoji: string; rarity: string; art: string | null; owned: boolean; cost_coins: number; cost_crystals: number; min_level: number; level_exclusive: boolean }>(
      `select r.slug, r.title, r.category, r.emoji, r.rarity, r.art, r.cost_coins, r.cost_crystals, r.min_level, r.level_exclusive,
              exists (select 1 from child_rewards c where c.child_id = $1 and c.slug = r.slug) owned
       from rewards r where r.active and r.category in ('hair','outfit','shoes','background','expression','accessory','costume','magic_object','animation')
       order by r.category, r.starter desc, r.cost_crystals, r.cost_coins`, [child.id]),
    worldContext(child),
  ]);
  return <><PageTitle title="🎨 Avatar Studio" subtitle="Create your adventure character. Unlock more styles with VIBE COINS you earn by learning!" /><AvatarStudio initial={avatar} startTab={sp.tab} tryOn={sp.try} items={items} hairColors={HAIR_COLORS} pet={w.pet?.emoji ?? null} /></>;
}
