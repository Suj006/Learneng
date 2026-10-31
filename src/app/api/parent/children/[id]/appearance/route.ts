import { z } from "zod";
import { body, HttpError, ok, parentRoute } from "@/server/api";
import { one, query } from "@/server/db";
import { activeThemes } from "@/server/themes";

/** A parent can guide their own child's look (colour theme, animation intensity). Learning data is never touched. */
export const POST = parentRoute(async (req, parent, params: { id: string }) => {
  const d = await body(req, z.object({ theme: z.string().max(60).nullable().optional(), motion: z.enum(["full", "calm", "off"]).optional() }).strict());
  const c = await one(`select id from children where id = $1 and parent_id = $2 and status = 'active'`, [params.id, parent.id]);
  if (!c) throw new HttpError(404, "Child not found.");
  if (d.theme && !(await activeThemes()).some((t) => t.slug === d.theme)) throw new HttpError(400, "That theme isn't available.");
  if (d.theme !== undefined) await query(`update child_profiles set color_theme = $2 where child_id = $1`, [params.id, d.theme]);
  if (d.motion) await query(`update child_profiles set motion = $2 where child_id = $1`, [params.id, d.motion]);
  return ok();
});
