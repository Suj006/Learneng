import Link from "next/link";
import { requireChild } from "@/server/session";
import { query } from "@/server/db";
import { CharacterSays, PageTitle, SpeakButton } from "@/components/ui";

export const metadata = { title: "My Learning Discoveries" };

/**
 * A private notebook of what the child is learning from their mistakes: words to practise, grammar concepts and
 * sentences GRAMMY helped improve. Only the child (and their parent's reports) can see it — never public.
 */
export default async function Discoveries() {
  const child = await requireChild();
  const [words, grammar, sentences] = await Promise.all([
    query<{ word: string; emoji: string; meaning: string; wrong_count: number; status: string }>(
      `select v.word, v.emoji, v.meaning, p.wrong_count, p.status from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id
       where p.child_id = $1 and p.wrong_count > 0 and p.status <> 'mastered' order by p.wrong_count desc, v.word limit 30`, [child.id]),
    query<{ title: string; emoji: string; slug: string; best_score: number }>(
      `select t.title, t.emoji, t.slug, g.best_score from grammar_progress g join grammar_topics t on t.id = g.topic_id where g.child_id = $1 order by g.best_score desc, t.title`, [child.id]),
    query<{ original: string; corrected: string; why: string | null }>(
      `select c->>'original' original, c->>'corrected' corrected, c->>'why' why
       from writing_submissions s join writing_evaluations e on e.submission_id = s.id, jsonb_array_elements(e.feedback->'corrections') c
       where s.child_id = $1 and coalesce(c->>'original','') <> coalesce(c->>'corrected','') order by e.created_at desc limit 12`, [child.id]),
  ]);
  const empty = !words.length && !grammar.length && !sentences.length;
  return (
    <>
      <PageTitle title="🔍 My Learning Discoveries" subtitle="Every mistake is a clue. Here's what you're discovering — just for you." back="/world/notebook" />
      {empty && <CharacterSays who="lexi" mood="encouraging">Nothing here yet! When a word or sentence is tricky, I'll save it here so we can practise together.</CharacterSays>}
      {words.length > 0 && (
        <section className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="title-md">🔤 Words to practise</h2><Link href="/world/revision" className="btn-primary btn-sm">Practise these →</Link></div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {words.map((w) => (
              <li key={w.word} className="flex items-center gap-3 rounded-2xl bg-glass/[0.06] p-3">
                <span className="text-3xl" aria-hidden>{w.emoji}</span>
                <div className="min-w-0 flex-1"><b className="font-display text-lg">{w.word}</b><p className="text-sm text-vibe-lavender">{w.meaning}</p></div>
                <SpeakButton text={w.word} label="Hear" />
              </li>
            ))}
          </ul>
        </section>
      )}
      {sentences.length > 0 && (
        <section className="card mt-5 p-5">
          <h2 className="title-md">✍️ Sentences I improved</h2>
          <ul className="mt-4 space-y-3">
            {sentences.map((s, i) => (
              <li key={i} className="rounded-2xl bg-glass/[0.06] p-3">
                <p className="text-sm text-vibe-lavender">Before: <span className="line-through">{s.original}</span></p>
                <p className="font-semibold">After: <span className="text-vibe-mint-ink">{s.corrected}</span></p>
                {s.why && <p className="mt-1 text-sm text-vibe-lavender">💡 {s.why}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {grammar.length > 0 && (
        <section className="card mt-5 p-5">
          <h2 className="title-md">🪐 Grammar I'm learning</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {grammar.map((g) => (
              <li key={g.slug}><Link href={`/world/grammar/${g.slug}`} className="flex items-center justify-between gap-3 rounded-2xl bg-glass/[0.06] p-3 hover:bg-glass/[0.1]">
                <span className="font-semibold">{g.emoji} {g.title}</span>
                <span className={`chip ${g.best_score >= 80 ? "text-vibe-mint-ink" : "text-vibe-sun-ink"}`}>{g.best_score >= 80 ? `✓ Learned (${g.best_score}%)` : `Practising (${g.best_score}%)`}</span>
              </Link></li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
