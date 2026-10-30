import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one, query } from "@/server/db";

const COLUMN: Record<string, string> = { buddy: "buddy", theme: "theme" };

export const POST = childRoute(async (req, child) => {
  const { slug, unequip } = await body(req, z.object({ slug: z.string().max(60), unequip: z.boolean().optional() }));
  const r = await one<{ category: string }>(
    `select r.category from rewards r join child_rewards c on c.slug = r.slug and c.child_id = $1 where r.slug = $2`, [child.id, slug]);
  if (!r || !COLUMN[r.category]) throw new HttpError(400, "You don't own that yet.");
  const value = r.category === "buddy" ? slug.replace("buddy-", "") : slug;
  void unequip;
  await query(`update child_profiles set ${COLUMN[r.category]} = $2 where child_id = $1`, [child.id, value]);
  return ok();
});
