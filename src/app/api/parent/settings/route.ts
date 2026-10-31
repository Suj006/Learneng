import { z } from "zod";
import { body, ok, parentRoute } from "@/server/api";
import { query } from "@/server/db";

export const POST = parentRoute(async (req, parent) => {
  const d = await body(req, z.object({
    reminders_enabled: z.boolean(), reminder_hour: z.number().int().min(0).max(23), companion_enabled: z.boolean(),
    music_allowed: z.boolean().optional(), voices_allowed: z.boolean().optional(),
  }));
  await query(`update parents set reminders_enabled = $2, reminder_hour = $3, companion_enabled = $4,
                 music_allowed = coalesce($5, music_allowed), voices_allowed = coalesce($6, voices_allowed), updated_at = now() where id = $1`,
    [parent.id, d.reminders_enabled, d.reminder_hour, d.companion_enabled, d.music_allowed ?? null, d.voices_allowed ?? null]);
  return ok();
});
