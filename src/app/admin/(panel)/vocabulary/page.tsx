import { query } from "@/server/db";
import { VocabEditor } from "@/components/admin/AdminForms";

export const metadata = { title: "Vocabulary" };
export default async function Vocabulary({ searchParams }: { searchParams: Promise<{ q?: string; band?: string }> }) {
  const { q = "", band = "" } = await searchParams;
  const words = await query<{ id: string; word: string; band: number; category: string; source: string; meaning: string; explanation: string; example: string; phonetic: string; emoji: string; status: string }>(
    `select id, word, band, category, source, meaning, explanation, example, phonetic, emoji, status from vocabulary_master
     where ($1 = '' or word ilike '%' || $1 || '%') and ($2 = '' or band::text = $2) order by band, word limit 100`, [q, band]);
  const counts = await query<{ band: number; n: number }>(`select band, count(*)::int n from vocabulary_master where status = 'published' group by band order by band`);
  return (
    <div className="space-y-4">
      <h1 className="title-lg">Vocabulary master</h1>
      <p className="text-sm text-vibe-lavender">{counts.map((c) => `Band ${c.band}: ${c.n}`).join(" · ")} published. New words are added through the Content Studio review queue.</p>
      <form className="flex gap-2"><input name="q" defaultValue={q} className="input max-w-xs" placeholder="Search" /><select name="band" defaultValue={band} className="input w-32"><option value="">All bands</option>{[1, 2, 3, 4].map((b) => <option key={b}>{b}</option>)}</select><button className="btn-ghost btn-sm">Filter</button></form>
      {words.map((w) => <details key={w.id} className="card p-4"><summary className="cursor-pointer"><b>{w.emoji} {w.word}</b> <span className="text-sm text-vibe-lavender">· band {w.band} · {w.category} · {w.source} · {w.status}</span></summary><div className="mt-3"><VocabEditor w={w} /></div></details>)}
    </div>
  );
}
