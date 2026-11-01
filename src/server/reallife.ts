import "server-only";
import { one, query, tx } from "./db";
import { awardXp, logActivity } from "./gamification";
import { recordEvidence } from "./skills";
import { todayKey } from "./time";
import { evaluateAnswer, fillReply, suggestLevel, turnsFor, type Level, type Scenario } from "@/lib/reallife";
import { estimate, MIN_EVIDENCE } from "./skills";

/** Real-world English evidence → 0–100 (null until there is enough evidence to trust it). */
export async function realWorldScore(childId: string): Promise<number | null> {
  const r = await one<{ correct: number; attempts: number }>(`select coalesce(sum(correct),0)::int correct, coalesce(sum(attempts),0)::int attempts from skill_evidence where child_id = $1 and skill in ('real_world')`, [childId]);
  return r && r.attempts >= Math.min(MIN_EVIDENCE, 8) ? estimate(r.correct, r.attempts) : null;
}

export async function scenarios() {
  return query<{ slug: string; title: string; emoji: string; band_min: number; content: Scenario }>(`select slug, title, emoji, band_min, content from real_life_scenarios where active order by sort_order, title`);
}

export async function listForChild(childId: string, band: number) {
  const [all, prog, score] = await Promise.all([
    scenarios(),
    query<{ slug: string; level: string; completions: number; best_score: number }>(`select slug, level, completions, best_score from real_life_progress where child_id = $1`, [childId]),
    realWorldScore(childId),
  ]);
  const suggested = suggestLevel(band, score);
  return all.map((s) => ({
    slug: s.slug, title: s.title, emoji: s.emoji, place: s.content.place, intro: s.content.intro, bandMin: s.band_min,
    done: Object.fromEntries(prog.filter((p) => p.slug === s.slug).map((p) => [p.level, p.best_score])) as Record<string, number>,
    suggested,
  }));
}

/** What the child's browser receives for a turn: never which answer is correct. */
export function publicTurn(s: Scenario, level: Level, i: number) {
  const t = turnsFor(s, level)[i];
  return t ? { index: i, say: t.say, task: t.task, options: t.options.map((o) => ({ text: o.text, emoji: o.emoji ?? null })) } : null;
}

export async function startRun(childId: string, slug: string, level: Level) {
  const sc = await one<{ content: Scenario }>(`select content from real_life_scenarios where slug = $1 and active`, [slug]);
  if (!sc) return null;
  const total = turnsFor(sc.content, level).length;
  const run = await one<{ id: string }>(`insert into real_life_runs (child_id, slug, level, turns_total) values ($1,$2,$3,$4) returning id`, [childId, slug, level, total]);
  return { runId: run!.id, total, turn: publicTurn(sc.content, level, 0) };
}

/**
 * One answer for the current turn, judged on the server. Choices are judged by index; typed or spoken answers by
 * intent matching (many natural phrasings accepted). After two unsuccessful tries the model answer is shown and the
 * child may continue, so nobody gets stuck.
 */
export async function answerTurn(childId: string, runId: string, input: { option?: number; text?: string; mode: "choice" | "text" | "voice"; skip?: boolean }) {
  return tx(async (q) => {
    const run = (await q.query<{ id: string; slug: string; level: Level; turn_index: number; turns_total: number; great: number; ok: number; retries: number; turn_tries: number; completed_at: string | null }>(
      `select id, slug, level, turn_index, turns_total, great, ok, retries, turn_tries, completed_at from real_life_runs where id = $1 and child_id = $2 for update`, [runId, childId])).rows[0];
    if (!run || run.completed_at) return { error: "This conversation has finished. Start a new one!" } as const;
    const sc = (await q.query<{ content: Scenario }>(`select content from real_life_scenarios where slug = $1`, [run.slug])).rows[0].content;
    const turn = turnsFor(sc, run.level)[run.turn_index];
    let result: "great" | "ok" | "retry"; let item: string | null = null; let tip: string | null = null;
    if (input.skip && run.turn_tries >= 2) { result = "ok"; tip = null; }
    else if (input.mode === "choice" && typeof input.option === "number" && turn.options[input.option]) {
      const o = turn.options[input.option]; result = o.result; tip = o.tip ?? (o.result === "retry" ? turn.hint : null);
      if (result !== "retry") item = evaluateAnswer(turn, o.text).item;
    } else {
      const ev = evaluateAnswer(turn, String(input.text ?? "").slice(0, 300)); result = ev.result; item = ev.item; tip = ev.tip;
    }
    if (result === "retry") {
      const tries = run.turn_tries + 1;
      await q.query(`update real_life_runs set retries = retries + 1, turn_tries = $2, mode = $3 where id = $1`, [run.id, tries, input.mode]);
      return { result, tip, model: tries >= 2 ? turn.model : null, canSkip: tries >= 2, done: false } as const;
    }
    const next = run.turn_index + 1; const done = next >= run.turns_total;
    await q.query(`update real_life_runs set turn_index = $2, great = great + $3, ok = ok + $4, turn_tries = 0, mode = $5, completed_at = case when $6 then now() else null end where id = $1`,
      [run.id, next, result === "great" ? 1 : 0, result === "ok" ? 1 : 0, input.mode, done]);
    return { result, tip, reply: fillReply(turn.reply, item), next: done ? null : publicTurn(sc, run.level, next), done,
      summary: done ? { great: run.great + (result === "great" ? 1 : 0), ok: run.ok + (result === "ok" ? 1 : 0), retries: run.retries, total: run.turns_total, slug: run.slug, level: run.level, mode: input.mode } : null } as const;
  });
}

/** Completion: learning history, skill evidence, passport stamp (once) and the existing reward engine. */
export async function completeRun(childId: string, s: { great: number; ok: number; retries: number; total: number; slug: string; level: Level; mode: string }) {
  const score = Math.round(((s.great + s.ok * 0.7) / Math.max(1, s.total + s.retries * 0.5)) * 100);
  await query(`insert into real_life_progress (child_id, slug, level, completions, best_score, last_completed_at) values ($1,$2,$3,1,$4,now())
    on conflict (child_id, slug, level) do update set completions = real_life_progress.completions + 1, best_score = greatest(real_life_progress.best_score, $4), last_completed_at = now()`,
    [childId, s.slug, s.level, score]);
  // Real-world English is its own skill; typed/spoken answers also count as conversation practice, choices as listening.
  await recordEvidence(childId, "real_world", s.great + s.ok, s.total + s.retries);
  await recordEvidence(childId, s.mode === "choice" ? "listening" : "conversation", s.great + s.ok, s.total + s.retries);
  const sc = await one<{ title: string; emoji: string }>(`select title, emoji from real_life_scenarios where slug = $1`, [s.slug]);
  await query(`insert into passport_stamps (child_id, slug, title, emoji, kind) values ($1,$2,$3,$4,'real_life') on conflict do nothing`, [childId, `rl-${s.slug}`, sc?.title ?? s.slug, sc?.emoji ?? "🌍"]);
  await logActivity(childId, "real_life", 0, { slug: s.slug, level: s.level, score });
  const award = await awardXp(childId, "real_life", `reallife:${childId}:${s.slug}:${s.level}:${todayKey()}`);
  return { score, award };
}
