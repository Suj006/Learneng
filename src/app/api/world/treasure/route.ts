import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one } from "@/server/db";
import { claimTreasure } from "@/server/world";

export const POST = childRoute(async (req, child) => {
  const { slug } = await body(req, z.object({ slug: z.string().max(60) }));
  const p = await one<{ level_id: number }>(`select level_id from child_profiles where child_id = $1`, [child.id]);
  const r = await claimTreasure(child.id, p?.level_id ?? 1, slug);
  if ("error" in r) throw new HttpError(400, r.error as string);
  return ok(r);
});
