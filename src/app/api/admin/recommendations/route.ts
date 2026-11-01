import { z } from "zod";
import { adminRoute, body, HttpError, ok } from "@/server/api";
import { one, query } from "@/server/db";
import { recommendations } from "@/server/recommend";

/** Preview a child's recommendations by login name (read-only; nothing is persisted for a preview). */
export const GET = adminRoute(async (req) => {
  const u = new URL(req.url).searchParams.get("username")?.trim().toLowerCase() ?? "";
  if (!/^[a-z0-9]{3,40}$/.test(u)) throw new HttpError(400, "Enter a valid login name.");
  const c = await one<{ id: string; grade: string; display_name: string }>(`select id, grade, display_name from children where lower(username) = $1 and status = 'active'`, [u]);
  if (!c) throw new HttpError(404, "No active explorer with that login name.");
  return ok({ child: { grade: c.grade, name: c.display_name }, recommendations: await recommendations(c, { persist: false }) });
});

/** Prioritise or exclude a specific story / scenario / grammar topic / phonics unit / game in recommendations. */
export const POST = adminRoute(async (req) => {
  const d = await body(req, z.discriminatedUnion("op", [
    z.object({ op: z.literal("set"), kind: z.enum(["story", "scenario", "grammar", "phonics", "game"]), ref: z.string().regex(/^[a-z0-9-]{2,60}$/), action: z.enum(["prioritise", "exclude"]), note: z.string().max(200).optional() }),
    z.object({ op: z.literal("delete"), id: z.string().uuid() }),
  ]));
  if (d.op === "delete") { await query(`delete from recommendation_rules where id = $1`, [d.id]); return ok(); }
  await query(`insert into recommendation_rules (kind, ref, action, note) values ($1,$2,$3,$4) on conflict (kind, ref) do update set action = $3, note = $4`, [d.kind, d.ref, d.action, d.note ?? null]);
  return ok();
});
