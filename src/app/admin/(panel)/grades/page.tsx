import { query } from "@/server/db";
import { GradeForm } from "@/components/admin/AdminForms";

export const metadata = { title: "Grades" };
export default async function Grades() {
  const g = await query<{ grade: string; label: string; band: number; new_words_per_day: number; active: boolean; plans: number }>(
    `select g.*, (select count(*)::int from learning_plans p where p.grade = g.grade) plans from grade_config g order by sort_order`);
  return (
    <div className="space-y-6">
      <h1 className="title-lg">Grades & 365-day plans</h1>
      <table className="w-full text-left text-sm"><thead className="text-vibe-lavender"><tr><th>Code</th><th>Label</th><th>Band</th><th>New words/day</th><th>Plan days</th><th>Active</th></tr></thead>
        <tbody>{g.map((x) => <tr key={x.grade} className="border-t border-line/5"><td className="py-1.5">{x.grade}</td><td>{x.label}</td><td>{x.band}</td><td>{x.new_words_per_day}</td><td>{x.plans}</td><td>{x.active ? "yes" : "no"}</td></tr>)}</tbody></table>
      <h2 className="title-md">Add or update a grade</h2><GradeForm />
    </div>
  );
}
