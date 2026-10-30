import { ok, parentRoute } from "@/server/api";
import { query } from "@/server/db";
import { destroySession } from "@/server/session";

/** Deletes the parent account and (via cascade) every child profile and learning record. */
export const DELETE = parentRoute(async (_req, parent) => {
  await query(`delete from auth_sessions where (subject_type = 'parent' and subject_id = $1) or (subject_type = 'child' and subject_id in (select id from children where parent_id = $1))`, [parent.id]);
  await query(`delete from parents where id = $1`, [parent.id]);
  await destroySession();
  return ok();
});
