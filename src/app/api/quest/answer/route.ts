import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one, query } from "@/server/db";
import { todayKey } from "@/server/time";
import { applyResult, isCorrect, type Word } from "@/server/vocab";
import { evidenceForAnswer, recordEvidence } from "@/server/skills";

export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({
    wordId: z.string().uuid(),
    type: z.enum(["meaning", "picture", "spelling", "fill_blank", "usage"]),
    answer: z.string().max(300),
  }));
  const s = await one<{ id: string; new_word_ids: string[]; review_word_ids: string[] }>(
    `select id, new_word_ids, review_word_ids from daily_learning_sessions where child_id = $1 and session_date = $2::date`, [child.id, todayKey()]);
  if (!s || ![...s.new_word_ids, ...s.review_word_ids].includes(d.wordId)) throw new HttpError(400, "That word isn't part of today's quest.");
  const word = await one<Word>(`select * from vocabulary_master where id = $1`, [d.wordId]);
  if (!word) throw new HttpError(404, "Word not found.");
  const correct = isCorrect(word, d.type, d.answer);

  // First attempt only counts toward accuracy and mastery.
  const ins = await query(
    `insert into daily_word_challenges (session_id, child_id, word_id, challenge_type, correct) values ($1,$2,$3,$4,$5)
     on conflict (session_id, word_id, challenge_type) do nothing returning id`,
    [s.id, child.id, d.wordId, d.type, correct],
  );
  if (ins.length) {
    await query(`update daily_learning_sessions set attempted = attempted + 1, correct = correct + $2::int where id = $1`, [s.id, correct ? 1 : 0]);
    await applyResult(child.id, d.wordId, correct);
    for (const ev of evidenceForAnswer(d.type, word.band)) await recordEvidence(child.id, ev, correct ? 1 : 0, 1);
  }
  const answer = d.type === "meaning" ? word.meaning : d.type === "usage" ? word.example : word.word;
  return ok({ correct, answer, word: word.word, example: word.example, firstAttempt: ins.length > 0 });
});
