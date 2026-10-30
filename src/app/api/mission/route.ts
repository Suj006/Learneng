import { childRoute, ok } from "@/server/api";
import { todayKey } from "@/server/time";
import { awardXp, logActivity } from "@/server/gamification";

export const POST = childRoute(async (_req, child) => {
  const award = await awardXp(child.id, "mission_of_day", `mission:${child.id}:${todayKey()}`);
  if (award.xp) await logActivity(child.id, "mission_of_day", 0);
  return ok({ award });
});
