import { requireParent } from "@/server/session";
import { one } from "@/server/db";
import { SettingsForm } from "@/components/parent/ParentActions";

export const metadata = { title: "Parent settings" };

export default async function Settings() {
  const p = await requireParent();
  const s = (await one<{ reminders_enabled: boolean; reminder_hour: number; companion_enabled: boolean }>(`select reminders_enabled, reminder_hour, companion_enabled from parents where id = $1`, [p.id]))!;
  return <div><h1 className="title-lg mb-6">Settings</h1><SettingsForm initial={s} /></div>;
}
