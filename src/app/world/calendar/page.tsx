import Link from "next/link";
import { requireChild } from "@/server/session";
import { calendar } from "@/server/journey";
import { getStreak } from "@/server/gamification";
import { THEMES } from "@/server/content/curriculum";
import { PageTitle } from "@/components/ui";

export const metadata = { title: "365-Day Calendar" };
const ICON: Record<string, string> = { vocabulary: "🗝️", listening: "🎧", game: "🕹️", grammar: "🪐", spelling: "🔤", sentence: "🧱", reading: "📚", speaking: "🎤", writing: "✍️", story: "📜", revision: "🔁", special: "⚡", weekly_assessment: "🏅", boss_battle: "👾", monthly_championship: "🏆" };

export default async function Calendar() {
  const child = await requireChild();
  const [cal, streak] = await Promise.all([calendar(child.id, child.grade), getStreak(child.id)]);
  const done = cal.days.filter((d) => d.completedOn).length;
  const months = Array.from(new Set(cal.days.map((d) => d.month)));
  return (
    <div>
      <PageTitle title="My 365-Day Learning Calendar" subtitle={`Year ${cal.year} · Day ${cal.current} · ${done} days completed · learning rhythm ${streak.current} (best ${streak.longest})`} />
      <div className="mb-6 flex flex-wrap gap-3 text-xs text-vibe-lavender">
        <span className="chip">✅ Completed</span><span className="chip">⭐ Today</span><span className="chip">🏅 Weekly assessment</span><span className="chip">🏆 Monthly championship</span>
        <span className="chip">Missed days never skip content — your journey simply continues.</span>
      </div>
      <div className="space-y-6">
        {months.map((m) => (
          <section key={m}>
            <h2 className="font-display font-bold">Month {m}</h2>
            <div className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-7 lg:grid-cols-10">
              {cal.days.filter((d) => d.month === m).map((d) => {
                const isToday = d.day === cal.current;
                const theme = THEMES.find((t) => t.key === d.theme);
                return (
                  <details key={d.day} className={`group rounded-2xl border p-2 text-center text-xs ${d.completedOn ? "border-vibe-mint/50 bg-vibe-mint/15" : isToday ? "border-vibe-sun bg-vibe-sun/15" : d.day < cal.current ? "border-line/10 bg-glass/5" : "border-line/5 bg-glass/[0.03] opacity-80"}`}>
                    <summary className="cursor-pointer list-none">
                      <div className="font-bold">{d.completedOn ? "✅" : isToday ? "⭐" : d.activities.includes("monthly_championship") ? "🏆" : d.activities.includes("weekly_assessment") ? "🏅" : theme?.emoji} {d.day}</div>
                    </summary>
                    <div className="mt-1 text-left text-[11px] text-vibe-lavender">
                      <div className="font-bold text-ink">{d.focus}</div>
                      <div>{d.activities.map((a) => ICON[a] ?? "•").join(" ")}</div>
                      {d.completedOn && <div>Done {d.completedOn}</div>}
                      {d.completedOn && <Link className="text-vibe-aqua-ink underline" href="/world/revision">Revise</Link>}
                    </div>
                  </details>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
