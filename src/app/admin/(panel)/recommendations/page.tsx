import { query } from "@/server/db";
import { RecAdmin } from "./RecAdmin";

export const metadata = { title: "Recommendations" };
export default async function AdminRecommendations() {
  const [rules, byKind, top] = await Promise.all([
    query<{ id: string; kind: string; ref: string; action: string; note: string | null }>(`select id, kind, ref, action, note from recommendation_rules order by created_at desc`),
    query<{ kind: string; shown: number; children: number }>(
      `select split_part(module, ':', 1) kind, count(*)::int shown, count(distinct child_id)::int children
         from personalised_recommendations where created_on > current_date - 30 group by 1 order by 2 desc`),
    query<{ title: string; module: string; shown: number }>(
      `select title, module, count(*)::int shown from personalised_recommendations where created_on > current_date - 30 group by title, module order by shown desc limit 12`),
  ]);
  return (
    <div className="space-y-8">
      <div><h1 className="title-lg">Recommendations</h1><p className="text-sm text-vibe-lavender">The engine is rule-based and uses each child&apos;s own evidence. Here you can prioritise or exclude specific content, preview what a child would see, and review the last 30 days.</p></div>
      <RecAdmin rules={rules} />
      <section className="card p-6"><h2 className="title-md">Last 30 days</h2>
        <div className="mt-3 grid gap-6 lg:grid-cols-2">
          <table className="w-full text-left text-sm"><thead className="text-vibe-lavender"><tr><th className="py-1">Category</th><th>Times shown</th><th>Children</th></tr></thead>
            <tbody>{byKind.map((k) => <tr key={k.kind} className="border-t border-line/5"><td className="py-1">{k.kind.replace("_", " ")}</td><td>{k.shown}</td><td>{k.children}</td></tr>)}</tbody></table>
          <table className="w-full text-left text-sm"><thead className="text-vibe-lavender"><tr><th className="py-1">Most recommended</th><th>Skill</th><th>Shown</th></tr></thead>
            <tbody>{top.map((t) => <tr key={t.module + t.title} className="border-t border-line/5"><td className="py-1">{t.title}</td><td>{t.module.split(":")[1]}</td><td>{t.shown}</td></tr>)}</tbody></table>
        </div>
        {byKind.length === 0 && <p className="mt-2 text-sm text-vibe-lavender">No recommendations recorded yet.</p>}
      </section>
    </div>
  );
}
