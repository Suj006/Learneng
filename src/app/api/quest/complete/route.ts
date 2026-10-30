import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one, query } from "@/server/db";
import { todayKey } from "@/server/time";
import { awardXp, logActivity, notifyChild } from "@/server/gamification";
import { adaptBand } from "@/server/vocab";
import { BAND_LABEL } from "@/lib/grades";
import { markActivity } from "@/server/journey";

export const POST = childRoute(async (req, child) => {
  const { seconds } = await body(req, z.object({ seconds: z.number().min(0).max(7200) }));
  const today = todayKey();
  const s = await one<{ id: string; correct: number; attempted: number; completed_at: string | null; new_word_ids: string[] }>(
    `select id, correct, attempted, completed_at, new_word_ids from daily_learning_sessions where child_id = $1 and session_date = $2::date`, [child.id, today]);
  if (!s) throw new HttpError(400, "Start today's quest first!");
  const required = Math.min(8, s.new_word_ids.length + 3, Math.max(1, s.new_word_ids.length + 3));
  if (s.attempted < required) throw new HttpError(400, "Finish all the challenge rounds to complete the quest!");
  const accuracy = s.attempted ? s.correct / s.attempted : 0;
  if (!s.completed_at) {
    await query(`update daily_learning_sessions set completed_at = now() where id = $1`, [s.id]);
    await logActivity(child.id, "daily_word_quest", seconds, { accuracy });
  }
  await markActivity(child.id, "vocabulary");
  const award = await awardXp(child.id, "daily_word_quest", `quest:${child.id}:${today}`, { multiplier: 0.5 + 0.5 * accuracy });
  const bandChange = s.completed_at ? null : await adaptBand(child.id, child.grade);
  if (bandChange && bandChange.to > bandChange.from) {
    await notifyChild(child.id, "🚀 Challenge unlocked!", `You're doing so well that LEXI is bringing you ${BAND_LABEL[bandChange.to]} words!`, "level");
  }
  return ok({ accuracy: Math.round(accuracy * 100), correct: s.correct, attempted: s.attempted, award, bandChange });
});
