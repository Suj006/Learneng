import Link from "next/link";
import { requireChild } from "@/server/session";
import { one, query } from "@/server/db";
import { skillBand } from "@/server/journey";
import { bandForGrade } from "@/lib/grades";
import { Scene, type SceneName } from "@/components/Scenes";
import { PageTitle } from "@/components/ui";

export const metadata = { title: "Reading Adventures" };
export default async function Reading() {
  const child = await requireChild();
  const p = await one<{ skill_reading: number }>(`select skill_reading from child_profiles where child_id = $1`, [child.id]);
  const band = skillBand(bandForGrade(child.grade), p?.skill_reading ?? 50);
  const stories = await query<{ slug: string; title: string; genre: string; band: number; emoji: string; cover: string; reward: string | null; owned: boolean; best: number | null; done: boolean }>(
    `select s.slug, s.title, s.genre, s.band, s.emoji, s.cover, s.reward,
       (s.reward is null or exists (select 1 from child_rewards r where r.child_id = $1 and r.slug = s.reward)) owned,
       sp.best_score best, sp.completed_at is not null done
     from reading_stories s left join story_progress sp on sp.story_id = s.id and sp.child_id = $1 where s.active
     order by abs(s.band - $2), s.band, s.slug`, [child.id, band]);
  return (
    <div>
      <PageTitle title="📚 Reading Adventures" subtitle="Stories matched to your reading level come first. Finish a story to collect its card!" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((s) => (
          <Link key={s.slug} href={s.owned ? `/world/reading/${s.slug}` : "/world/rewards"} className={`card group overflow-hidden transition hover:-translate-y-1 ${s.owned ? "" : "opacity-60"}`}>
            <div className="relative h-36"><Scene name={s.cover as SceneName} /><span className="absolute left-4 top-4 text-5xl">{s.emoji}</span>{Math.abs(s.band - band) === 0 && <span className="chip absolute right-3 top-3 bg-vibe-midnight/80 text-vibe-sun">✨ Your level</span>}</div>
            <div className="p-5"><span className="chip">{s.genre}</span><h2 className="title-md mt-2">{s.title}</h2>
              <p className="mt-1 text-sm text-vibe-lavender">{!s.owned ? "🔒 Unlock in the Reward Shop" : s.done ? `✅ Read · quiz best ${s.best}%` : "New story!"}</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
