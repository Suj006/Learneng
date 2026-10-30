import { z } from "zod";
import { adminRoute, body, ok } from "@/server/api";
import { query } from "@/server/db";

/** Direct edits to published words (typo fixes, status changes). New words go through /api/admin/manual. */
export const POST = adminRoute(async (req) => {
  const d = await body(req, z.object({ id: z.string().uuid(), meaning: z.string().min(2).max(300), explanation: z.string().min(2).max(400), example: z.string().min(2).max(300), phonetic: z.string().min(1).max(60), emoji: z.string().min(1).max(8), status: z.enum(["draft", "published", "archived"]) }));
  await query(`update vocabulary_master set meaning=$2, explanation=$3, example=$4, phonetic=$5, emoji=$6, status=$7, updated_at=now() where id=$1`, [d.id, d.meaning, d.explanation, d.example, d.phonetic, d.emoji, d.status]);
  return ok();
});
