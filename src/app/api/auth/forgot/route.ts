import { z } from "zod";
import { body, clientIp, HttpError, ok, publicRoute } from "@/server/api";
import { one, query } from "@/server/db";
import { randomToken, sha256 } from "@/server/crypto";
import { ipRateLimit, rateLimit } from "@/server/ratelimit";
import { emailLayout, sendEmail } from "@/server/email";

/** Always answers the same way so e-mail addresses can't be enumerated. */
export const POST = publicRoute(async (req) => {
  const { email } = await body(req, z.object({ email: z.string().trim().email("Enter a valid e-mail.") }));
  if (!(await rateLimit(`forgot:${email.toLowerCase()}`, 3, 3600)) || !(await ipRateLimit(`forgot-ip:${await clientIp()}`, 10, 3600)))
    throw new HttpError(429, "Please wait a little before asking again.");
  const p = await one<{ id: string }>(`select id from parents where lower(email) = lower($1)`, [email]);
  if (p) {
    const token = randomToken();
    await query(`insert into auth_tokens (token_hash, parent_id, purpose, expires_at) values ($1,$2,'reset_password', now() + interval '1 hour')`, [sha256(token), p.id]);
    const url = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${encodeURIComponent(token)}`;
    await sendEmail(email, "Reset your PING VIBE password", emailLayout("Reset your password",
      `<p style="color:#EAE4FF;line-height:1.6">Someone asked to reset the password for this parent account.</p>
       <p style="margin:28px 0"><a href="${url}" style="background:#7047FF;color:#fff;padding:14px 26px;border-radius:999px;text-decoration:none;font-weight:bold">Choose a new password</a></p>
       <p style="color:#9a93c9;font-size:13px">This link expires in 1 hour. If you didn't ask, ignore this e-mail — your password won't change.</p>`));
  }
  return ok({ ok: true, devMailbox: !process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production" });
});
