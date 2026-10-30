import { requireChild } from "@/server/session";
import { missionsFor } from "@/server/missions";
import { MissionCard } from "@/components/world/MissionCard";
import { PageTitle } from "@/components/ui";

export const metadata = { title: "Missions" };
const GROUPS: [string, string][] = [["daily", "☀️ Daily Missions"], ["weekly", "📅 Weekly Missions"], ["character", "🎭 Character Mission"], ["mystery", "🕵️ Mystery Mission"], ["event", "🎉 Event Missions"], ["monthly", "🌙 Monthly Missions"]];

export default async function Missions() {
  const child = await requireChild();
  const all = await missionsFor(child.id, child.grade);
  return (
    <div>
      <PageTitle title="Missions" subtitle="Progress comes from real learning. Claim rewards when a mission is complete!" />
      <div className="space-y-8">
        {GROUPS.map(([scope, title]) => {
          const list = all.filter((m) => m.scope === scope);
          if (!list.length) return null;
          return <section key={scope}><h2 className="title-md">{title}</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{list.map((m) => <MissionCard key={m.slug} m={m} />)}</div></section>;
        })}
      </div>
    </div>
  );
}
