import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one, query } from "@/server/db";
import { awardXp, logActivity } from "@/server/gamification";
import { markActivity } from "@/server/journey";
import { recordEvidence } from "@/server/skills";

export const POST = childRoute(async (req, child, params: { slug: string }) => {
  const d = await body(req, z.object({ answers: z.array(z.number().int().min(-1).max(10)), seconds: z.number().min(0).max(7200) }));
  const s = await one<{ id: string; band: number; questions: { answer: number }[] }>(`select id, band, questions from reading_stories where slug = $1 and active`, [params.slug]);
  if (!s) throw new HttpError(404, "Story not found.");
  if (d.answers.length !== s.questions.length) throw new HttpError(400, "Answer every question first!");
  const correct = s.questions.filter((q, i) => d.answers[i] === q.answer).length;
  const score = Math.round((correct / s.questions.length) * 100);
  await query(
    `insert into story_progress (child_id, story_id, best_score, completed_at) values ($1,$2,$3, now())
     on conflict (child_id, story_id) do update set best_score = greatest(story_progress.best_score, $3), completed_at = coalesce(story_progress.completed_at, now())`,
    [child.id, s.id, score]);
  await logActivity(child.id, "reading", d.seconds, { story: params.slug, score });
  await markActivity(child.id, "reading");
  await recordEvidence(child.id, "reading", correct, s.questions.length);
  await recordEvidence(child.id, "comprehension", correct, s.questions.length);
  if (s.band >= 3) await recordEvidence(child.id, "inference", correct, s.questions.length);
  const award = await awardXp(child.id, "reading_adventure", `reading:${child.id}:${params.slug}`, { multiplier: 0.5 + score / 200 });
  return ok({ score, correct, total: s.questions.length, answers: s.questions.map((q) => q.answer), award });
});
