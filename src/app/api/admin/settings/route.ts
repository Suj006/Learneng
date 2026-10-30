import { z } from "zod";
import { adminRoute, body, ok } from "@/server/api";
import { query } from "@/server/db";

export const POST = adminRoute(async (req) => {
  const d = await body(req, z.object({ daily_xp_ceiling: z.number().int().min(100).max(20000) }));
  await query(`insert into app_settings (key, value) values ('daily_xp_ceiling', $1::jsonb) on conflict (key) do update set value = $1::jsonb`, [JSON.stringify(d.daily_xp_ceiling)]);
  return ok();
});
