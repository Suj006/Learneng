import { z } from "zod";
import { randomUUID } from "node:crypto";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one } from "@/server/db";
import { DRILL_TOPICS, generateDrills } from "@/server/practice";
import { awardXp, logActivity } from "@/server/gamification";
import { skillBand } from "@/server/journey";
import { bandForGrade } from "@/lib/grades";

export const GET = childRoute(async (req, child) => {
  const topic = req.nextUrl.searchParams.get("topic") ?? "sentence";
  if (!DRILL_TOPICS.some((t) => t.key === topic)) throw new HttpError(404, "Unknown drill.");
  const p = await one<{ skill_grammar: number }>(`select skill_grammar from child_profiles where child_id = $1`, [child.id]);
  const band = skillBand(bandForGrade(child.grade), p?.skill_grammar ?? 50);
  return ok({ exercises: await generateDrills(topic, band, 6) });
});

export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({ topic: z.string().max(30), correct: z.number().int().min(0).max(20), total: z.number().int().min(1).max(20), seconds: z.number().min(0).max(3600) }));
  await logActivity(child.id, "grammar_drill", d.seconds, { topic: d.topic, correct: d.correct });
  const award = await awardXp(child.id, "grammar_challenge", `drill:${child.id}:${randomUUID()}`, { multiplier: 0.2 + 0.6 * Math.min(1, d.correct / d.total) });
  return ok({ award });
});
