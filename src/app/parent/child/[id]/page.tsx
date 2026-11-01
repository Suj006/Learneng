import { notFound } from "next/navigation";
import { requireParent } from "@/server/session";
import { one, query } from "@/server/db";
import { annualJourney, childReport, improvementAreas, periodInsights, recentRecommendations, weeklyStory } from "@/server/reports";
import { skillIntelligence, skillProfile, skillTree } from "@/server/skills";
import { parentTips } from "@/server/reports";
import { timeline } from "@/server/world";
import { bandForGrade, gradeLabel } from "@/lib/grades";
import { ChildAdmin, FamilyChallenge, AppearanceGuide } from "@/components/parent/ParentActions";
import { activeThemes, resolveTheme } from "@/server/themes";
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
            <span className="text-[10px] text-vibe-lavender">{r.key}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-1 text-xs text-vibe-lavender">{value}</figcaption>
    </figure>
  );
}

export default async function ChildReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await requireParent();
  const c = await one<{ id: string; display_name: string; grade: string; username: string }>(`select id, display_name, grade, username from children where id = $1 and parent_id = $2 and status = 'active'`, [id, p.id]);
  const look = c ? await one<{ color_theme: string | null; motion: "full" | "calm" | "off" }>(`select color_theme, motion from child_profiles where child_id = $1`, [c.id]) : null;
  if (!c) notFound();
  const [r, j, skills, tree, tl, writing, words, wk, mo, recs] = await Promise.all([
    childReport(c.id), annualJourney(c.id, c.grade), skillProfile(c.id), skillTree(c.id, bandForGrade(c.grade)), timeline(c.id),
    query<{ title: string; content: string; score: number | null; submitted_at: string }>(`select w.title, w.content, e.score, w.submitted_at from writing_submissions w left join writing_evaluations e on e.submission_id = w.id where w.child_id = $1 and w.status = 'evaluated' order by w.submitted_at desc limit 5`, [c.id]),
    query<{ id: string; word: string; emoji: string }>(`select v.id, v.word, v.emoji from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id where p.child_id = $1 order by p.first_seen_at desc limit 60`, [c.id]),
    periodInsights(c.id, 7), periodInsights(c.id, 30), recentRecommendations(c.id),
  ]);
  const intel = await skillIntelligence(c.id);
  const tips = parentTips(c.display_name, intel, wk, mo);
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
            <div><div className="flex justify-between"><span>Learning days completed</span><b>{j.days_done} / {j.plan_days}</b></div><Progress label="Learning days completed" value={j.days_done} max={j.plan_days} className="mt-1 h-2" /></div>
            <div><div className="flex justify-between"><span>Activities completed</span><b>{j.activities_done} / {j.activities_total}</b></div><Progress label="Activities completed" value={j.activities_done} max={j.activities_total} className="mt-1 h-2" color="bg-vibe-aqua" /></div>
          </div>
        </div>
        <div className="card p-6"><h2 className="title-md">Last 7 days</h2><div className="mt-3"><Bars label="Minutes per day" value="Minutes learning per day" rows={r.daily.map((d) => ({ key: d.day.slice(8), v: d.minutes }))} /></div></div>
      </section>

      <section className="card p-6" data-testid="parent-insights">
        <h2 className="title-md">This week and this month</h2>
        <p className="mt-1 text-sm text-vibe-lavender">Counted from {c.display_name}&apos;s real activity. Nothing here is estimated.</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[480px] text-left text-sm"><thead className="text-vibe-lavender"><tr><th className="py-2">Activity</th><th>Last 7 days</th><th>Last 30 days</th></tr></thead>
          <tbody>{([
            ["New words learned", wk.words_new, mo.words_new], ["Words revised", wk.words_revised, mo.words_revised],
            ["Real-life scenarios completed", wk.real_life, mo.real_life], ["Speaking sessions", wk.speaking, mo.speaking],
            ["Listening challenges", wk.listening, mo.listening], ["Stories read", wk.reading, mo.reading], ["Sentences improved", wk.improved, mo.improved],
          ] as [string, number, number][]).map(([k, a, b]) => <tr key={k} className="border-t border-line/5"><td className="py-2">{k}</td><td>{a}</td><td>{b}</td></tr>)}</tbody></table></div>
        {mo.scenarios.length > 0 && <p className="mt-3 text-sm">🌍 Real-life practice this month: {mo.scenarios.join(", ")}.</p>}
        <p className="mt-2 text-sm">🧠 Word retention: {mo.retention === null ? "not enough words yet to measure (needs at least 5 words older than 3 days)" : `${mo.retention}% of older words were answered correctly again on a later day`}.</p>
        {recs.length > 0 && (<><h3 className="mt-4 font-display font-bold">Recommended next activities</h3>
          <ul className="mt-2 space-y-1 text-sm">{recs.map((x) => <li key={x.module}>• <b>{x.title}</b> <span className="text-vibe-lavender">— {x.reason}</span></li>)}</ul></>)}
      </section>

      <section className="card p-6">
        <h2 className="title-md">Monthly summaries</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="text-vibe-lavender"><tr><th className="py-2">Month</th><th>Learning days</th><th>Words discovered</th><th>Words mastered</th><th>Minutes</th><th>XP</th></tr></thead>
          <tbody>{j.months.map((m) => <tr key={m.month} className="border-t border-line/5"><td className="py-2">{m.month}</td><td>{m.days}</td><td>{m.words}</td><td>{m.mastered}</td><td>{m.minutes}</td><td>{m.xp}</td></tr>)}</tbody></table></div>
        <div className="mt-4"><Bars label="Vocabulary growth" value="Words discovered per month" rows={j.months.map((m) => ({ key: m.month.slice(5), v: m.words }))} /></div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6 lg:col-span-2" data-testid="skill-intel">
          <h2 className="title-md">Skill-wise development (all 11 skills)</h2>
          <p className="text-sm text-vibe-lavender">Each skill is estimated separately from real answers. {masteredNodes}/{tree.length} skill-tree milestones demonstrated.</p>
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-vibe-lavender"><tr><th className="py-2">Skill</th><th>Current level</th><th>Confidence</th><th>Answers</th><th>Accuracy</th><th>Last 14 days</th><th>Trend</th><th>Last practised</th></tr></thead>
            <tbody>{intel.map((s) => (
              <tr key={s.key} className="border-t border-line/5">
                <td className="py-2 font-semibold">{s.title}</td>
                <td>{s.confident ? s.level : <span className="text-vibe-lavender">Not enough evidence yet</span>}</td>
                <td>{({ insufficient: "—", low: "Low", medium: "Medium", high: "High" } as Record<string, string>)[s.confidence]}</td>
                <td>{s.attempts}</td>
                <td>{s.confident && s.accuracy !== null ? `${s.accuracy}%` : "—"}</td>
                <td>{s.recentAccuracy !== null ? `${s.recentAccuracy}% (${s.recentAttempts})` : "—"}</td>
                <td>{({ improving: "📈 Improving", steady: "➡️ Steady", needs_practice: "🔁 Needs practice", unknown: "—" } as Record<string, string>)[s.trend]}</td>
                <td>{s.lastActivity ?? "—"}</td>
              </tr>
            ))}</tbody></table></div>
          <p className="mt-4 rounded-2xl bg-glass/5 p-3 text-xs text-vibe-lavender">ℹ️ These are <b>ongoing learning observations</b> from everyday activities, not examination results. A level appears only after {"≥"}15 answers in a skill; confidence grows with more evidence; a trend needs enough answers both in the last 14 days and before. Speaking and pronunciation use the browser&apos;s speech recognition (word matching), which is an indicator only, not a phoneme-level assessment. PING VIBE never compares your child with other children.</p>
        </div>
        <div className="card p-6">
          <h2 className="title-md">How you can help this week</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm" data-testid="parent-tips">{tips.map((t) => <li key={t}>{t}</li>)}</ul>
          <h2 className="title-md mt-6">Areas requiring improvement</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-vibe-lavender">{(improvementAreas(r).length ? improvementAreas(r) : ["No concerns right now — keep the gentle daily rhythm going!"]).map((a) => <li key={a}>{a}</li>)}</ul>
          <h3 className="mt-5 font-display font-bold">Milestones</h3>
          <ul className="mt-2 space-y-1 text-sm">{tl.slice(-6).reverse().map((t) => <li key={t.kind}>{t.emoji} {t.title} <span className="text-vibe-lavender">· {new Date(t.achieved_at).toLocaleDateString()}</span></li>)}</ul>
        </div>
      </section>

      <section className="card p-6"><h2 className="title-md">Recent writing</h2>
        {writing.length === 0 ? <p className="mt-2 text-sm text-vibe-lavender">No writing yet.</p> : <div className="mt-3 space-y-3">{writing.map((w) => <details key={w.submitted_at} className="glass p-4"><summary className="cursor-pointer font-semibold">{w.title} · score {w.score ?? "—"}</summary><p className="mt-2 whitespace-pre-wrap text-sm text-vibe-lavender">{w.content}</p></details>)}</div>}
      </section>

      <section className="card p-6"><h2 className="title-md">👨‍👩‍👧 Family challenge</h2><div className="mt-3"><FamilyChallenge childId={c.id} words={words} /></div></section>
      <section className="card p-6"><h2 className="title-md">🎨 {c.display_name}'s PING VIBE look</h2>
        <p className="mt-1 text-sm text-vibe-lavender">Children choose their own colours in “My PING VIBE Look”. You can guide it here; it never affects learning progress.</p>
        <div className="mt-3"><AppearanceGuide childId={c.id} themes={(await activeThemes()).map((t) => ({ slug: t.slug, name: `${t.emoji} ${t.name}` }))} current={await resolveTheme(look?.color_theme)} motion={look?.motion ?? "full"} /></div>
      </section>
      <section className="card p-6"><h2 className="title-md">Account & privacy controls</h2><div className="mt-3"><ChildAdmin childId={c.id} name={c.display_name} /></div></section>
    </div>
  );
}
