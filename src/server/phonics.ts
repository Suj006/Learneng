import "server-only";
import { query, tx } from "./db";
import { buildUnit, unitState, UNITS, type PKey } from "@/lib/phonics";
import { bandForGrade } from "@/lib/grades";
import { recordEvidence } from "./skills";
import { awardXp, logActivity } from "./gamification";
import { todayKey } from "./time";

export async function phonicsUnits(childId: string, grade: string) {
  const rows = await query<{ unit: string; best_score: number; completions: number }>(`select unit, best_score, completions from phonics_progress where child_id = $1`, [childId]);
  const best = Object.fromEntries(rows.map((r) => [r.unit, r.best_score]));
  return unitState(bandForGrade(grade), best).map((u) => ({ ...u, completions: rows.find((r) => r.unit === u.slug)?.completions ?? 0 }));
}

export async function startUnit(childId: string, grade: string, unit: string) {
  const u = (await phonicsUnits(childId, grade)).find((x) => x.slug === unit);
  if (!u) return { error: "Unit not found.", status: 404 } as const;
  if (!u.open) return { error: "Pass the unit before this one to open it! 🔒", status: 400 } as const;
  const { questions, key } = buildUnit(unit, Math.floor(Math.random() * 1e9), 6);
  const row = (await query<{ id: string }>(`insert into phonics_attempts (child_id, unit, key, total) values ($1,$2,$3,$4) returning id`, [childId, unit, JSON.stringify(key), key.length]))[0];
  return { attemptId: row.id, unit: UNITS.find((x) => x.slug === unit)!, questions } as const;
}

/** One answer at a time (immediate feedback); the last answer completes the unit, records evidence and rewards once a day per unit. */
export async function answerPhonics(childId: string, attemptId: string, index: number, choice: string) {
  const r = await tx(async (q) => {
    const a = (await q.query<{ id: string; unit: string; key: PKey[]; answers: string[]; correct: number; total: number; completed_at: string | null }>(
      `select id, unit, key, answers, correct, total, completed_at from phonics_attempts where id = $1 and child_id = $2 for update`, [attemptId, childId])).rows[0];
    if (!a || a.completed_at) return { error: "This practice has finished. Start a new one!" } as const;
    if (index !== a.answers.length || index >= a.total) return { error: "Please answer the questions in order." } as const;
    const k = a.key[index];
    const right = choice === k.answer;
    const answers = [...a.answers, choice];
    const correct = a.correct + (right ? 1 : 0);
    const done = answers.length === a.total;
    await q.query(`update phonics_attempts set answers = $2, correct = $3, completed_at = case when $4 then now() else null end where id = $1`, [a.id, JSON.stringify(answers), correct, done]);
    return { right, answer: k.answer, explain: k.explain, done, correct, total: a.total, unit: a.unit } as const;
  });
  if ("error" in r || !r.done) return r;
  const score = Math.round((100 * r.correct) / r.total);
  await query(`insert into phonics_progress (child_id, unit, best_score, completions) values ($1,$2,$3,1)
               on conflict (child_id, unit) do update set best_score = greatest(phonics_progress.best_score, $3), completions = phonics_progress.completions + 1, last_at = now()`, [childId, r.unit, score]);
  await recordEvidence(childId, "phonics", r.correct, r.total, { source: "phonics", contentId: r.unit });
  await logActivity(childId, "phonics", 90, { unit: r.unit, score });
  const award = await awardXp(childId, "phonics", `phonics:${childId}:${r.unit}:${todayKey()}`, { multiplier: 0.5 + score / 200 });
  return { ...r, score, passed: score >= 60, award };
}
