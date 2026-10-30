import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one, query } from "@/server/db";

export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({ slug: z.string().max(40), nickname: z.string().trim().max(20).regex(/^[\p{L}\p{N} '-]*$/u, "Use letters and numbers only.").optional() }));
  const owned = await one(`select 1 from child_pets where child_id = $1 and pet_slug = $2`, [child.id, d.slug]);
  if (!owned) throw new HttpError(400, "Unlock this pet by learning first!");
  await query(`update child_profiles set active_pet = $2 where child_id = $1`, [child.id, d.slug]);
  if (d.nickname !== undefined) await query(`update child_pets set nickname = nullif($3,'') where child_id = $1 and pet_slug = $2`, [child.id, d.slug, d.nickname]);
  return ok();
});
