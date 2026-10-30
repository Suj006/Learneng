import { z } from "zod";
import { body, HttpError, ok, parentRoute } from "@/server/api";
import { one, query } from "@/server/db";

/** Parent-approved family challenge built from the child's own discovered words. */
export const POST = parentRoute(async (req, parent) => {
  const d = await body(req, z.object({
    childId: z.string().uuid(),
    title: z.string().trim().min(2).max(60),
    message: z.string().trim().max(200).default(""),
    wordIds: z.array(z.string().uuid()).min(3, "Pick at least 3 words.").max(10, "Pick up to 10 words."),
  }));
  const c = await one(`select 1 from children where id = $1 and parent_id = $2 and status = 'active'`, [d.childId, parent.id]);
  if (!c) throw new HttpError(404, "Child not found.");
  const valid = await query<{ word_id: string }>(`select word_id from child_vocabulary_progress where child_id = $1 and word_id = any($2::uuid[])`, [d.childId, d.wordIds]);
  if (valid.length !== d.wordIds.length) throw new HttpError(400, "Choose words your child has already discovered.");
  await query(`insert into family_challenges (parent_id, child_id, title, message, word_ids) values ($1,$2,$3,$4,$5::uuid[])`, [parent.id, d.childId, d.title, d.message, d.wordIds]);
  await query(`insert into notifications (child_id, title, body, kind) values ($1,$2,$3,'family')`, [d.childId, `👨‍👩‍👧 New family challenge: ${d.title}`, d.message || "Your family set you a word challenge!"]);
  return ok();
});
