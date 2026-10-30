import "server-only";
import { query } from "./db";
import { todayKey } from "./time";

export interface ActiveEvent { slug: string; title: string; emoji: string; kind: string; description: string; words: string[]; writing_prompt: string }

/** Events whose window (start date + window_days) contains today; recurring every year. */
export async function activeEvents(today = todayKey()): Promise<ActiveEvent[]> {
  const rows = await query<ActiveEvent & { month: number; day: number; window_days: number }>(`select * from events where active`);
  const t = new Date(today + "T12:00:00Z");
  return rows.filter((e) => {
    for (const y of [t.getUTCFullYear() - 1, t.getUTCFullYear()]) {
      const start = Date.UTC(y, e.month - 1, e.day, 0);
      const end = start + e.window_days * 86400000 + 86399000;
      if (t.getTime() >= start - 86400000 && t.getTime() <= end) return true;
    }
    return false;
  });
}
