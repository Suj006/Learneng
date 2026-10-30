import { z } from "zod";
import { randomUUID } from "node:crypto";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one, query } from "@/server/db";
import { awardXp, logActivity } from "@/server/gamification";
import { applyPractice } from "@/server/vocab";
import { markActivity } from "@/server/journey";

const PLAN_TYPE: Record<string, "spelling" | "sentence" | "boss_battle"> = { "spell-master": "spelling", "sentence-builder": "sentence", "boss-battle": "boss_battle" };

export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({
    slug: z.string().max(40), score: z.number().int().min(0).max(1000), max: z.number().int().min(1).max(1000),
    seconds: z.number().min(0).max(3600),
    results: z.array(z.object({ wordId: z.string().uuid(), correct: z.boolean() })).max(60),
  }));
  const game = await one(`select slug from games where slug = $1 and active`, [d.slug]);
  if (!game) throw new HttpError(404, "Game not found.");
  const score = Math.min(d.score, d.max);
  // XP scales with performance and is capped per day by xp_config (anti-farming).
  const award = await awardXp(child.id, "word_game", `game:${child.id}:${d.slug}:${randomUUID()}`, { multiplier: 0.25 + 0.75 * (score / d.max), reason: `Game: ${d.slug}` });
  await query(`insert into game_sessions (child_id, game_slug, score, max_score, xp_awarded) values ($1,$2,$3,$4,$5)`, [child.id, d.slug, score, d.max, award.xp]);
  await applyPractice(child.id, d.results);
  await markActivity(child.id, "game");
  if (PLAN_TYPE[d.slug]) await markActivity(child.id, PLAN_TYPE[d.slug]);
  await logActivity(child.id, "word_games", d.seconds, { game: d.slug, score, max: d.max });
  const best = await one<{ best: number; plays: number }>(`select max(score)::int best, count(*)::int plays from game_sessions where child_id = $1 and game_slug = $2`, [child.id, d.slug]);
  return ok({ award, best: best?.best ?? score, plays: best?.plays ?? 1 });
});
