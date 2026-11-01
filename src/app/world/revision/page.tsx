import Link from "next/link";
import { requireChild } from "@/server/session";
import { revisionPlan } from "@/server/revision-plan";
import { RevisionClient } from "./RevisionClient";

export const metadata = { title: "Revision Boost" };
const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

export default async function RevisionPage() {
  const child = await requireChild();
  const r = await revisionPlan(child.id);
  return (
    <div>
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="revision-overview" aria-label="Revision overview">
        <div className="card p-4 text-center"><p className="text-3xl font-bold">{r.due}</p><p className="text-sm">🔁 Revise now</p></div>
        <div className="card p-4 text-center"><p className="text-3xl font-bold">{r.overdue}</p><p className="text-sm">⏰ Waiting a while</p></div>
        <div className="card p-4 text-center"><p className="text-3xl font-bold">{r.upcoming.reduce((a, b) => a + b.n, 0)}</p><p className="text-sm">📅 Coming this week</p></div>
        <div className="card p-4 text-center"><p className="text-3xl font-bold">{r.retention}</p><p className="text-sm">🧠 Memory checks</p></div>
      </section>
      <RevisionClient />
      {(r.upcoming.length > 0 || r.mastered.length > 0 || r.grammar.length > 0) && (
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {r.upcoming.length > 0 && <section className="glass p-4"><h2 className="font-display font-bold">📅 Upcoming revision</h2>
            <ul className="mt-2 text-sm">{r.upcoming.map((u) => <li key={u.day}>{fmt(u.day)}: {u.n} word{u.n > 1 ? "s" : ""}</li>)}</ul></section>}
          {r.mastered.length > 0 && <section className="glass p-4"><h2 className="font-display font-bold">🌟 Recently mastered</h2>
            <p className="mt-2 flex flex-wrap gap-2 text-sm">{r.mastered.map((m) => <span key={m.word} className="chip">{m.emoji} {m.word}</span>)}</p></section>}
          {r.grammar.length > 0 && <section className="glass p-4"><h2 className="font-display font-bold">🪐 Grammar to refresh</h2>
            <ul className="mt-2 space-y-1 text-sm">{r.grammar.map((g) => <li key={g.slug}><Link className="text-vibe-aqua-ink underline" href={`/world/grammar/${g.slug}`}>{g.emoji} {g.title}</Link> <span className="text-vibe-lavender">— {g.why === "practise" ? "let's practise again" : "memory check"}</span></li>)}</ul></section>}
        </div>
      )}
    </div>
  );
}
