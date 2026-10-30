import { z } from "zod";
import { body, childRoute, ok } from "@/server/api";
import { query } from "@/server/db";
import { todayKey } from "@/server/time";

export const POST = childRoute(async (req, child) => {
  const { count } = await body(req, z.object({ count: z.number().int().min(0).max(20) }));
  await query(`update daily_learning_sessions set cards_viewed = greatest(cards_viewed, $3) where child_id = $1 and session_date = $2::date`, [child.id, todayKey(), count]);
  return ok();
});
