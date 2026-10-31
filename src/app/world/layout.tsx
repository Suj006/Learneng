import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireChild } from "@/server/session";
import { worldContext } from "@/server/world-context";
import { one } from "@/server/db";
import { WorldHeader } from "@/components/world/WorldHeader";
import { BreakReminder } from "@/components/ui";
import { AudioProvider } from "@/components/audio/AudioProvider";
import { ttsEnabled } from "@/server/tts";
import { resolveTheme } from "@/server/themes";
import { ThemeSync } from "@/components/theme/ThemeSync";

export const dynamic = "force-dynamic";

/**
 * "World themes" earned in the Reward Shop add a gentle coloured glow on top of the child's colour theme
 * (the page colours themselves always come from the colour theme, so text stays readable).
 */
const WORLD_GLOW: Record<string, string> = {
  "theme-forest": "47 191 113", "theme-ocean": "57 213 232", "theme-sunset": "255 107 107", "theme-aurora": "91 227 168",
  "theme-candy": "255 122 198", "theme-volcano": "255 107 107", "theme-cosmos": "112 71 255", "theme-gold": "255 214 90",
};
const worldGlow = (theme: string) => WORLD_GLOW[theme]
  ? { backgroundImage: `radial-gradient(1200px 600px at 60% -10%, rgb(${WORLD_GLOW[theme]} / 0.22), transparent 60%)` } : undefined;

export default async function WorldLayout({ children }: { children: React.ReactNode }) {
  const child = await requireChild();
  const path = (await headers()).get("x-pathname") ?? "";
  // First login: a playful character welcome (never a test), then straight into the first adventure.
  const p = await one<{ onboarded_at: string | null; audio_prefs: Record<string, unknown> | null; music_allowed: boolean; voices_allowed: boolean; color_theme: string | null; motion: "full" | "calm" | "off" }>(
    `select cp.onboarded_at, cp.audio_prefs, pa.music_allowed, pa.voices_allowed, cp.color_theme, cp.motion
       from child_profiles cp join children c on c.id = cp.child_id join parents pa on pa.id = c.parent_id where cp.child_id = $1`, [child.id]);
  if (!p?.onboarded_at && !path.startsWith("/world/welcome") && !path.startsWith("/world/quest")) redirect("/world/welcome");
  const w = await worldContext(child);
  const theme = await resolveTheme(p?.color_theme);
  const minutes = ({ 1: 15, 2: 20, 3: 25, 4: 30 } as Record<number, number>)[w.child.band] ?? 20;
  return (
    <div className="pv-page min-h-dvh" data-theme={theme} data-theme-scope="" data-band={w.child.band}>
      <ThemeSync theme={theme} motion={p?.motion ?? "full"} />
      <div className="min-h-dvh" style={worldGlow(w.theme)}>
      <WorldHeader d={{
        name: w.child.name, levelId: w.level.level_id, levelName: w.level.name, tierName: w.level.tier_name, xp: w.level.xp_total, pct: w.level.pct, nextXp: w.level.next_xp,
        coins: w.level.coins, crystals: w.crystals, learningDays: w.learningDays, rhythm: w.streak.current, unread: w.unread, avatar: w.avatar, art: w.art,
        pet: w.pet?.emoji ?? null, notifications: w.notifications,
      }} />
      <main id="main" className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">{children}</main>
      <BreakReminder minutes={minutes} />
      </div>
      <AudioProvider initialPrefs={p?.audio_prefs ?? null} policy={{ musicAllowed: p?.music_allowed ?? true, voicesAllowed: p?.voices_allowed ?? true }} serverTts={ttsEnabled()} />
    </div>
  );
}
