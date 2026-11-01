import Link from "next/link";
import { requireChild } from "@/server/session";
import { query } from "@/server/db";
import { SCENES } from "@/lib/scenes";
import { CharacterSays, PageTitle } from "@/components/ui";

export const metadata = { title: "Word Scenes" };
export default async function WordScenes() {
  const child = await requireChild();
  const prog = await query<{ slug: string; best_score: number }>(`select slug, best_score from scene_progress where child_id = $1`, [child.id]);
  return (
    <div>
      <PageTitle title="🖼️ Word Scenes" subtitle="Explore a place, tap things to hear their names, then use the words yourself." />
      <CharacterSays who="lexi" mood="welcome">Words are easier to remember when you see them in a real place, {child.display_name}! Pick a scene to explore.</CharacterSays>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="scene-list">
        {SCENES.map((s) => {
          const p = prog.find((x) => x.slug === s.slug);
          return (
            <Link key={s.slug} href={`/world/word-scenes/${s.slug}`} className="card flex flex-col p-5 transition hover:-translate-y-1" style={{ background: `linear-gradient(160deg, ${s.sky}, ${s.ground})` }}>
              <span className="text-5xl" aria-hidden>{s.emoji}</span>
              <b className="title-md mt-2 text-[#1d1b3a]">{s.title}</b>
              <span className="mt-1 text-sm text-[#3d3a5c]">{s.items.length} things to discover</span>
              <span className="mt-2 text-xs font-bold text-[#3d3a5c]">{p ? `⭐ Best ${p.best_score}%` : "New!"}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
