import Link from "next/link";
import { requireChild } from "@/server/session";
import { query } from "@/server/db";
import { vocabCounts } from "@/server/vocab";
import { CharacterSays, PageTitle } from "@/components/ui";

export const metadata = { title: "Word Games Arcade" };
export default async function Arcade() {
  const child = await requireChild();
  const [games, v] = await Promise.all([
    query<{ slug: string; title: string; tagline: string; emoji: string; min_words: number; best: number | null; plays: number }>(
      `select g.slug, g.title, g.tagline, g.emoji, g.min_words, (select max(score) from game_sessions s where s.child_id = $1 and s.game_slug = g.slug) best,
              (select count(*)::int from game_sessions s where s.child_id = $1 and s.game_slug = g.slug) plays from games g where g.active order by sort_order`, [child.id]),
    vocabCounts(child.id),
  ]);
  return (
    <div>
      <PageTitle title="🕹️ Word Games Arcade" subtitle={`Every game uses the ${v.discovered} words YOU have discovered. Your scores are private — you only race yourself!`} />
      {v.discovered < 4 && <div className="mb-6"><CharacterSays who="max" mood="hint">Discover a few words in today's Word Quest first — then the games come alive with YOUR words!</CharacterSays></div>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {games.map((g) => {
          const locked = v.discovered < g.min_words;
          return (
            <Link key={g.slug} href={locked ? "/world/quest" : `/world/arcade/${g.slug}`} className={`card group flex flex-col p-5 transition hover:-translate-y-1 ${locked ? "opacity-50" : ""}`}>
              <span className="text-5xl transition group-hover:scale-110">{g.emoji}</span>
              <b className="mt-3 font-display text-lg leading-tight">{g.title}</b>
              <p className="mt-1 flex-1 text-xs text-vibe-lavender">{g.tagline}</p>
              <span className="mt-3 text-xs font-bold text-vibe-aqua">{locked ? `🔒 Needs ${g.min_words} words` : g.plays ? `Best: ${g.best} · ${g.plays} plays` : "New!"}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
