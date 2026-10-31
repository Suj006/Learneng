import Link from "next/link";
import { requireChild } from "@/server/session";
import { worldState } from "@/server/world";
import { worldContext } from "@/server/world-context";
import { Avatar } from "@/components/Avatar";
import { CharacterSays, PageTitle, Progress } from "@/components/ui";

export const metadata = { title: "My PING VIBE World" };

export default async function MyWorld() {
  const child = await requireChild();
  const [s, w] = await Promise.all([worldState(child.id), worldContext(child)]);
  const built = s.buildings.filter((b) => b.unlocked).length;
  return (
    <div>
      <PageTitle title="MY PING VIBE WORLD" subtitle={`${built} of ${s.buildings.length} places built · every learning milestone grows your world`} />
      <div className="card relative aspect-[4/5] overflow-hidden sm:aspect-[16/10]" style={{ background: "linear-gradient(180deg,#8EE3F5 0%,#BFF3D7 55%,#5BE3A8 56%,#2FBF71 100%)" }}>
        <div className="absolute left-[8%] top-[6%] h-16 w-40 rounded-full bg-glass/70 blur-sm" /><div className="absolute right-[10%] top-[10%] h-12 w-32 rounded-full bg-glass/70 blur-sm" />
        {s.buildings.map((b) => (
          <Link key={b.slug} href={b.unlocked ? b.href : "#"} title={b.unlocked ? b.title : `Locked: ${b.unlock_label}`}
            className={`absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center ${b.unlocked ? "" : "pointer-events-none opacity-40 grayscale"}`} style={{ left: `${b.x}%`, top: `${b.y}%` }}>
            <span className={`text-4xl drop-shadow sm:text-6xl ${b.unlocked ? "animate-float-slow" : ""}`}>{b.unlocked ? b.emoji : "🌫️"}</span>
            <span className="mt-1 rounded-full bg-vibe-midnight/70 px-2 py-0.5 text-[10px] font-bold sm:text-xs">{b.unlocked ? b.title : "???"}</span>
          </Link>
        ))}
        <div className="absolute bottom-[6%] left-1/2 -translate-x-1/2"><Avatar look={w.avatar} art={w.art} size={90} pet={w.pet?.emoji} /></div>
        {s.decorations.map((d, i) => <span key={d.slug} className="absolute text-3xl" style={{ left: `${10 + ((i * 17) % 80)}%`, top: `${58 + ((i * 11) % 30)}%` }} title={d.title}>{d.emoji}</span>)}
      </div>
      <section className="mt-8">
        <h2 className="title-md">What will you build next?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.buildings.filter((b) => !b.unlocked).map((b) => (
            <div key={b.slug} className="glass p-4"><div className="flex items-center gap-3"><span className="text-3xl grayscale">{b.emoji}</span><div><b>{b.title}</b><p className="text-xs text-vibe-lavender">{b.description}</p></div></div>
              <p className="mt-2 text-sm">🔓 {b.unlock_label}</p><Progress value={b.progress} max={b.unlock_target} className="mt-2 h-2" /></div>
          ))}
          {built === s.buildings.length && <CharacterSays who="max" mood="celebrating">You've built EVERYTHING! You're a true world-builder!</CharacterSays>}
        </div>
        <p className="mt-6 text-sm text-vibe-lavender">Decorations from the <Link href="/world/rewards" className="text-vibe-aqua-ink underline">Reward Shop</Link> and level milestones appear in your world automatically.</p>
      </section>
    </div>
  );
}
