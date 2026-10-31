import Link from "next/link";
import { requireChild } from "@/server/session";
import { query } from "@/server/db";
import { pickTopics } from "@/server/topics";
import { THEMES } from "@/server/content/curriculum";
import { CharacterSays, PageTitle } from "@/components/ui";

export const metadata = { title: "Creative Writing Studio" };
export default async function Writing({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const child = await requireChild();
  const cat = THEMES.some((t) => t.key === category) ? category : undefined;
  const [topics, past, count] = await Promise.all([
    pickTopics(child.id, child.grade, cat),
    query<{ id: string; title: string; status: string; score: number | null; updated_at: string }>(
      `select w.id, w.title, w.status, e.score, w.updated_at from writing_submissions w left join writing_evaluations e on e.submission_id = w.id where w.child_id = $1 order by w.updated_at desc limit 8`, [child.id]),
    query<{ n: number }>(`select count(*)::int n from writing_topics where active`),
  ]);
  return (
    <div>
      <PageTitle title="✍️ Creative Writing Studio" subtitle={`${count[0].n.toLocaleString()} topics in the library — and you'll always get fresh ones.`} right={<Link href="/world/story-builder" className="btn-ghost btn-sm">📜 Story Builder</Link>} />
      <CharacterSays who="story" mood="welcome">Pick a topic that sparks your imagination! I'll suggest power words, and GRAMMY will give you kind feedback.</CharacterSays>
      <div className="row-scroll mt-6">
        <Link href="/world/writing" className={`btn btn-sm shrink-0 ${!cat ? "bg-vibe-cta text-white" : "btn-ghost"}`}>🎲 Surprise me</Link>
        {THEMES.map((t) => <Link key={t.key} href={`/world/writing?category=${t.key}`} className={`btn btn-sm shrink-0 ${cat === t.key ? "bg-vibe-cta text-white" : "btn-ghost"}`}>{t.emoji} {t.title}</Link>)}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((t) => (
          <Link key={t.id} href={`/world/writing/${t.id}`} className="card group flex flex-col p-5 transition hover:-translate-y-1">
            <span className="text-5xl transition group-hover:scale-110">{t.emoji}</span>
            <h2 className="title-md mt-3">{t.title}</h2>
            <p className="mt-1 flex-1 text-sm text-vibe-lavender">{t.prompt}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="chip">{THEMES.find((x) => x.key === t.category)?.title ?? "Writing"}</span><span className="chip">{t.min_words}+ words</span></div>
          </Link>
        ))}
      </div>
      <p className="mt-4 text-center"><Link href={cat ? `/world/writing?category=${cat}` : "/world/writing"} className="text-sm font-bold text-vibe-aqua-ink">🔄 Show me different topics</Link></p>
      {past.length > 0 && (
        <section className="mt-10"><h2 className="title-md">My writing</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">{past.map((p) => <Link key={p.id} href={`/world/writing/${p.id}?mine=1`} className="glass flex justify-between p-4 hover:bg-glass/10"><span>{p.title}</span><span className="chip">{p.status === "evaluated" ? `⭐ ${p.score}` : "Draft"}</span></Link>)}</div>
        </section>
      )}
    </div>
  );
}
