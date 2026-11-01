import Link from "next/link";
import { requireChild } from "@/server/session";
import { worldContext } from "@/server/world-context";
import { vocabCounts } from "@/server/vocab";
import { Avatar } from "@/components/Avatar";
import { LogoutButton } from "@/components/parent/LogoutButton";
import { PageTitle, Progress } from "@/components/ui";
import { gradeLabel } from "@/lib/grades";

export const metadata = { title: "My Profile" };
const LINKS = [
  ["/world/avatar", "🎨", "Avatar Studio"], ["/world/pets", "🐾", "Pets"], ["/world/museum", "🏛️", "Achievement Museum"], ["/world/collection", "🃏", "Collection Book"],
  ["/world/skills", "🌳", "Skill Tree"], ["/world/passport", "🛂", "Adventure Passport"], ["/world/real-life", "🌍", "VIBE Real Life"], ["/world/writing/improve", "✨", "Improve My Sentence"], ["/world/calendar", "🗓️", "365-Day Calendar"], ["/world/rewards", "🎁", "Reward Shop"], ["/world/notebook", "📒", "Vocabulary Notebook"],
  ["/world/companion", "🤖", "Ask LEXI"], ["/world/missions", "🎯", "Missions"], ["/world/my-world", "🏡", "My World"], ["/world/map", "🗺️", "Adventure Map"],
];

export default async function Me() {
  const child = await requireChild();
  const [w, v] = await Promise.all([worldContext(child), vocabCounts(child.id)]);
  return (
    <div>
      <PageTitle title="My Profile" right={<div className="flex flex-wrap gap-2"><Link href="/world/look" className="btn-ghost btn-sm">🎨 My PING VIBE Look</Link><LogoutButton to="/login" /></div>} />
      <section className="card grid items-center gap-6 p-6 md:grid-cols-[auto_1fr]">
        <Avatar look={w.avatar} art={w.art} size={180} pet={w.pet?.emoji} />
        <div>
          <h2 className="title-lg">{child.display_name}</h2>
          <p className="text-vibe-lavender">{gradeLabel(child.grade)} · Login name: <b className="text-ink">{child.username}</b></p>
          <p className="mt-3 font-display text-xl text-vibe-sun-ink">Level {w.level.level_id}: {w.level.name}</p>
          <Progress value={w.level.pct} className="mt-2 max-w-md" />
          <p className="mt-1 text-sm text-vibe-lavender">{w.level.next_xp ? `${(w.level.next_xp - w.level.xp_total).toLocaleString()} XP to Level ${w.level.next_id}` : "Max level reached!"}{w.level.next_words ? ` · needs ${w.level.next_words} mastered words (you have ${w.level.mastered})` : ""}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip" title="XP = Your learning progress">⚡ {w.level.xp_total.toLocaleString()} XP</span><span className="chip" title="VIBE COINS = Your reward shopping power">🪙 {w.level.coins} VIBE COINS</span>
            <span className="chip">📅 {w.learningDays} learning days</span><span className="chip">🔥 rhythm {w.streak.current}</span><span className="chip">🗝️ {v.discovered} words · 👑 {v.mastered} mastered</span>
          </div>
        </div>
      </section>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {LINKS.map(([href, e, l]) => <Link key={href} href={href} className="card flex flex-col items-center gap-2 p-4 text-center hover:-translate-y-0.5"><span className="text-3xl">{e}</span><b className="text-sm">{l}</b></Link>)}
      </div>
    </div>
  );
}
