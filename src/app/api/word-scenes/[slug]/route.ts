import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { query } from "@/server/db";
import { rateLimit } from "@/server/ratelimit";
import { screenQuestion } from "@/server/ai/companion";
import { SCENES, checkSentence, describeScore, levelFor } from "@/lib/scenes";
import { bandForGrade } from "@/lib/grades";
import { recordEvidence } from "@/server/skills";
import { awardXp, logActivity } from "@/server/gamification";
import { todayKey } from "@/server/time";

/** Completes a Word Scene: answers are checked here (never sent to the browser), evidence is recorded, rewarded once a day per scene. */
export const POST = childRoute(async (req, child, params: { slug: string }) => {
  const scene = SCENES.find((s) => s.slug === params.slug);
  if (!scene) throw new HttpError(404, "Scene not found.");
  const d = await body(req, z.object({
    explored: z.array(z.string().max(40)).max(20), sentence: z.string().max(300), answers: z.array(z.string().max(80)).max(10), describe: z.string().max(600),
  }));
  if (!(await rateLimit(`scene:${child.id}`, 60, 3600))) throw new HttpError(429, "Let's take a short break!");
  const level = levelFor(bandForGrade(child.grade));
  const explored = new Set(d.explored.filter((w) => scene.items.some((i) => i.word === w)));
  if (explored.size < Math.min(6, scene.items.length)) throw new HttpError(400, "Explore at least 6 things in the scene first!");
  const safety = d.describe.trim() ? screenQuestion(d.describe) : null;
  if (safety) return ok({ safety: safety.reply });
  const qs = scene.questions.filter((q) => q.level === level);
  if (d.answers.length !== qs.length) throw new HttpError(400, "Please answer every question.");
  const task = scene.sentences.find((t) => t.level === level)!;
  const sentenceOk = checkSentence(task, d.sentence);
  const marks = qs.map((q, i) => ({ q: q.q, given: d.answers[i], answer: q.answer, correct: d.answers[i] === q.answer }));
  const correct = marks.filter((m) => m.correct).length;
  const desc = describeScore(scene.describe.keywords, d.describe);
  const describeOk = level === "young" ? desc.used.length >= 1 : desc.used.length >= 2 && desc.words >= 8;
  const score = Math.round(((correct + (sentenceOk ? 1 : 0) + (describeOk ? 1 : 0)) / (qs.length + 2)) * 100);
  await recordEvidence(child.id, "meaning", correct, qs.length, { source: "word_scene", contentId: scene.slug });
  await recordEvidence(child.id, "grammar_sentences", sentenceOk ? 1 : 0, 1, { source: "word_scene", contentId: scene.slug });
  if (d.describe.trim()) await recordEvidence(child.id, "usage", describeOk ? 1 : 0, 1, { source: "word_scene", contentId: scene.slug });
  await query(`insert into scene_progress (child_id, slug, best_score, completions) values ($1,$2,$3,1)
               on conflict (child_id, slug) do update set best_score = greatest(scene_progress.best_score, $3), completions = scene_progress.completions + 1, last_at = now()`, [child.id, scene.slug, score]);
  await logActivity(child.id, "word_scene", 180, { slug: scene.slug, score });
  const award = await awardXp(child.id, "word_scene", `scene:${child.id}:${scene.slug}:${todayKey()}`, { multiplier: 0.5 + score / 200 });
  return ok({ score, marks, sentenceOk, sentenceAnswer: task.answers[0], describe: { ok: describeOk, used: desc.used }, award, realLife: scene.realLife });
});
