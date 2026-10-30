import { z } from "zod";
import { body, HttpError, ok, publicRoute } from "@/server/api";
import { one, query } from "@/server/db";
import { hashPassword, sha256 } from "@/server/crypto";
import { password } from "@/lib/validation";

export const POST = publicRoute(async (req) => {
  const d = await body(req, z.object({ token: z.string().min(10).max(200), password }));
  const t = await one<{ parent_id: string }>(
    `update auth_tokens set used_at = now() where token_hash = $1 and purpose = 'reset_password' and used_at is null and expires_at > now() returning parent_id`, [sha256(d.token)]);
  if (!t) throw new HttpError(400, "This reset link has expired or was already used. Please request a new one.");
  await query(`update parents set password_hash = $2, email_verified_at = coalesce(email_verified_at, now()), updated_at = now() where id = $1`, [t.parent_id, await hashPassword(d.password)]);
  // Sign out every device on this account.
  await query(`delete from auth_sessions where subject_type = 'parent' and subject_id = $1`, [t.parent_id]);
  return ok({ ok: true });
});
