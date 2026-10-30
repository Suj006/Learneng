import { z } from "zod";
import { body, ok, parentRoute } from "@/server/api";
import { query } from "@/server/db";

export const POST = parentRoute(async (req, parent) => {
  const d = await body(req, z.object({ reminders_enabled: z.boolean(), reminder_hour: z.number().int().min(0).max(23), companion_enabled: z.boolean() }));
  await query(`update parents set reminders_enabled = $2, reminder_hour = $3, companion_enabled = $4, updated_at = now() where id = $1`,
    [parent.id, d.reminders_enabled, d.reminder_hour, d.companion_enabled]);
  return ok();
});
