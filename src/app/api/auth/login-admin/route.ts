import { z } from "zod";
import { body, clientIp, HttpError, ok, publicRoute } from "@/server/api";
import { one } from "@/server/db";
import { verifyPassword } from "@/server/crypto";
import { rateLimit } from "@/server/ratelimit";
import { createSession } from "@/server/session";

export const POST = publicRoute(async (req) => {
  const { email, password } = await body(req, z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) }));
  if (!(await rateLimit(`login-admin:${await clientIp()}`, 10, 900))) throw new HttpError(429, "Too many attempts. Try again later.");
  const a = await one<{ id: string; password_hash: string }>(`select id, password_hash from admin_users where lower(email) = lower($1)`, [email]);
  if (!a || !(await verifyPassword(password, a.password_hash))) throw new HttpError(401, "Invalid credentials.");
  await createSession("admin", a.id);
  return ok({ ok: true, redirect: "/admin" });
});
