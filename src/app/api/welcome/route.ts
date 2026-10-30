import { childRoute, ok } from "@/server/api";
import { query } from "@/server/db";
import { awardXp } from "@/server/gamification";

/** Marks the playful onboarding as seen and gives a welcome gift. No test, no scoring. */
export const POST = childRoute(async (_req, child) => {
  await query(`update child_profiles set onboarded_at = coalesce(onboarded_at, now()) where child_id = $1`, [child.id]);
  const award = await awardXp(child.id, "welcome", `welcome:${child.id}`);
  return ok({ award, redirect: "/world/quest" });
});
