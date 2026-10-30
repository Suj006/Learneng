import Link from "next/link";
import { requireParent } from "@/server/session";
import { query } from "@/server/db";
import { childReport, improvementAreas, weeklyStory } from "@/server/reports";
import { activeGrades } from "@/server/accounts";
import { gradeLabel } from "@/lib/grades";
import { skillProfile } from "@/server/skills";
import { AddChild, LaunchButton } from "@/components/parent/ParentActions";
import { Progress } from "@/components/ui";

export const metadata = { title: "Parent dashboard" };

export default async function ParentHome() {
  const p = await requireParent();
  const kids = await query<{ id: string; display_name: string; username: string; grade: string; status: string }>(`select id, display_name, username, grade, status from children where parent_id = $1 order by created_at`, [p.id]);
  const alerts = await query<{ title: string; body: string; created_at: string }>(`select title, body, created_at from notifications where parent_id = $1 and kind = 'safeguarding' order by created_at desc limit 5`, [p.id]);
  const reports = await Promise.all(kids.filter((k) => k.status === "active").map(async (k) => ({ k, r: await childReport(k.id), skills: await skillProfile(k.id) })));
  const grades = await activeGrades();
  return (
    <div className="space-y-8">
      <h1 className="title-lg">Your Explorers</h1>
      {alerts.map((a) => <div key={a.created_at} role="alert" className="rounded-2xl border border-vibe-sun/40 bg-vibe-sun/10 p-4 text-sm"><b>⚠️ {a.title}</b><p>{a.body}</p></div>)}
      {kids.some((k) => k.status === "pending_consent") && <Link href="/parent/consent" className="block rounded-2xl bg-vibe-purple/20 p-4 font-semibold">An Explorer is waiting for your consent → complete set-up</Link>}
      <div className="grid gap-6 lg:grid-cols-2">
        {reports.map(({ k, r, skills }) => (
          <article key={k.id} className="card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="title-md">{k.display_name}</h2><p className="text-sm text-vibe-lavender">{gradeLabel(k.grade)} · Explorer name: <b className="text-white">{k.username}</b></p></div>
              <span className="chip text-vibe-sun">Level {r.level_id} · {r.level_name}</span>
            </div>
            <p className="mt-4 rounded-2xl bg-white/5 p-4 text-sm leading-relaxed">📖 <b>Weekly Learning Story:</b> {weeklyStory(k.display_name, r)}</p>
            <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[["Words introduced", r.words_introduced], ["Words mastered", r.words_mastered], ["Learning rhythm", `${r.streak} days`], ["Today", `${r.minutes_today} min`], ["This week", `${r.minutes_week} min`], ["XP earned", r.xp_total.toLocaleString()]].map(([l, v]) => (
                <div key={l as string} className="rounded-2xl bg-white/5 p-3"><dt className="text-[11px] uppercase text-vibe-lavender">{l}</dt><dd className="font-display text-xl font-bold">{v}</dd></div>
              ))}
            </dl>
            <div className="mt-4 space-y-2 text-sm">
              {skills.map((s) => (
                <div key={s.key} className="flex items-center gap-3"><span className="w-28">{s.title}</span>{s.confident ? <><Progress value={s.score} className="h-2" /><span className="w-28 text-right text-xs">{s.growth}</span></> : <span className="text-xs text-vibe-lavender">Still observing…</span>}</div>
              ))}
              <p className="text-[11px] text-vibe-lavender/70">Ongoing learning observations from everyday play — not test scores.</p>
            </div>
            {improvementAreas(r).length > 0 && <div className="mt-4 text-sm"><b>Areas to support</b><ul className="mt-1 list-disc pl-5 text-vibe-lavender">{improvementAreas(r).slice(0, 3).map((a) => <li key={a}>{a}</li>)}</ul></div>}
            <div className="mt-5 flex flex-wrap gap-2"><Link href={`/parent/child/${k.id}`} className="btn-ghost btn-sm">Full report & controls</Link><LaunchButton childId={k.id} name={k.display_name} /></div>
          </article>
        ))}
      </div>
      <AddChild grades={grades} />
    </div>
  );
}
