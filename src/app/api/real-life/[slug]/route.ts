import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { answerTurn, completeRun, startRun } from "@/server/reallife";
import { rateLimit } from "@/server/ratelimit";

/**
 * VIBE REAL LIFE play API.
 *   { action: "start", level }                         → new conversation (first turn)
 *   { action: "answer", runId, option | text, mode }   → judged on the server; completion is recorded here, server-side
 */
export const POST = childRoute(async (req, child, params: { slug: string }) => {
  const d = await body(req, z.discriminatedUnion("action", [
    z.object({ action: z.literal("start"), level: z.enum(["beginner", "developing", "advanced"]) }),
    z.object({ action: z.literal("answer"), runId: z.string().uuid(), option: z.number().int().min(0).max(5).optional(), text: z.string().max(300).optional(), mode: z.enum(["choice", "text", "voice"]), skip: z.boolean().optional() }),
  ]));
  if (!(await rateLimit(`reallife:${child.id}`, 400, 3600))) throw new HttpError(429, "Let's take a little break and come back soon!");
  if (d.action === "start") {
    const r = await startRun(child.id, params.slug, d.level);
    if (!r) throw new HttpError(404, "Scenario not found.");
    return ok(r);
  }
  const r = await answerTurn(child.id, d.runId, d);
  if ("error" in r) throw new HttpError(400, r.error as string);
  if (r.done && r.summary) return ok({ ...r, completion: await completeRun(child.id, r.summary) });
  return ok(r);
});
