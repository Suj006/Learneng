import { z } from "zod";
import { body, childRoute, ok } from "@/server/api";
import { query } from "@/server/db";

export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({ wordId: z.string().uuid(), favourite: z.boolean() }));
  await query(`update child_vocabulary_progress set favourite = $3 where child_id = $1 and word_id = $2`, [child.id, d.wordId, d.favourite]);
  return ok();
});
