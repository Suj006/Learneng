import Link from "next/link";
import { requireChild } from "@/server/session";
import { phonicsUnits } from "@/server/phonics";
import { Scene } from "@/components/Scenes";
import { CharacterSays, PageTitle } from "@/components/ui";

export const metadata = { title: "Phonics & Sound Valley" };
export default async function PhonicsValley() {
  const child = await requireChild();
  const units = await phonicsUnits(child.id, child.grade);
  const passed = units.filter((u) => u.passed).length;
  const next = units.find((u) => u.open && !u.passed);
  return (
    <div>
      <PageTitle title="🎶 Phonics & Sound Valley" subtitle={`${passed} of ${units.length} sound paths completed. Each path opens when you pass the one before — at your own pace.`} />
      <div className="card relative mb-6 h-36 overflow-hidden sm:h-48"><Scene name="valley" /></div>
      <CharacterSays who="lexi" mood="welcome">Hi {child.display_name}! Every word is made of sounds. Let&apos;s listen, blend and read together.{next ? ` Next stop: ${next.title}!` : " You've walked every sound path — amazing!"}</CharacterSays>
      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="phonics-units">
        {units.map((u) => (
          <li key={u.slug}>
            {u.open ? (
              <Link href={`/world/phonics/${u.slug}`} className={`card flex h-full items-start gap-3 p-4 transition hover:-translate-y-1 ${next?.slug === u.slug ? "ring-2 ring-vibe-purple/50" : ""}`} data-unit={u.slug}>
                <span className="text-4xl" aria-hidden>{u.emoji}</span>
                <span className="min-w-0"><b className="font-display">{u.order}. {u.title}</b><span className="block text-sm text-vibe-lavender">{u.objective}</span>
                  <span className="mt-1 block text-xs">{u.passed ? `⭐ Passed · best ${u.best}%` : u.best !== null ? `Best so far ${u.best}% (60% opens the next path)` : "Ready to start"}</span></span>
              </Link>
            ) : (
              <div className="glass flex h-full items-start gap-3 p-4 opacity-70" data-unit={u.slug} aria-disabled>
                <span className="text-4xl grayscale" aria-hidden>{u.emoji}</span>
                <span><b className="font-display">{u.order}. {u.title}</b><span className="block text-xs">🔒 Pass the path before this one</span></span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
