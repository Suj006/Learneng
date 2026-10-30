import { z } from "zod";
import { randomUUID } from "node:crypto";
import { body, childRoute, ok } from "@/server/api";
import { awardXp, logActivity } from "@/server/gamification";
import { markActivity } from "@/server/journey";

export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({ correct: z.number().int().min(0).max(50), total: z.number().int().min(1).max(50), seconds: z.number().min(0).max(3600) }));
  await logActivity(child.id, "revision", d.seconds, { correct: d.correct, total: d.total });
  await markActivity(child.id, "revision");
  const award = await awardXp(child.id, "revision", `revision:${child.id}:${randomUUID()}`, { multiplier: 0.4 + 0.6 * Math.min(1, d.correct / d.total) });
  return ok({ award });
});
