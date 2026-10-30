import { z } from "zod";
import { adminRoute, body, ok } from "@/server/api";
import { one, query } from "@/server/db";
import { buildLevels } from "@/server/content/levels";

/** Appends more levels using the same balanced formula (unlimited progression). */
export const POST = adminRoute(async (req) => {
  const { count } = await body(req, z.object({ count: z.number().int().min(1).max(250) }));
  const max = (await one<{ m: number }>(`select coalesce(max(id),0)::int m from learning_levels`))!.m;
  const { levels, rewards } = buildLevels(max + count);
  const fresh = levels.filter((l) => l.id > max);
  for (const r of rewards.filter((r) => r.min_level > max)) {
    await query(`insert into rewards (slug, title, category, emoji, cost_coins, description, min_level, level_exclusive, rarity) values ($1,$2,$3,$4,0,$5,$6,true,'legendary') on conflict (slug) do nothing`,
      [r.slug, r.title, r.category, r.emoji, r.description, r.min_level]);
  }
  for (const l of fresh) {
    await query(`insert into learning_levels (id, name, tier, tier_name, min_xp, min_words_mastered, milestone, reward_coins, reward_slugs, special_mission, description)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict (id) do nothing`,
      [l.id, l.name, l.tier, l.tier_name, l.min_xp, l.min_words_mastered, l.milestone, l.reward_coins, l.reward_slugs, l.special_mission, l.description]);
  }
  return ok({ added: fresh.length, total: max + fresh.length });
});
