import { requireChild } from "@/server/session";
import { query } from "@/server/db";
import { PageTitle, CharacterSays } from "@/components/ui";
import ImproveSentence from "./ImproveSentence";

export const metadata = { title: "Improve My Sentence" };
export default async function Improve() {
  const child = await requireChild();
  const past = await query<{ id: string; original: string; mine: string; created_at: string }>(
    `select id, original, mine, created_at from sentence_improvements where child_id = $1 and mine is not null order by saved_at desc limit 6`, [child.id]);
  return (
    <div>
      <PageTitle title="✨ Improve My Sentence" subtitle="Write a sentence. GRAMMY gives ideas — you make the changes." back="/world/writing" />
      <CharacterSays who="grammy" mood="welcome">Hello {child.display_name}! Type one sentence you wrote. I won&apos;t change it for you — I&apos;ll give you magic ideas, and you choose.</CharacterSays>
      <ImproveSentence />
      {past.length > 0 && (
        <section className="mt-10"><h2 className="title-md">My improved sentences</h2>
          <ul className="mt-3 grid gap-2">{past.map((p) => (
            <li key={p.id} className="glass p-4 text-sm"><p className="text-vibe-lavender">Before: {p.original}</p><p className="mt-1 font-bold">After: {p.mine}</p></li>
          ))}</ul>
        </section>
      )}
    </div>
  );
}
