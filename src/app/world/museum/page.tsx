import Link from "next/link";
import { requireChild } from "@/server/session";
import { query } from "@/server/db";
import { timeline, collection } from "@/server/world";
import { PageTitle } from "@/components/ui";

export const metadata = { title: "Achievement Museum" };
const CERTS = [
  { kind: "first-10-words", title: "First 10 Words" }, { kind: "first-100-mastered", title: "100 Words Mastered" }, { kind: "level-25", title: "Level 25" },
  { kind: "level-50", title: "Level 50" }, { kind: "level-100", title: "Level 100" }, { kind: "level-250", title: "Level 250" }, { kind: "ach-explorer-30", title: "30-Day English Explorer" },
];

export default async function Museum() {
  const child = await requireChild();
  const [tl, achievements, col] = await Promise.all([
    timeline(child.id),
    query<{ slug: string; title: string; description: string; emoji: string; unlocked_at: string | null }>(
      `select a.slug, a.title, a.description, a.emoji, c.unlocked_at from achievements a left join child_achievements c on c.slug = a.slug and c.child_id = $1 order by a.sort_order`, [child.id]),
    collection(child.id),
  ]);
  const earned = new Set(tl.map((t) => t.kind));
  return (
    <div className="space-y-10">
      <PageTitle title="🏛️ My Achievement Museum" subtitle="Every trophy, certificate and milestone from your PING VIBE journey." />
      <section><h2 className="title-md">🏆 Trophy Hall</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{achievements.map((a) => (
          <div key={a.slug} className={`card flex flex-col items-center p-4 text-center ${a.unlocked_at ? "shadow-glow-sun" : "opacity-40 grayscale"}`}><span className="text-4xl">{a.emoji}</span><b className="mt-2 text-sm">{a.title}</b><span className="mt-1 text-[11px] text-vibe-lavender">{a.unlocked_at ? new Date(a.unlocked_at).toLocaleDateString() : a.description}</span></div>
        ))}</div>
      </section>
      <section><h2 className="title-md">📜 Certificates</h2>
        <div className="mt-4 flex flex-wrap gap-3">{CERTS.map((c) => earned.has(c.kind)
          ? <Link key={c.kind} href={`/world/certificate/${c.kind}`} className="btn-sun btn-sm">🎓 {c.title}</Link>
          : <span key={c.kind} className="chip opacity-50">🔒 {c.title}</span>)}</div>
      </section>
      <section><h2 className="title-md">🕰️ My Learning Journey</h2>
        <ol className="relative mt-4 space-y-4 border-l-2 border-vibe-purple/50 pl-6">
          {tl.map((t) => (
            <li key={t.kind} className="relative"><span className="absolute -left-[37px] grid h-8 w-8 place-items-center rounded-full bg-vibe-midnight-3 text-lg">{t.emoji}</span>
              <b>{t.title}</b><div className="text-xs text-vibe-lavender">{new Date(t.achieved_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</div></li>
          ))}
        </ol>
      </section>
      <section className="card flex flex-wrap items-center justify-between gap-4 p-6"><div><h2 className="title-md">🃏 Collection Book</h2><p className="text-sm text-vibe-lavender">{col.vocab.length} vocabulary · {col.grammar.length} grammar · {col.stories.length} story · {col.cards.filter((c) => c.owned).length} special cards</p></div><Link href="/world/collection" className="btn-primary">Open collection</Link></section>
    </div>
  );
}
