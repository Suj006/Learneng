import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/server/db";
import { APP_TZ } from "@/server/time";
import { emailLayout, sendEmail } from "@/server/email";
import { rateLimit } from "@/server/ratelimit";
import { childReport, weeklyStory } from "@/server/reports";
import { cronAuthorized, unauthorized } from "@/server/cron";
import { escapeHtml } from "@/server/accounts";

/**
 * Hourly. One gentle e-mail to PARENTS (never children) at their chosen hour,
 * only when a child hasn't learned today. Max one per parent per day.
 */
export async function GET(req: NextRequest) {
  if (!cronAuthorized(req)) return unauthorized();
  const due = await query<{ parent_id: string; email: string; child_id: string; name: string }>(
    `select p.id parent_id, p.email, c.id child_id, c.display_name name from parents p join children c on c.parent_id = p.id and c.status = 'active'
     where p.reminders_enabled and p.reminder_hour = extract(hour from now() at time zone $1)::int
       and not exists (select 1 from xp_transactions x where x.child_id = c.id and (x.created_at at time zone $1)::date = (now() at time zone $1)::date)`, [APP_TZ]);
  let sent = 0;
  for (const d of due) {
    if (!(await rateLimit(`reminder:${d.parent_id}:${new Date().toISOString().slice(0, 10)}`, 1, 86400))) continue;
    const story = weeklyStory(d.name, await childReport(d.child_id));
    await sendEmail(d.email, `${d.name}'s PING VIBE adventure is ready`, emailLayout(`A new adventure is waiting for ${escapeHtml(d.name)}!`,
      `<p style="color:#EAE4FF;line-height:1.6">${escapeHtml(story)}</p><p style="color:#EAE4FF;line-height:1.6">Ten minutes today is plenty. You can change or switch off these reminders in Parent Settings.</p>`)).then(() => sent++).catch((e) => console.error("[cron] reminder", e));
  }
  return NextResponse.json({ checked: due.length, sent });
}
