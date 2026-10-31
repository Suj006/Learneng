import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireChild } from "@/server/session";
import { worldContext } from "@/server/world-context";
import { one } from "@/server/db";
import { WorldHeader } from "@/components/world/WorldHeader";
import { BreakReminder } from "@/components/ui";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { ttsEnabled } from "@/server/tts";

export const dynamic = "force-dynamic";

const THEME_BG: Record<string, string> = {
  "theme-midnight": "bg-vibe-midnight",
  "theme-forest": "bg-[radial-gradient(1200px_600px_at_70%_-10%,rgba(47,191,113,0.35),transparent_60%)] bg-[#0E241C]",
  "theme-ocean": "bg-[radial-gradient(1200px_600px_at_70%_-10%,rgba(57,213,232,0.35),transparent_60%)] bg-[#0B1E3F]",
  "theme-sunset": "bg-[radial-gradient(1200px_600px_at_70%_-10%,rgba(255,107,107,0.35),transparent_60%)] bg-[#2A1530]",
  "theme-aurora": "bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(91,227,168,0.35),transparent_60%)] bg-[#0B1E3F]",
  "theme-candy": "bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(255,122,198,0.4),transparent_60%)] bg-[#2A1236]",
  "theme-volcano": "bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(255,107,107,0.45),transparent_60%)] bg-[#240E14]",
  "theme-cosmos": "bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(112,71,255,0.55),transparent_60%)] bg-[#0A0820]",
  "theme-gold": "bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(255,214,90,0.35),transparent_60%)] bg-[#1F1A10]",
};

export default async function WorldLayout({ children }: { children: React.ReactNode }) {
  const child = await requireChild();
  const path = (await headers()).get("x-pathname") ?? "";
  // First login: a playful character welcome (never a test), then straight into the first adventure.
  const p = await one<{ onboarded_at: string | null; audio_prefs: Record<string, unknown> | null; music_allowed: boolean; voices_allowed: boolean }>(
    `select cp.onboarded_at, cp.audio_prefs, pa.music_allowed, pa.voices_allowed
       from child_profiles cp join children c on c.id = cp.child_id join parents pa on pa.id = c.parent_id where cp.child_id = $1`, [child.id]);
  if (!p?.onboarded_at && !path.startsWith("/world/welcome") && !path.startsWith("/world/quest")) redirect("/world/welcome");
  const w = await worldContext(child);
  const minutes = ({ 1: 15, 2: 20, 3: 25, 4: 30 } as Record<number, number>)[w.child.band] ?? 20;
  return (
    <div className={`min-h-dvh ${THEME_BG[w.theme] ?? THEME_BG["theme-midnight"]}`} data-band={w.child.band}>
      <WorldHeader d={{
        name: w.child.name, levelId: w.level.level_id, levelName: w.level.name, tierName: w.level.tier_name, xp: w.level.xp_total, pct: w.level.pct, nextXp: w.level.next_xp,
        coins: w.level.coins, crystals: w.crystals, learningDays: w.learningDays, rhythm: w.streak.current, unread: w.unread, avatar: w.avatar, art: w.art,
        pet: w.pet?.emoji ?? null, notifications: w.notifications,
      }} />
      <main id="main" className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">{children}</main>
      <BreakReminder minutes={minutes} />
      <AudioProvider initialPrefs={p?.audio_prefs ?? null} policy={{ musicAllowed: p?.music_allowed ?? true, voicesAllowed: p?.voices_allowed ?? true }} serverTts={ttsEnabled()} />
    </div>
  );
}
