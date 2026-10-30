import Link from "next/link";
import { requireChild } from "@/server/session";
import { one, query } from "@/server/db";
import { skillBand } from "@/server/journey";
import { DRILL_TOPICS } from "@/server/practice";
import { bandForGrade } from "@/lib/grades";
import { CharacterSays, PageTitle, Progress } from "@/components/ui";
import { Scene } from "@/components/Scenes";

export const metadata = { title: "Grammar Galaxy" };
export default async function Grammar() {
  const child = await requireChild();
  const p = await one<{ skill_grammar: number }>(`select skill_grammar from child_profiles where child_id = $1`, [child.id]);
  const band = skillBand(bandForGrade(child.grade), p?.skill_grammar ?? 50);
  const topics = await query<{ slug: string; title: string; emoji: string; band_min: number; n: number; best: number | null; attempts: number | null }>(
    `select t.slug, t.title, t.emoji, t.band_min, jsonb_array_length(t.exercises) n, g.best_score best, g.attempts from grammar_topics t
     left join grammar_progress g on g.topic_id = t.id and g.child_id = $1 order by t.sort_order`, [child.id]);
  return (
    <div>
      <PageTitle title="🪐 Grammar Galaxy" subtitle="Each planet is a grammar mission. Score 80%+ to earn its grammar card!" />
      <div className="card relative mb-8 h-40 overflow-hidden"><Scene name="galaxy" /><div className="absolute inset-0 flex items-center p-6"><CharacterSays who="grammy" mood="welcome" size={90}>Welcome, young wizard! Pick a planet. Missions marked ✨ are perfect for your level right now.</CharacterSays></div></div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {topics.map((t) => {
          const locked = t.band_min > band + 1;
          return (
            <Link key={t.slug} href={locked ? "#" : `/world/grammar/${t.slug}`} className={`card flex flex-col items-center p-4 text-center transition hover:-translate-y-1 ${locked ? "pointer-events-none opacity-40" : ""}`}>
              <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-vibe-purple to-vibe-pink text-3xl shadow-glow">{t.emoji}</span>
              <b className="mt-3 font-display">{t.title}</b>
              <span className="text-[11px] text-vibe-lavender">{t.n} exercises in bank{t.band_min <= band && t.band_min >= band - 1 ? " · ✨ your level" : ""}</span>
              {t.best !== null ? <><Progress value={t.best} className="mt-2 h-1.5" /><span className="mt-1 text-xs">{t.best >= 80 ? "🃏 Card earned · " : ""}Best {t.best}%</span></> : <span className="mt-2 text-xs">{locked ? "🔒 Higher grade" : "New mission"}</span>}
            </Link>
          );
        })}
      </div>
      <section id="drills" className="mt-10">
        <h2 className="title-md">☄️ Endless Drills</h2>
        <p className="text-sm text-vibe-lavender">Freshly generated practice from the PING VIBE word bank — it never runs out.</p>
        <div className="mt-4 flex flex-wrap gap-3">{DRILL_TOPICS.map((d) => <Link key={d.key} href={`/world/grammar/drill-${d.key}`} className="btn-ghost">{d.emoji} {d.title}</Link>)}</div>
      </section>
    </div>
  );
}
