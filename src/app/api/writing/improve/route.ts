import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one, query } from "@/server/db";
import { rateLimit } from "@/server/ratelimit";
import { improveSentence } from "@/server/ai/improve";
import { screenQuestion } from "@/server/ai/companion";
import { judgeRewrite, type Suggestion } from "@/lib/improve";
import { awardXp, logActivity } from "@/server/gamification";
import { recordEvidence } from "@/server/skills";
import { todayKey } from "@/server/time";

const Input = z.discriminatedUnion("action", [
  z.object({ action: z.literal("suggest"), text: z.string().trim().min(3).max(300) }),
  z.object({ action: z.literal("save"), id: z.string().uuid(), mine: z.string().trim().min(2).max(400) }),
]);

/** IMPROVE MY SENTENCE: suggestions (never a silent rewrite) → the child writes their own version → it is saved next to the original. */
export const POST = childRoute(async (req, child) => {
  const d = await body(req, Input);
  if (d.action === "suggest") {
    const safety = screenQuestion(d.text);
    if (safety) return ok({ safety: safety.reply });
    if (!(await rateLimit(`improve:${child.id}`, 30, 3600))) throw new HttpError(429, "GRAMMY needs a short rest. Try again a bit later!");
    const r = await improveSentence(d.text, child.grade);
    const row = await one<{ id: string }>(`insert into sentence_improvements (child_id, original, suggestions, evaluator) values ($1,$2,$3,$4) returning id`,
      [child.id, r.original, JSON.stringify(r.suggestions), r.evaluator]);
    return ok({ id: row!.id, ...r });
  }
  const s = await one<{ original: string; suggestions: Suggestion[]; mine: string | null }>(
    `select original, suggestions, mine from sentence_improvements where id = $1 and child_id = $2`, [d.id, child.id]);
  if (!s) throw new HttpError(404, "Sentence not found.");
  if (s.mine) throw new HttpError(400, "You already saved your improved sentence.");
  const safety = screenQuestion(d.mine);
  if (safety) return ok({ safety: safety.reply });
  const j = judgeRewrite(s.original, d.mine, s.suggestions);
  await query(`update sentence_improvements set mine = $2, improved = $3, saved_at = now() where id = $1`, [d.id, d.mine, j.improved]);
  await recordEvidence(child.id, "writing_sentences", j.improved ? 1 : 0, 1);
  await logActivity(child.id, "improve_sentence", 60, { improved: j.improved });
  const award = j.improved ? await awardXp(child.id, "improve_sentence", `improve:${d.id}`) : null;
  return ok({ ...j, original: s.original, mine: d.mine, award, day: todayKey() });
});
