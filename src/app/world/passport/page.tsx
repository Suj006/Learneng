import { requireChild } from "@/server/session";
import { passport } from "@/server/passport";
import { CharacterSays, PageTitle } from "@/components/ui";

export const metadata = { title: "Adventure Passport" };
const KIND: Record<string, string> = { kingdom: "Kingdoms visited", real_life: "Real-life places", words: "Word milestones", stories: "Reading", phonics: "Phonics", grammar: "Grammar", writing: "Writing & stories", speaking: "Speaking", listening: "Listening", skills: "Skill tree", achievement: "Achievements" };
const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function Passport() {
  const child = await requireChild();
  const { stamps, next } = await passport(child.id);
  const kinds = Object.keys(KIND).filter((k) => stamps.some((s) => s.kind === k));
  return (
    <div>
      <PageTitle title="🛂 My Adventure Passport" subtitle={`${stamps.length} stamp${stamps.length === 1 ? "" : "s"} collected. Each stamp is earned once, on the day you first got it.`} />
      <CharacterSays who="max" mood={stamps.length ? "celebrating" : "welcome"}>{stamps.length ? `Look at all the places you've explored, ${child.display_name}!` : `Your passport is ready, ${child.display_name}! Play, read and talk to collect your first stamp.`}</CharacterSays>
      {kinds.map((k) => (
        <section key={k} className="mt-8"><h2 className="title-md">{KIND[k]}</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" data-testid={`stamps-${k}`}>
            {stamps.filter((s) => s.kind === k).map((s) => (
              <li key={s.slug} className="card -rotate-1 border-2 border-dashed border-vibe-sun/60 p-4 text-center" data-stamp={s.slug}>
                <span className="text-4xl" aria-hidden>{s.emoji}</span>
                <p className="mt-1 font-bold">{s.title}</p>
                <p className="text-xs text-vibe-lavender">Stamped {fmt(s.created_at)}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {next.length > 0 && (
        <section className="mt-10"><h2 className="title-md">Stamps still to find</h2>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {next.slice(0, 8).map((s) => (
              <li key={s.slug} className="glass p-4 text-center opacity-80"><span className="text-3xl grayscale" aria-hidden>{s.emoji}</span><p className="mt-1 text-sm font-bold">{s.title}</p><p className="text-xs text-vibe-lavender">{s.hint}</p></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
