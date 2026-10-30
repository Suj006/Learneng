import { z } from "zod";
import { body, HttpError, ok, parentRoute } from "@/server/api";
import { one, query } from "@/server/db";
import { hashPassword } from "@/server/crypto";
import { pinSchema } from "@/lib/validation";
import { resetRateLimit } from "@/server/ratelimit";

export const POST = parentRoute(async (req, parent, params: { id: string }) => {
  const { pin } = await body(req, z.object({ pin: pinSchema }));
  const c = await one<{ username: string }>(`select username from children where id = $1 and parent_id = $2 and status = 'active'`, [params.id, parent.id]);
  if (!c) throw new HttpError(404, "Child not found.");
  await query(`update children set pin_hash = $2, updated_at = now() where id = $1`, [params.id, await hashPassword(pin)]);
  await query(`delete from auth_sessions where subject_type = 'child' and subject_id = $1`, [params.id]);
  // A parent-verified PIN reset also lifts any lockout from earlier wrong guesses.
  await resetRateLimit(`login-child:${c.username}`);
  return ok();
});
