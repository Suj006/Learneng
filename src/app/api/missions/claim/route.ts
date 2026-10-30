import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { claimMission } from "@/server/missions";

export const POST = childRoute(async (req, child) => {
  const { slug } = await body(req, z.object({ slug: z.string().max(60) }));
  const r = await claimMission(child.id, child.grade, slug);
  if ("error" in r) throw new HttpError(400, r.error as string);
  return ok(r);
});
