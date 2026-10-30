import { childRoute, ok } from "@/server/api";
import { query } from "@/server/db";

export const POST = childRoute(async (_req, child) => {
  await query(`update notifications set read_at = now() where child_id = $1 and read_at is null`, [child.id]);
  return ok();
});
