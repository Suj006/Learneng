import { notFound } from "next/navigation";
import { requireParent } from "@/server/session";
import { one, query } from "@/server/db";
import { annualJourney, childReport, improvementAreas, weeklyStory } from "@/server/reports";
import { skillProfile, skillTree } from "@/server/skills";
import { timeline } from "@/server/world";
import { bandForGrade, gradeLabel } from "@/lib/grades";
import { ChildAdmin, FamilyChallenge } from "@/components/parent/ParentActions";
import { BackLink, Progress } from "@/components/ui";

export const metadata = { title: "Child report" };

function Bars({ rows, value, label }: { rows: { key: string; v: number }[]; value: string; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r.v));
  return (
    <figure aria-label={label}>
      <div className="flex h-36 items-end gap-2">
        {rows.map((r) => (
          <div key={r.key} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] text-vibe-lavender">{r.v}</span>
            <div className="w-full rounded-t-lg bg-vibe-aqua/80" style={{ height: `${(r.v / max) * 100}%`, minHeight: r.v ? 4 : 1 }} />
            <span className="text-[10px] text-vibe-lavender/70">{r.key}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-1 text-xs text-vibe-lavender/70">{value}</figcaption>
    </figure>
  );
}

export default async function ChildReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await requireParent();
  const c = await one<{ id: string; display_name: string; grade: string; username: string }>(`select id, display_name, grade, username from children where id = $1 and parent_id = $2 and status = 'active'`, [id, p.id]);
  if (!c) notFound();
  const [r, j, skills, tree, tl, writing, words] = await Promise.all([
    childReport(c.id), annualJourney(c.id, c.grade), skillProfile(c.id), skillTree(c.id, bandForGrade(c.grade)), timeline(c.id),
    query<{ title: string; content: string; score: number | null; submitted_at: string }>(`select w.title, w.content, e.score, w.submitted_at from writing_submissions w left join writing_evaluations e on e.submission_id = w.id where w.child_id = $1 and w.status = 'evaluated' order by w.submitted_at desc limit 5`, [c.id]),
    query<{ id: string; word: string; emoji: string }>(`select v.id, v.word, v.emoji from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id where p.child_id = $1 order by p.first_seen_at desc limit 60`, [c.id]),
  ]);
  const masteredNodes = tree.filter((n) => n.status === "mastered").length;
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3"><BackLink href="/parent" /><div><h1 className="title-lg">{c.display_name}'s learning report</h1><p className="text-sm text-vibe-lavender">{gradeLabel(c.grade)} · Level {r.level_id} {r.level_name} · {r.xp_total.toLocaleString()} XP</p></div></div>
      <section className="card p-6"><h2 className="title-md">Weekly Learning Story</h2><p className="mt-2 leading-relaxed">{weeklyStory(c.display_name, r)}</p></section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="title-md">Annual learning journey</h2>
          <p className="mt-1 text-sm text-vibe-lavender">Day {j.journey_day} of the {j.plan_days}-day {gradeLabel(c.grade)} programme. Missed days never skip content.</p>
          <div className="mt-4 space-y-3 text-sm">
            <div><div className="flex justify-between"><span>Learning days completed</span><b>{j.days_done} / {j.plan_days}</b></div><Progress value={j.days_done} max={j.plan_days} className="mt-1 h-2" /></div>
            <div><div className="flex justify-between"><span>Activities completed</span><b>{j.activities_done} / {j.activities_total}</b></div><Progress value={j.activities_done} max={j.activities_total} className="mt-1 h-2" color="bg-vibe-aqua" /></div>
          </div>
        </div>
        <div className="card p-6"><h2 className="title-md">Last 7 days</h2><div className="mt-3"><Bars label="Minutes per day" value="Minutes learning per day" rows={r.daily.map((d) => ({ key: d.day.slice(8), v: d.minutes }))} /></div></div>
      </section>

      <section className="card p-6">
        <h2 className="title-md">Monthly summaries</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="text-vibe-lavender"><tr><th className="py-2">Month</th><th>Learning days</th><th>Words discovered</th><th>Words mastered</th><th>Minutes</th><th>XP</th></tr></thead>
          <tbody>{j.months.map((m) => <tr key={m.month} className="border-t border-white/5"><td className="py-2">{m.month}</td><td>{m.days}</td><td>{m.words}</td><td>{m.mastered}</td><td>{m.minutes}</td><td>{m.xp}</td></tr>)}</tbody></table></div>
        <div className="mt-4"><Bars label="Vocabulary growth" value="Words discovered per month" rows={j.months.map((m) => ({ key: m.month.slice(5), v: m.words }))} /></div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="title-md">Skill-wise development</h2>
          <p className="text-sm text-vibe-lavender">Each skill adapts independently. {masteredNodes}/{tree.length} skill-tree milestones achieved.</p>
          <ul className="mt-4 space-y-2 text-sm">{skills.map((s) => <li key={s.key} className="flex items-center gap-3"><span className="w-28">{s.title}</span>{s.confident ? <><Progress value={s.score} className="h-2" /><span className="chip w-36 justify-center">{s.level} · {s.growth}</span></> : <span className="text-xs text-vibe-lavender">Still observing ({s.attempts} interactions so far)</span>}</li>)}</ul>
          <p className="mt-4 rounded-2xl bg-white/5 p-3 text-xs text-vibe-lavender">ℹ️ These are <b>ongoing learning observations</b> gathered quietly from everyday games, quests, reading, writing and speaking — not examination results or standardised proficiency scores. Estimates start neutral and only change after enough activity ({"≥"}15 interactions per skill), and PING VIBE never compares your child with other children. Your child sees only encouraging growth labels.</p>
        </div>
        <div className="card p-6">
          <h2 className="title-md">Areas requiring improvement</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-vibe-lavender">{(improvementAreas(r).length ? improvementAreas(r) : ["No concerns right now — keep the gentle daily rhythm going!"]).map((a) => <li key={a}>{a}</li>)}</ul>
          <h3 className="mt-5 font-display font-bold">Milestones</h3>
          <ul className="mt-2 space-y-1 text-sm">{tl.slice(-6).reverse().map((t) => <li key={t.kind}>{t.emoji} {t.title} <span className="text-vibe-lavender/60">· {new Date(t.achieved_at).toLocaleDateString()}</span></li>)}</ul>
        </div>
      </section>

      <section className="card p-6"><h2 className="title-md">Recent writing</h2>
        {writing.length === 0 ? <p className="mt-2 text-sm text-vibe-lavender">No writing yet.</p> : <div className="mt-3 space-y-3">{writing.map((w) => <details key={w.submitted_at} className="glass p-4"><summary className="cursor-pointer font-semibold">{w.title} · score {w.score ?? "—"}</summary><p className="mt-2 whitespace-pre-wrap text-sm text-vibe-lavender">{w.content}</p></details>)}</div>}
      </section>

      <section className="card p-6"><h2 className="title-md">👨‍👩‍👧 Family challenge</h2><div className="mt-3"><FamilyChallenge childId={c.id} words={words} /></div></section>
      <section className="card p-6"><h2 className="title-md">Account & privacy controls</h2><div className="mt-3"><ChildAdmin childId={c.id} name={c.display_name} /></div></section>
    </div>
  );
}
