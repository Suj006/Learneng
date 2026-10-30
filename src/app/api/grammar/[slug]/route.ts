import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one, query } from "@/server/db";
import { awardXp, logActivity } from "@/server/gamification";
import type { GrammarExercise } from "@/server/content/grammar";
import { markActivity } from "@/server/journey";
import { GRAMMAR_EVIDENCE, recordEvidence } from "@/server/skills";

export const POST = childRoute(async (req, child, params: { slug: string }) => {
  const d = await body(req, z.object({ items: z.array(z.object({ i: z.number().int().min(0).max(500), answer: z.number().int().min(-1).max(10) })).min(1).max(12), seconds: z.number().min(0).max(3600) }));
  const t = await one<{ id: string; title: string; exercises: GrammarExercise[] }>(`select id, title, exercises from grammar_topics where slug = $1`, [params.slug]);
  if (!t) throw new HttpError(404, "Mission not found.");
  // The exercise bank grows over time (reviewed AI/admin content); a mission serves a sample of it.
  if (new Set(d.items.map((x) => x.i)).size !== d.items.length || d.items.some((x) => !t.exercises[x.i])) throw new HttpError(400, "Answer every question first!");
  const results = d.items.map((x) => t.exercises[x.i].answer === x.answer);
  const correct = results.filter(Boolean).length;
  const total = d.items.length;
  const score = Math.round((correct / total) * 100);
  await query(
    `insert into grammar_progress (child_id, topic_id, best_score, attempts, completed_at) values ($1,$2,$3::smallint,1, case when $3::smallint >= 60 then now() end)
     on conflict (child_id, topic_id) do update set best_score = greatest(grammar_progress.best_score, $3::smallint), attempts = grammar_progress.attempts + 1,
       completed_at = coalesce(grammar_progress.completed_at, case when $3::smallint >= 60 then now() end)`,
    [child.id, t.id, score]);
  await logActivity(child.id, "grammar", d.seconds, { topic: params.slug, score });
  await markActivity(child.id, "grammar");
  await recordEvidence(child.id, GRAMMAR_EVIDENCE[params.slug] ?? "grammar_parts", correct, total);
  // One payout per topic per day; better scores earn more.
  const award = score >= 40
    ? await awardXp(child.id, "grammar_challenge", `grammar:${child.id}:${params.slug}:${new Date().toISOString().slice(0, 10)}`, { multiplier: score / 100 + 0.2 })
    : null;
  return ok({ score, correct, total, results, answers: d.items.map((x) => t.exercises[x.i].answer), award });
});
