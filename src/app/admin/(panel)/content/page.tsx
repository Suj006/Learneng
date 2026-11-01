import { query } from "@/server/db";
import { coverage } from "@/server/content/pipeline";
import { aiEnabled } from "@/server/ai/client";
import { THEMES } from "@/server/content/curriculum";
import { GenerateForm, ManualVocab, ReviewButtons } from "@/components/admin/AdminForms";

export const metadata = { title: "Content Studio" };
export default async function ContentStudio() {
  const [cov, pending, rejected, jobs, grammar, cands, sources] = await Promise.all([
    coverage(),
    query<{ id: string; kind: string; title: string; band: number; body: any; validation: { passed: boolean; checks: { name: string; passed: boolean; detail: string }[] }; source: string; created_at: string }>(`select * from content_library where status = 'pending' order by created_at desc limit 50`),
    query<{ id: string; kind: string; title: string; validation: any }>(`select id, kind, title, validation from content_library where status = 'rejected' order by created_at desc limit 10`),
    query<{ kind: string; band: number; status: string; produced: number; rejected: number; error: string | null; created_at: string }>(`select * from content_generation_jobs order by created_at desc limit 8`),
    query<{ slug: string; title: string }>(`select slug, title from grammar_topics order by sort_order`),
    query<{ band: number; status: string; n: number }>(`select band, status, count(*)::int n from vocabulary_candidates group by band, status order by band, status`),
    query<{ source: string; status: string; n: number }>(`select split_part(source, ':', 1) source, status, count(*)::int n from vocabulary_candidates group by 1, 2 order by 1, 2`),
  ]);
  return (
    <div className="space-y-10">
      <section>
        <h1 className="title-lg">Content Studio</h1>
        <p className="mt-1 text-sm text-vibe-lavender">Honest coverage: <b>plan days</b> are structured daily plans (always 365 per grade). <b>Fresh vocabulary days</b> = how many learning days of never-seen published words a new child at that grade can receive today. Grow it by publishing reviewed words.</p>
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="text-vibe-lavender"><tr><th>Grade</th><th>Band</th><th>Plan days</th><th>Words in band</th><th>Words available (band+)</th><th>Fresh vocab days</th><th>Queued headwords</th><th>Writing topics</th><th>Stories</th><th>Grammar ex.</th><th>Speaking</th></tr></thead>
          <tbody>{cov.map((c) => <tr key={c.grade} className="border-t border-line/5"><td className="py-1.5 font-bold">{c.label}</td><td>{c.band}</td><td className={c.plans >= 365 ? "text-vibe-mint-ink" : "text-vibe-coral-ink"}>{c.plans}</td><td>{c.wordsInBand}</td><td>{c.wordsAvailable}</td><td className={c.vocabDays >= 365 ? "text-vibe-mint-ink" : "text-vibe-sun-ink"}>{c.vocabDays}</td><td>{c.candidates}</td><td>{c.topics}</td><td>{c.stories}</td><td>{c.grammarExercises}</td><td>{c.speaking}</td></tr>)}</tbody></table></div>
        <p className="mt-2 text-xs text-vibe-lavender">Headword pipeline: {cands.map((c) => `band ${c.band} ${c.status}: ${c.n}`).join(" · ")}</p>
        <p className="mt-1 text-xs text-vibe-lavender" data-testid="candidate-sources">Candidate sources: {sources.map((c) => `${c.source === "cambridge-reference" ? "Cambridge-reference-derived" : "PING VIBE"} ${c.status}: ${c.n}`).join(" · ")} — Cambridge-derived entries are headwords only (no copied content), not endorsed by Cambridge, and need enrichment + human approval like every other word.</p>
      </section>
      <section><h2 className="title-md">Generate with AI (validated, then reviewed)</h2>
        <p className="text-sm text-vibe-lavender">Each item passes 7 gates — safety, readability/grade, grammar & mechanics, spelling (AI reviewer), duplicates, difficulty, age suitability — before entering the queue. Nothing reaches children until approved here.</p>
        <div className="mt-3"><GenerateForm aiOn={aiEnabled()} grammarTopics={grammar} themes={THEMES} /></div>
        {jobs.length > 0 && <ul className="mt-3 space-y-1 text-xs text-vibe-lavender">{jobs.map((j) => <li key={j.created_at}>{new Date(j.created_at).toLocaleString()} · {j.kind} band {j.band} · {j.status} · {j.produced} passed / {j.rejected} rejected {j.error ? `· ${j.error}` : ""}</li>)}</ul>}
      </section>
      <section><h2 className="title-md">Review queue ({pending.length})</h2>
        {pending.length === 0 && <p className="mt-2 text-sm text-vibe-lavender">Nothing waiting for review.</p>}
        <div className="mt-3 space-y-3">{pending.map((p) => (
          <article key={p.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2"><div><span className="chip">{p.kind}</span> <span className="chip">band {p.band}</span> <span className="chip">{p.source}</span> <b className="ml-1">{p.title}</b></div><ReviewButtons id={p.id} /></div>
            <details className="mt-2 text-sm"><summary className="cursor-pointer text-vibe-aqua-ink">Content & validation</summary>
              <ul className="mt-2 grid gap-1 md:grid-cols-2">{p.validation.checks?.map((c) => <li key={c.name} className={c.passed ? "text-vibe-mint-ink" : "text-vibe-coral-ink"}>{c.passed ? "✓" : "✗"} {c.name}: <span className="text-vibe-lavender">{c.detail}</span></li>)}</ul>
              <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-black/30 p-3 text-xs">{JSON.stringify(p.body, null, 2)}</pre>
            </details>
          </article>
        ))}</div>
      </section>
      {rejected.length > 0 && <section><h2 className="title-md">Recently auto-rejected</h2><ul className="mt-2 space-y-1 text-sm text-vibe-lavender">{rejected.map((r) => <li key={r.id}>{r.kind}: {r.title} — {(r.validation.checks ?? []).filter((c: any) => !c.passed).map((c: any) => c.name).join(", ")}</li>)}</ul></section>}
      <section><h2 className="title-md">Add a word manually</h2><div className="mt-3"><ManualVocab /></div></section>
    </div>
  );
}
