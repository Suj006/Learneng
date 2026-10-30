import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one, query } from "@/server/db";
import { rateLimit } from "@/server/ratelimit";
import { evaluateWriting } from "@/server/ai/writing";
import { awardXp, logActivity } from "@/server/gamification";
import { markActivity } from "@/server/journey";
import { trackUsage } from "@/server/vocab";
import { recordEvidence } from "@/server/skills";

export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({ submissionId: z.string().uuid(), seconds: z.number().min(0).max(7200) }));
  const s = await one<{ id: string; kind: string; title: string; content: string; status: string; word_count: number; topic_id: string | null; prompt_meta: Record<string, string> }>(
    `select id, kind, title, content, status, word_count, topic_id, prompt_meta from writing_submissions where id = $1 and child_id = $2`, [d.submissionId, child.id]);
  if (!s) throw new HttpError(404, "Writing not found.");
  if (s.status === "evaluated") throw new HttpError(400, "This piece was already checked by GRAMMY.");
  if (s.word_count < 3) throw new HttpError(400, "Write at least a few words first! ✏️");
  if (!(await rateLimit(`writing-eval:${child.id}`, 12, 3600))) throw new HttpError(429, "GRAMMY is resting her wand. Try again a bit later!");

  const topic = s.topic_id ? await one<{ prompt: string; min_words: number; suggested_words: string[] }>(`select prompt, min_words, suggested_words from writing_topics where id = $1`, [s.topic_id]) : null;
  const meta = s.prompt_meta ?? {};
  const required = s.kind === "story_builder" ? [meta.character, meta.location, meta.object].filter(Boolean) : [];
  await query(`update writing_submissions set status = 'submitted', submitted_at = now() where id = $1`, [s.id]);

  const { evaluation, evaluator, model } = await evaluateWriting({
    text: s.content, title: s.title, grade: child.grade,
    prompt: topic?.prompt ?? `Write a story using: ${required.join(", ")}. Challenge: ${meta.situation ?? ""}`,
    minWords: topic?.min_words ?? Number(meta.minWords ?? 40),
    suggestedWords: topic?.suggested_words ?? (meta.words ? meta.words.split(",") : []),
    requiredElements: required,
  });
  await query(
    `insert into writing_evaluations (submission_id, score, breakdown, feedback, evaluator, model) values ($1,$2,$3,$4,$5,$6)`,
    [s.id, evaluation.score, JSON.stringify(evaluation.breakdown), JSON.stringify(evaluation), evaluator, model]);
  await query(`update writing_submissions set status = 'evaluated' where id = $1`, [s.id]);
  if (evaluation.needs_adult_attention) {
    await query(`insert into notifications (parent_id, title, body, kind) values ($1,$2,$3,'safeguarding')`, [child.parent_id,
      `Please check in with ${child.display_name}`, `Something in ${child.display_name}'s recent writing ("${s.title}") may need a caring adult's attention. You can read it in the parent dashboard.`]);
  }
  await logActivity(child.id, s.kind === "story_builder" ? "story_builder" : "writing", d.seconds, { score: evaluation.score });
  await markActivity(child.id, s.kind === "story_builder" ? "story" : "writing");
  const wordsUsed = await trackUsage(child.id, s.content, "used_in_writing");
  const b = evaluation.breakdown;
  await recordEvidence(child.id, "writing_spelling", b.spelling, 10);
  await recordEvidence(child.id, "writing_sentences", b.sentence_structure, 10);
  await recordEvidence(child.id, "writing_creativity", b.creativity, 10);
  await recordEvidence(child.id, "writing_vocabulary", b.vocabulary, 10);
  if ((s.content.match(/[.!?]+/g) ?? []).length >= 3) await recordEvidence(child.id, "writing_paragraph", evaluation.score >= 60 ? 1 : 0, 1);
  if (s.kind === "story_builder") await recordEvidence(child.id, "story_builder", evaluation.score >= 60 ? 1 : 0, 1);
  const key = s.kind === "story_builder" ? "story_builder" : "writing_mission";
  const award = await awardXp(child.id, key, `writing:${s.id}`, { multiplier: 0.5 + evaluation.score / 200 });
  return ok({ evaluation, evaluator, award, wordsUsed });
});
