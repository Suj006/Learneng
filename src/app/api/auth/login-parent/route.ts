import { z } from "zod";
import { body, clientIp, HttpError, ok, publicRoute } from "@/server/api";
import { one } from "@/server/db";
import { verifyPassword } from "@/server/crypto";
import { ipRateLimit, rateLimit, resetRateLimit } from "@/server/ratelimit";
import { createSession } from "@/server/session";

export const POST = publicRoute(async (req) => {
  const { email, password } = await body(req, z.object({ email: z.string().trim().email("Enter a valid e-mail."), password: z.string().min(1).max(128) }));
  const bucket = `login-parent:${email.toLowerCase()}`;
  if (!(await rateLimit(bucket, 8, 900)) || !(await ipRateLimit(`login-ip:${await clientIp()}`, 40, 900)))
    throw new HttpError(429, "Too many attempts. Please wait 15 minutes and try again.");
  const p = await one<{ id: string; password_hash: string; email_verified_at: string | null; consent_given_at: string | null }>(
    `select id, password_hash, email_verified_at, consent_given_at from parents where lower(email) = lower($1)`, [email]);
  if (!p || !(await verifyPassword(password, p.password_hash))) throw new HttpError(401, "E-mail or password is not correct.");
  if (!p.email_verified_at) throw new HttpError(403, "Please verify your e-mail first. Check your inbox for the link.", { unverified: true });
  await resetRateLimit(bucket);
  await createSession("parent", p.id);
  const pending = await one(`select 1 from children where parent_id = $1 and status = 'pending_consent'`, [p.id]);
  return ok({ ok: true, redirect: pending ? "/parent/consent" : "/parent" });
});
