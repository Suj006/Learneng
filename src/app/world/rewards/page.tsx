import Link from "next/link";
import { requireChild } from "@/server/session";
import { one, query } from "@/server/db";
import { PageTitle } from "@/components/ui";
import { Shop } from "./Shop";

export const metadata = { title: "Reward Shop" };
export default async function Rewards() {
  const child = await requireChild();
  const [items, p] = await Promise.all([
    query<{ slug: string; title: string; category: string; emoji: string; rarity: string; description: string; cost_coins: number; cost_crystals: number; min_level: number; level_exclusive: boolean; owned: boolean }>(
      `select r.slug, r.title, r.category, r.emoji, r.rarity, r.description, r.cost_coins, r.cost_crystals, r.min_level, r.level_exclusive,
              exists (select 1 from child_rewards c where c.child_id = $1 and c.slug = r.slug) owned
       from rewards r where r.active and not r.starter order by r.level_exclusive, r.min_level, r.cost_crystals, r.cost_coins`, [child.id]),
    one<{ coins: number; crystals: number; level_id: number; buddy: string; theme: string }>(`select coins, crystals, level_id, buddy, theme from child_profiles where child_id = $1`, [child.id]),
  ]);
  return (
    <>
      <PageTitle title="🎁 Reward Shop" subtitle="Everything here is earned by learning. No real money, no mystery boxes — what you see is what you get." right={<div className="flex gap-2"><Link href="/world/museum" className="btn-ghost btn-sm">🏛️ Museum</Link><Link href="/world/avatar" className="btn-ghost btn-sm">🎨 Avatar</Link></div>} />
      <Shop items={items} wallet={{ coins: p!.coins, crystals: p!.crystals, level: p!.level_id }} equipped={{ buddy: `buddy-${p!.buddy}`, theme: p!.theme }} />
    </>
  );
}
