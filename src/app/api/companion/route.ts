import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one } from "@/server/db";
import { rateLimit } from "@/server/ratelimit";
import { askCompanion } from "@/server/ai/companion";
import { logActivity } from "@/server/gamification";

/** Ask LEXI. Conversations are NOT stored (privacy); only usage time is logged. */
export const POST = childRoute(async (req, child) => {
  const { question } = await body(req, z.object({ question: z.string().trim().min(1, "Ask me something!").max(300, "That's a long question! Try a shorter one.") }));
  const p = await one<{ companion_enabled: boolean }>(`select companion_enabled from parents where id = $1`, [child.parent_id]);
  if (!p?.companion_enabled) throw new HttpError(403, "Your parent has turned LEXI chat off for now.");
  if (!(await rateLimit(`companion:${child.id}`, 30, 3600))) throw new HttpError(429, "LEXI needs a little rest! Come back in a while. 🔋");
  const res = await askCompanion(question, child.grade, child.display_name);
  await logActivity(child.id, "companion", 30);
  return ok(res);
});
