import { z } from "zod";
import { body, HttpError, ok, parentRoute } from "@/server/api";
import { one } from "@/server/db";
import { createSession, destroySession } from "@/server/session";

/** Hands the device to the child: ends the parent session and starts the child's. */
export const POST = parentRoute(async (req, parent) => {
  const { childId } = await body(req, z.object({ childId: z.string().uuid() }));
  const c = await one(`select id from children where id = $1 and parent_id = $2 and status = 'active'`, [childId, parent.id]);
  if (!c) throw new HttpError(404, "Child not found or not yet activated.");
  await destroySession();
  await createSession("child", childId);
  return ok({ ok: true, redirect: "/world" });
});
