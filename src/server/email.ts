import "server-only";
import { query } from "./db";

/**
 * E-mail provider abstraction. Uses Resend's HTTP API when RESEND_API_KEY is set.
 * In development without a provider, mail is stored in dev_mailbox (viewable
 * at /dev/mailbox) and logged. In production without a provider, sending fails loudly.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (key) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "PING VIBE <hello@pingvibe.app>", to, subject, html }),
    });
    if (!res.ok) throw new Error(`E-mail provider error ${res.status}`);
    return;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("No e-mail provider configured (set RESEND_API_KEY).");
  }
  await query(`insert into dev_mailbox (to_email, subject, html) values ($1,$2,$3)`, [to, subject, html]);
  console.info(`[dev-mail] to=${to} subject="${subject}" — open /dev/mailbox to read it`);
}

export function emailLayout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#17132C;font-family:Arial,sans-serif;color:#fff">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px">
    <div style="font-size:28px;font-weight:800;letter-spacing:1px;color:#FFD65A">PING VIBE</div>
    <div style="font-size:13px;color:#EAE4FF;margin-bottom:24px">Your World. Your Words. Your Vibe.</div>
    <div style="background:#211B3F;border-radius:20px;padding:24px">
      <h1 style="font-size:22px;margin:0 0 12px">${title}</h1>${body}
    </div>
    <p style="font-size:12px;color:#9a93c9;margin-top:24px">You received this because a PING VIBE parent account uses this address. PING VIBE never shows children's details publicly.</p>
  </div></body></html>`;
}
