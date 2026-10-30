import { HttpError, ok, parentRoute } from "@/server/api";
import { one, query } from "@/server/db";

/** DPDP right to erasure: permanently deletes the child and all learning data (cascade). */
export const DELETE = parentRoute(async (_req, parent, params: { id: string }) => {
  const c = await one(`select id from children where id = $1 and parent_id = $2`, [params.id, parent.id]);
  if (!c) throw new HttpError(404, "Child not found.");
  await query(`delete from auth_sessions where subject_type = 'child' and subject_id = $1`, [params.id]);
  await query(`delete from children where id = $1`, [params.id]);
  return ok();
});
