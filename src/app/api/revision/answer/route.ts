import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one } from "@/server/db";
import { applyResult, isCorrect, type Word } from "@/server/vocab";
import { evidenceForAnswer, recordEvidence } from "@/server/skills";

/** Server-validated revision answers feed spaced repetition (box rises at most once per day). */
export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({ wordId: z.string().uuid(), type: z.enum(["meaning", "picture", "spelling", "fill_blank", "usage"]), answer: z.string().max(300) }));
  const word = await one<Word>(
    `select v.* from vocabulary_master v join child_vocabulary_progress p on p.word_id = v.id and p.child_id = $1 where v.id = $2`, [child.id, d.wordId]);
  if (!word) throw new HttpError(404, "You haven't discovered that word yet.");
  const correct = isCorrect(word, d.type, d.answer);
  await applyResult(child.id, d.wordId, correct);
  for (const ev of evidenceForAnswer(d.type, word.band)) await recordEvidence(child.id, ev, correct ? 1 : 0, 1);
  return ok({ correct, answer: d.type === "meaning" ? word.meaning : d.type === "usage" ? word.example : word.word });
});
