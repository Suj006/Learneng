import { query } from "@/server/db";
import { EventForm } from "@/components/admin/AdminForms";

export const metadata = { title: "Events" };
export default async function Events() {
  const events = await query<{ slug: string; title: string; emoji: string; kind: string; month: number; day: number; window_days: number; description: string; words: string[]; writing_prompt: string; active: boolean }>(`select * from events order by month, day`);
  return (
    <div className="space-y-6">
      <h1 className="title-lg">Seasonal events & festivals</h1>
      <p className="text-sm text-vibe-lavender">Events recur every year on their date window. Each gets an event mission, challenge and collectible card. No purchases and no deadline pressure — missed events simply come back next year. Add lunar-calendar festivals (Diwali, Holi, Eid…) with this year's dates.</p>
      <div className="card p-5"><h2 className="title-md mb-3">New event</h2><EventForm /></div>
      {events.map((e) => <details key={e.slug} className="card p-4"><summary className="cursor-pointer font-bold">{e.emoji} {e.title} <span className="text-sm font-normal text-vibe-lavender">· {e.day}/{e.month} for {e.window_days} days · {e.active ? "active" : "off"}</span></summary><div className="mt-3"><EventForm initial={e} /></div></details>)}
    </div>
  );
}
