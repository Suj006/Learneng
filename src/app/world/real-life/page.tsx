import Link from "next/link";
import { requireChild } from "@/server/session";
import { bandForGrade } from "@/lib/grades";
import { listForChild } from "@/server/reallife";
import { CharacterSays, PageTitle } from "@/components/ui";

export const metadata = { title: "VIBE Real Life" };
const LEVEL_LABEL: Record<string, string> = { beginner: "Beginner", developing: "Developing", advanced: "Advanced" };

export default async function RealLifeHub() {
  const child = await requireChild();
  const band = bandForGrade(child.grade);
  const list = await listForChild(child.id, band);
  const suggested = list[0]?.suggested ?? "beginner";
  return (
    <>
      <PageTitle title="🌍 VIBE Real Life" subtitle="English beyond the classroom: step into real places and talk with real-life characters." />
      <CharacterSays who="max" mood="excited">Ready for a real-life adventure, {child.display_name}? I suggest the <b>{LEVEL_LABEL[suggested]}</b> level for you, but you can choose any level!</CharacterSays>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const best = Math.max(0, ...Object.values(s.done));
          return (
            <Link key={s.slug} href={`/world/real-life/${s.slug}`} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-2"><span className="text-5xl" aria-hidden>{s.emoji}</span>
                {Object.keys(s.done).length ? <span className="chip text-vibe-mint-ink">✓ {Object.keys(s.done).map((l) => LEVEL_LABEL[l]).join(", ")}</span> : <span className="chip">New</span>}</div>
              <b className="mt-3 font-display text-lg">{s.title}</b>
              <span className="text-sm text-vibe-lavender">{s.place}</span>
              <p className="mt-2 flex-1 text-sm">{s.intro}</p>
              {best > 0 && <span className="mt-2 text-xs font-semibold text-vibe-purple-ink">Best: {best}%</span>}
            </Link>
          );
        })}
      </div>
    </>
  );
}
