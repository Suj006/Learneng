import { z } from "zod";
import { adminRoute, body, HttpError, ok } from "@/server/api";
import { query } from "@/server/db";
import { publish } from "@/server/content/pipeline";

export const POST = adminRoute(async (req, admin) => {
  const d = await body(req, z.object({ id: z.string().uuid(), action: z.enum(["publish", "reject"]) }));
  if (d.action === "reject") {
    await query(`update content_library set status = 'rejected', reviewed_by = $2, reviewed_at = now() where id = $1`, [d.id, admin.id]);
    return ok();
  }
  try { await publish(d.id, admin.id); } catch (e) { throw new HttpError(400, (e as Error).message); }
  return ok();
});
