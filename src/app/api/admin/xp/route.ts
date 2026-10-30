import { z } from "zod";
import { adminRoute, body, ok } from "@/server/api";
import { query } from "@/server/db";

export const POST = adminRoute(async (req) => {
  const d = await body(req, z.object({ rows: z.array(z.object({ key: z.string().max(40), xp: z.number().int().min(0).max(5000), coins: z.number().int().min(0).max(2000), crystals: z.number().int().min(0).max(100), daily_cap: z.number().int().min(0).max(100) })).max(50) }));
  for (const r of d.rows) await query(`update xp_config set xp = $2, coins = $3, crystals = $4, daily_cap = $5 where key = $1`, [r.key, r.xp, r.coins, r.crystals, r.daily_cap]);
  return ok();
});
