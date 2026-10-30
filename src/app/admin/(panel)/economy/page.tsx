import { one, query } from "@/server/db";
import { AddLevels, XpTable } from "@/components/admin/AdminForms";

export const metadata = { title: "Rewards & Levels" };
export default async function Economy() {
  const [rows, ceil, levels, total] = await Promise.all([
    query<{ key: string; label: string; xp: number; coins: number; crystals: number; daily_cap: number }>(`select key, label, xp, coins, crystals, daily_cap from xp_config order by key`),
    one<{ value: number }>(`select value from app_settings where key = 'daily_xp_ceiling'`),
    query<{ id: number; name: string; min_xp: number; min_words_mastered: number; milestone: number; reward_coins: number; reward_slugs: string[] }>(`select id, name, min_xp, min_words_mastered, milestone, reward_coins, reward_slugs from learning_levels where milestone > 0 or id <= 3 order by id limit 80`),
    one<{ n: number }>(`select count(*)::int n from learning_levels`),
  ]);
  return (
    <div className="space-y-8">
      <h1 className="title-lg">Reward economy & progression</h1>
      <p className="text-sm text-vibe-lavender">All values are applied server-side through an idempotent ledger. Performance multipliers scale rewards by learning outcomes (accuracy/score), not clicks.</p>
      <XpTable rows={rows} ceiling={Number(ceil?.value ?? 1500)} />
      <section className="card p-5"><h2 className="title-md">Levels ({total!.n})</h2><div className="mt-3"><AddLevels total={total!.n} /></div>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="text-vibe-lavender"><tr><th>#</th><th>Name</th><th>XP</th><th>Mastered words</th><th>Milestone</th><th>Rewards</th></tr></thead>
          <tbody>{levels.map((l) => <tr key={l.id} className="border-t border-white/5"><td className="py-1">{l.id}</td><td>{l.name}</td><td>{l.min_xp.toLocaleString()}</td><td>{l.min_words_mastered}</td><td>{l.milestone || ""}</td><td className="text-xs">{l.reward_coins ? `🪙${l.reward_coins} ` : ""}{l.reward_slugs.join(", ")}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
