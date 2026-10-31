import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { tx } from "@/server/db";
import { coinPrice } from "@/lib/economy";

/** Coins/crystals are only ever earned through learning; redemption is atomic. Level-exclusive items can't be bought. */
export const POST = childRoute(async (req, child) => {
  const { slug } = await body(req, z.object({ slug: z.string().max(60) }));
  const result = await tx(async (q) => {
    const r = (await q.query<{ cost_coins: number; cost_crystals: number; min_level: number; title: string; level_exclusive: boolean }>(
      `select cost_coins, cost_crystals, min_level, title, level_exclusive from rewards where slug = $1 and active`, [slug])).rows[0];
    if (!r) throw new HttpError(404, "Reward not found.");
    if (r.level_exclusive) throw new HttpError(400, `This is a Level ${r.min_level} reward — it unlocks automatically when you get there!`);
    // Lock the wallet FIRST, then check ownership: two quick taps are serialised, so the second sees the first purchase
    // and gets a friendly message instead of a duplicate-key error.
    const p = (await q.query<{ coins: number; crystals: number; level_id: number }>(`select coins, crystals, level_id from child_profiles where child_id = $1 for update`, [child.id])).rows[0];
    const owned = (await q.query(`select 1 from child_rewards where child_id = $1 and slug = $2`, [child.id, slug])).rows.length;
    if (owned) throw new HttpError(400, "You already own this!");
    if (p.level_id < r.min_level) throw new HttpError(400, `Reach Level ${r.min_level} to unlock this!`);
    // One shopping currency: crystal prices are charged in VIBE COINS at a fixed rate (crystal balances are left untouched).
    const price = coinPrice(r.cost_coins, r.cost_crystals);
    if (p.coins < price) throw new HttpError(400, `You need ${price - p.coins} more VIBE COINS. Keep learning to earn them!`);
    await q.query(`update child_profiles set coins = coins - $2 where child_id = $1`, [child.id, price]);
    await q.query(`insert into child_rewards (child_id, slug) values ($1,$2)`, [child.id, slug]);
    await q.query(`insert into xp_transactions (child_id, amount, coins, crystals, reason, source, idempotency_key) values ($1,0,$2,$3,$4,'shop',$5)`,
      [child.id, -price, 0, `Redeemed: ${r.title}`, `shop:${child.id}:${slug}`]);
    return { title: r.title, coins: p.coins - price, crystals: p.crystals };
  });
  return ok(result);
});
