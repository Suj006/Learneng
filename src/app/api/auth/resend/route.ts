import { z } from "zod";
import { body, clientIp, HttpError, ok, publicRoute } from "@/server/api";
import { one } from "@/server/db";
import { rateLimit } from "@/server/ratelimit";
import { sendVerification } from "@/server/accounts";

export const POST = publicRoute(async (req) => {
  const { email } = await body(req, z.object({ email: z.string().trim().email() }));
  if (!(await rateLimit(`resend:${email.toLowerCase()}`, 3, 3600)) || !(await rateLimit(`resend-ip:${await clientIp()}`, 10, 3600)))
    throw new HttpError(429, "Please wait a little before asking for another e-mail.");
  const p = await one<{ id: string; email_verified_at: string | null; name: string | null }>(
    `select p.id, p.email_verified_at, (select display_name from children c where c.parent_id = p.id order by created_at limit 1) name
     from parents p where lower(email) = lower($1)`, [email]);
  if (p && !p.email_verified_at) await sendVerification(p.id, email, p.name ?? "your child");
  return ok();
});
