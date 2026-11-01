import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { rateLimit } from "@/server/ratelimit";
import { answerPhonics, phonicsUnits, startUnit } from "@/server/phonics";

export const GET = childRoute(async (_req, child) => ok({ units: await phonicsUnits(child.id, child.grade) }));

export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.discriminatedUnion("action", [
    z.object({ action: z.literal("start"), unit: z.string().regex(/^[a-z-]{3,30}$/) }),
    z.object({ action: z.literal("answer"), attemptId: z.string().uuid(), index: z.number().int().min(0).max(20), choice: z.string().min(1).max(40) }),
  ]));
  if (!(await rateLimit(`phonics:${child.id}`, 400, 3600))) throw new HttpError(429, "Let's take a little break and come back soon!");
  if (d.action === "start") {
    const r = await startUnit(child.id, child.grade, d.unit);
    if ("error" in r) throw new HttpError(r.status ?? 400, r.error as string);
    return ok(r);
  }
  const r = await answerPhonics(child.id, d.attemptId, d.index, d.choice);
  if ("error" in r) throw new HttpError(400, r.error as string);
  return ok(r);
});
