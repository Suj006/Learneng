import { z } from "zod";
import { adminRoute, body, HttpError, ok } from "@/server/api";
import { runGeneration } from "@/server/content/pipeline";

export const maxDuration = 300;
export const POST = adminRoute(async (req, admin) => {
  const d = await body(req, z.object({
    kind: z.enum(["vocabulary", "writing_topic", "story", "grammar", "speaking"]),
    band: z.number().int().min(1).max(4), category: z.string().max(40).optional(), topic: z.string().max(40).optional(), count: z.number().int().min(1).max(10).optional(),
  }));
  try {
    return ok(await runGeneration(d.kind, d.band, { ...d, requestedBy: admin.email }));
  } catch (e) {
    throw new HttpError(400, (e as Error).message);
  }
});
