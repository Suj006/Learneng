import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { query } from "@/server/db";
import { activeThemes } from "@/server/themes";

/**
 * Saves the child's appearance (colour theme, animation intensity). Free and always changeable — never costs XP or coins,
 * and never touches learning data. theme: null resets to the default theme.
 */
export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({ theme: z.string().max(60).nullable().optional(), motion: z.enum(["full", "calm", "off"]).optional() }).strict());
  if (d.theme && !(await activeThemes()).some((t) => t.slug === d.theme)) throw new HttpError(400, "That theme isn't available.");
  if (d.theme !== undefined) await query(`update child_profiles set color_theme = $2 where child_id = $1`, [child.id, d.theme]);
  if (d.motion) await query(`update child_profiles set motion = $2 where child_id = $1`, [child.id, d.motion]);
  return ok();
});
