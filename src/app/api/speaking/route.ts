import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { query } from "@/server/db";
import { awardXp, logActivity } from "@/server/gamification";
import { SPEAKING_SCENARIOS } from "@/server/content/catalog";
import { todayKey } from "@/server/time";
import { markActivity } from "@/server/journey";
import { trackUsage } from "@/server/vocab";
import { recordEvidence } from "@/server/skills";
import { one } from "@/server/db";

/**
 * Speech is recognised in the browser; only the accuracy score is sent.
 * No audio or transcript ever reaches or is stored on the server.
 */
export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({
    scenario: z.string().max(40), lines: z.number().int().min(1).max(20),
    accuracy: z.number().int().min(0).max(100).nullable(), seconds: z.number().min(0).max(3600),
    spokenText: z.string().max(2000).optional(),
  }));
  const known = SPEAKING_SCENARIOS.some((s) => s.slug === d.scenario) || d.scenario === "word-practice" || (await one(`select 1 from speaking_scenarios where slug = $1 and active`, [d.scenario]));
  if (!known) throw new HttpError(404, "Scenario not found.");
  await query(`insert into speaking_sessions (child_id, scenario, lines, accuracy, assessed) values ($1,$2,$3,$4,$5)`,
    [child.id, d.scenario, d.lines, d.accuracy, d.accuracy !== null]);
  await logActivity(child.id, "speaking", d.seconds, { scenario: d.scenario });
  await markActivity(child.id, "speaking");
  if (d.accuracy !== null) {
    await recordEvidence(child.id, "pronunciation", Math.round((d.lines * d.accuracy) / 100), d.lines);
    await recordEvidence(child.id, "speaking_lines", Math.round((d.lines * d.accuracy) / 100), d.lines);
    if (d.scenario !== "word-practice") await recordEvidence(child.id, "conversation", d.accuracy >= 70 ? 1 : 0, 1);
  }
  // The target lines (never a transcript) are used to credit words the child practised aloud.
  if (d.accuracy !== null && d.spokenText) await trackUsage(child.id, d.spokenText, "used_in_speaking");
  const award = await awardXp(child.id, "speaking_challenge", `speaking:${child.id}:${d.scenario}:${todayKey()}`, { multiplier: d.accuracy === null ? 0.8 : 0.5 + d.accuracy / 200 });
  return ok({ award });
});
