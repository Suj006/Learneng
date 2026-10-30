/** All "day" boundaries (streaks, daily quests, caps) use the platform timezone. */
export const APP_TZ = process.env.APP_TIMEZONE || "Asia/Kolkata";

export function todayKey(d = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}
export function addDays(key: string, n: number): string {
  const d = new Date(key + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function weekday(key: string): number {
  return new Date(key + "T12:00:00Z").getUTCDay(); // 0 = Sunday
}
