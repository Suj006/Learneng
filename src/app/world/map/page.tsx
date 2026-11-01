import Link from "next/link";
import { requireChild } from "@/server/session";
import { one } from "@/server/db";
import { kingdomMap } from "@/server/world";
import { Scene, type SceneName } from "@/components/Scenes";
import { PageTitle, Progress } from "@/components/ui";

export const metadata = { title: "Adventure Map" };
const POS = [{ x: 8, y: 52 }, { x: 36, y: 14 }, { x: 64, y: 50 }, { x: 40, y: 72 }, { x: 70, y: 10 }, { x: 8, y: 8 }, { x: 74, y: 76 }];

export default async function MapPage() {
  const child = await requireChild();
  const p = await one<{ level_id: number }>(`select level_id from child_profiles where child_id = $1`, [child.id]);
  const map = await kingdomMap(child.id, p!.level_id);
  return (
    <div>
      <PageTitle title="Adventure Map" subtitle="Tap a kingdom to explore. Hidden places appear as you learn!" />
      {/* Desktop: positioned islands on a sky map. Mobile: stacked list (no horizontal panning needed). */}
      <div className="card relative hidden aspect-[16/9] overflow-hidden md:block">
        <div className="absolute inset-0"><Scene name="islands" /></div>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <path d="M18 64 C 30 40, 40 30, 46 26 S 70 50, 74 62 S 52 80, 50 84 S 20 30, 18 20 S 60 10, 80 22" stroke="#FFD65A" strokeWidth="0.4" strokeDasharray="1.2 1.2" fill="none" opacity="0.7" />
        </svg>
        {map.map((k, i) => (
          <Link key={k.slug} href={k.unlocked ? `/world/map/${k.slug}` : "#"} aria-disabled={!k.unlocked}
            className={`absolute w-[24%] overflow-hidden rounded-3xl border-2 shadow-card transition hover:scale-105 ${k.unlocked ? "border-line/30" : "pointer-events-none border-line/10 grayscale"}`} style={{ left: `${POS[i % POS.length].x}%`, top: `${POS[i % POS.length].y}%` }}>
            <div className="aspect-[16/9]"><Scene name={k.art as SceneName} /></div>
            <div className="absolute inset-x-0 bottom-0 bg-vibe-midnight/80 p-2"><b className="font-display text-sm">{k.emoji} {k.title}</b>{k.unlocked ? <Progress value={k.progress} className="mt-1 h-1.5" label={`${k.title} progress`} /> : <span className="block text-xs text-vibe-sun-ink">🔒 Level {k.unlock_level}</span>}</div>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 md:hidden">
        {map.map((k) => (
          <Link key={k.slug} href={k.unlocked ? `/world/map/${k.slug}` : "#"} className={`card relative h-36 overflow-hidden ${k.unlocked ? "" : "pointer-events-none grayscale"}`}>
            <Scene name={k.art as SceneName} /><div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-vibe-midnight via-vibe-midnight/85 to-transparent" />
            <div className="absolute bottom-0 p-4"><b className="font-display text-lg">{k.emoji} {k.title}</b><p className="text-xs text-vibe-lavender">{k.unlocked ? `${k.progress}% explored` : `🔒 Unlocks at Level ${k.unlock_level}`}</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
