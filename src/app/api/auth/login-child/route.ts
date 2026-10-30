import { z } from "zod";
import { body, clientIp, HttpError, ok, publicRoute } from "@/server/api";
import { one } from "@/server/db";
import { verifyPassword } from "@/server/crypto";
import { rateLimit, resetRateLimit } from "@/server/ratelimit";
import { createSession } from "@/server/session";

export const POST = publicRoute(async (req) => {
  const { username, pin } = await body(req, z.object({
    username: z.string().trim().toLowerCase().min(3, "Type your Explorer name.").max(40),
    pin: z.string().regex(/^\d{6}$/, "Your secret PIN has 6 numbers."),
  }));
  const bucket = `login-child:${username}`;
  if (!(await rateLimit(bucket, 5, 900)) || !(await rateLimit(`login-ip:${await clientIp()}`, 40, 900)))
    throw new HttpError(429, "Too many tries! Ask a grown-up to help, or wait 15 minutes.");
  const c = await one<{ id: string; pin_hash: string | null; status: string }>(`select id, pin_hash, status from children where username = $1`, [username]);
  if (!c || c.status !== "active" || !(await verifyPassword(pin, c.pin_hash))) throw new HttpError(401, "Hmm, that Explorer name or PIN doesn't match. Try again!");
  await resetRateLimit(bucket);
  await createSession("child", c.id);
  return ok({ ok: true, redirect: "/world" });
});
