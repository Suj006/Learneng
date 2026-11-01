import { requireChild } from "@/server/session";
import { worldContext } from "@/server/world-context";
import { getJourney } from "@/server/journey";
import { missionsFor } from "@/server/missions";
import { recommendations } from "@/server/recommend";
import { activeEvents } from "@/server/events";
import { kingdomMap } from "@/server/world";
import { ADVENTURE_CHOICES, buddyMemory, missionOfTheDay, moduleStatus } from "@/server/adventure";
import { skillProfile } from "@/server/skills";
import { vocabCounts } from "@/server/vocab";
import { query } from "@/server/db";
import { Adventure } from "@/components/world/Adventure";

export const metadata = { title: "Daily Adventure" };

export default async function WorldHome() {
  const child = await requireChild();
  const w = await worldContext(child);
  const [journey, missions, recs, memory, events, kingdoms, status, skills, counts, family] = await Promise.all([
    getJourney(child.id, child.grade), missionsFor(child.id, child.grade), recommendations(child), buddyMemory(child.id, child.display_name),
    activeEvents(), kingdomMap(child.id, w.level.level_id), moduleStatus(child.id), skillProfile(child.id), vocabCounts(child.id),
    query<{ id: string; title: string; message: string }>(`select id, title, message from family_challenges where child_id = $1 and completed_at is null order by created_at desc`, [child.id]),
  ]);
  return (
    <Adventure d={{
      name: child.display_name, buddy: w.buddy, evolution: w.evolution, avatar: w.avatar, art: w.art, pet: w.pet, memory, welcomeBack: journey.welcomeBack,
      journey, missions: missions.filter((m) => m.scope === "daily" || m.scope === "event" || (m.done && !m.claimed)).concat(missions.filter((m) => m.scope !== "daily" && m.scope !== "event" && !(m.done && !m.claimed))),
      recs, events, kingdoms: kingdoms.map((k) => ({ slug: k.slug, title: k.title, emoji: k.emoji, art: k.art, unlocked: k.unlocked, unlock_level: k.unlock_level, progress: k.progress, href: k.href })),
      status, skills: skills.map((s) => ({ key: s.key, title: s.title, level: s.growth })), missionOfDay: missionOfTheDay(w.child.band), dueWords: counts.due,
      choices: ADVENTURE_CHOICES, family,
    }} />
  );
}
