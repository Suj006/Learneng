import { platformAnalytics } from "@/server/analytics";
import { Progress } from "@/components/ui";

export const metadata = { title: "Admin analytics" };
const Stat = ({ l, v, s }: { l: string; v: React.ReactNode; s?: string }) => <div className="card p-4"><div className="text-xs uppercase text-vibe-lavender">{l}</div><div className="font-display text-3xl font-bold">{v ?? "—"}</div>{s && <div className="text-xs text-vibe-lavender">{s}</div>}</div>;

export default async function AdminHome() {
  const a = await platformAnalytics();
  const k = a.kpis;
  const retention = k.prior_week_learners ? Math.round((k.returning_learners / k.prior_week_learners) * 100) : null;
  return (
    <div className="space-y-10">
      <section><h1 className="title-lg">Launch objectives</h1>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 [&>*]:min-w-0 [overflow-wrap:anywhere]">{a.objectives.map((o) => <div key={o.name} className={`card p-4 ${o.ok ? "border-vibe-mint/40" : "border-vibe-sun/50"}`}><div className="text-xs uppercase text-vibe-lavender">{o.ok ? "✅" : "⚠️"} {o.name}</div><div className="mt-1 text-sm font-bold">{o.target}</div><div className="mt-2 text-xs text-vibe-lavender">{o.actual}</div></div>)}</div>
      </section>
      <section><h2 className="title-md">Learners</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <Stat l="Registered parents" v={k.parents} /><Stat l="Active learners" v={k.learners} /><Stat l="Daily active" v={k.dau} /><Stat l="Weekly active" v={k.wau} /><Stat l="Monthly active" v={k.mau} />
          <Stat l="Return visits" v={retention !== null ? `${retention}%` : "—"} s="learners active last week who came back this week" />
        </div>
      </section>
      <section><h2 className="title-md">Learning outcomes (genuine engagement)</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <Stat l="Quest completion" v={k.quests_started ? `${Math.round((k.quests_completed / k.quests_started) * 100)}%` : "—"} s={`${k.quests_completed}/${k.quests_started}`} />
          <Stat l="Quest accuracy (30d)" v={k.quest_accuracy !== null ? `${k.quest_accuracy}%` : "—"} />
          <Stat l="Vocabulary mastery" v={k.words_discovered ? `${Math.round((k.words_mastered / k.words_discovered) * 100)}%` : "—"} s={`${k.words_mastered} mastered / ${k.words_discovered} discovered`} />
          <Stat l="Writing improvement" v={a.writingTrend?.first_avg != null && a.writingTrend?.latest_avg != null ? `${a.writingTrend.first_avg} → ${a.writingTrend.latest_avg}` : "—"} s="first vs latest score per learner" />
          <Stat l="Grammar avg" v={k.grammar_avg} /><Stat l="Reading avg" v={k.reading_avg} />
          <Stat l="Speaking participants (30d)" v={k.speaking_participants} /><Stat l="Missions claimed" v={k.missions_claimed} /><Stat l="Reward redemptions" v={k.redemptions} /><Stat l="Bosses defeated" v={k.bosses_defeated} />
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="card p-5"><h2 className="title-md">Activity health (30 days)</h2>
          <p className="text-xs text-vibe-lavender">Flags: 🔥 too hard (avg score &lt; 50), 💤 many quick exits (&gt; 30% under 20s) — candidates for redesign.</p>
          <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[480px] text-left text-sm"><thead className="text-vibe-lavender"><tr><th>Activity</th><th>Sessions</th><th>Learners</th><th>Avg min</th><th>Avg score</th><th></th></tr></thead>
            <tbody>{a.activities.map((r) => <tr key={r.module} className="border-t border-line/5"><td className="py-1.5">{r.module}</td><td>{r.sessions}</td><td>{r.learners}</td><td>{r.avg_minutes}</td><td>{r.avg_score ?? "—"}</td><td>{r.avg_score !== null && r.avg_score < 50 ? "🔥" : ""}{r.quick_exits / Math.max(1, r.sessions) > 0.3 ? "💤" : ""}</td></tr>)}</tbody></table></div>
        </div>
        <div className="card p-5"><h2 className="title-md">Game engagement (30 days)</h2>
          <ul className="mt-3 space-y-2 text-sm">{a.games.map((g) => <li key={g.game_slug} className="flex items-center gap-3"><span className="w-28 shrink-0 truncate sm:w-40">{g.game_slug}</span><Progress value={g.avg_pct} className="h-2" label={`${g.game_slug} average score`} /><span className="w-20 shrink-0 text-right">{g.plays} plays</span></li>)}</ul>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <div className="card p-5"><h2 className="title-md">Level distribution</h2><ul className="mt-3 space-y-1 text-sm">{a.levels.map((l) => <li key={l.tier_name} className="flex justify-between"><span>{l.tier_name}</span><b>{l.n}</b></li>)}</ul></div>
        <div className="card p-5"><h2 className="title-md">Kingdom unlocking</h2><ul className="mt-3 space-y-1 text-sm">{a.kingdoms.map((l) => <li key={l.title} className="flex justify-between"><span>{l.title}</span><b>{l.n} learners</b></li>)}</ul></div>
      </section>
      <p className="text-xs text-vibe-lavender">Privacy: analytics are aggregated from learning records only; no behavioural tracking, device fingerprinting or third-party analytics are used.</p>
    </div>
  );
}
