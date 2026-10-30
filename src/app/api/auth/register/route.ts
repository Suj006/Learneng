import { body, clientIp, HttpError, ok, publicRoute } from "@/server/api";
import { registerSchema } from "@/lib/validation";
import { one } from "@/server/db";
import { ipRateLimit, rateLimit } from "@/server/ratelimit";
import { assertGrade, createPendingChild, registerParent, sendVerification } from "@/server/accounts";
import { emailLayout, sendEmail } from "@/server/email";

export const POST = publicRoute(async (req) => {
  // Validate first: typo-and-retry by a parent must not count towards the limit.
  const d = await body(req, registerSchema);
  if (!(await ipRateLimit(`register:${await clientIp()}`, 8, 3600))) throw new HttpError(429, "Too many sign-ups from this network. Please try again in an hour.");
  const email = d.parentEmail.toLowerCase();
  await assertGrade(d.grade).catch(() => { throw new HttpError(400, "Please choose a grade."); });

  const existing = await one<{ id: string; email_verified_at: string | null }>(`select id, email_verified_at from parents where lower(email) = $1`, [email]);
  if (existing) {
    // Never reveal whether an e-mail is registered. Inform the real owner instead.
    await sendEmail(email, "Someone tried to sign up to PING VIBE with your e-mail",
      emailLayout("You already have a PING VIBE account", `<p style="color:#EAE4FF;line-height:1.6">Someone (hopefully you!) tried to create a new account with this e-mail. To add another child, log in as a parent and choose <b>Add child</b>. If this wasn't you, no action is needed.</p>`));
  } else {
    const parentId = await registerParent(email, d.password);
    await createPendingChild(parentId, { name: d.childName, birthMonth: d.birthMonth, birthYear: d.birthYear, grade: d.grade });
    await sendVerification(parentId, email, d.childName);
  }
  return ok({ ok: true, devMailbox: !process.env.RESEND_API_KEY && (process.env.NODE_ENV !== "production" || process.env.EMAIL_TRANSPORT === "dev-mailbox") });
});
