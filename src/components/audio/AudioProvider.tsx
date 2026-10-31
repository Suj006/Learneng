"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { audio } from "@/lib/audio/manager";
import { themeForPath } from "@/lib/audio/music";
import { introduce, type IntroKey } from "@/lib/audio/lines";
import { loadLocalPrefs, type AudioPolicy, type AudioPrefs } from "@/lib/audio/prefs";
import { Character, type CharacterName } from "@/components/Character";

/** Re-render when the AudioManager changes (prefs, unlock, captions). */
export function useAudioState() {
  return useSyncExternalStore(
    (fn) => audio.subscribe(fn),
    () => `${audio.unlocked}|${JSON.stringify(audio.prefs)}|${audio.caption?.id ?? 0}|${audio.policy.musicAllowed}|${audio.policy.voicesAllowed}`,
    () => "ssr",
  );
}

/** Area introductions: each character greets the child in their own area, at most once a day. */
const INTROS: Record<string, IntroKey> = {
  "/world": "dashboard", "/world/quest": "quest", "/world/grammar": "grammar", "/world/speaking": "speaking",
  "/world/writing": "writing", "/world/reading": "reading", "/world/arcade": "arcade", "/world/rewards": "rewards",
};

const NAMES: Record<string, string> = { lexi: "LEXI", grammy: "GRAMMY", speaky: "SPEAKY", story: "STORY", max: "MAX", narrator: "" };

/**
 * Installs the audio system for the child's world: unlocks sound on the first tap, picks the music theme for the
 * current page, plays soft tap sounds for buttons, pauses everything when the tab is hidden, saves preferences and
 * shows captions for spoken lines.
 */
export function AudioProvider({ initialPrefs, policy, serverTts }: { initialPrefs: Partial<AudioPrefs> | null; policy: AudioPolicy; serverTts: boolean }) {
  const path = usePathname();
  useAudioState();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hint, setHint] = useState(false);

  // Device preferences win (most recent), else the child's saved profile, else defaults.
  // Depends only on primitives, so a server refresh (e.g. after a reward) never restarts the music.
  const musicAllowed = policy.musicAllowed, voicesAllowed = policy.voicesAllowed;
  const prefsJson = JSON.stringify(initialPrefs ?? null);
  useEffect(() => {
    audio.configure(loadLocalPrefs() ?? JSON.parse(prefsJson), { musicAllowed, voicesAllowed }, serverTts);
  }, [prefsJson, musicAllowed, voicesAllowed, serverTts]);

  useEffect(() => {
    audio.onPrefsChange = (p) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => { fetch("/api/world/audio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) }).catch(() => {}); }, 800);
    };
    const unlock = () => { audio.unlock(); setHint(false); };
    const tap = (e: Event) => {
      const el = (e.target as HTMLElement | null)?.closest?.("button, a, [role=radio], [role=tab], select, input[type=checkbox]");
      if (!el || (el as HTMLButtonElement).disabled) return;
      audio.sfx(el.matches("[role=radio], [role=tab], select, input[type=checkbox]") ? "select" : "tap");
    };
    const vis = () => (document.hidden ? audio.suspend() : audio.resume());
    window.addEventListener("pointerdown", unlock, { capture: true });
    window.addEventListener("keydown", unlock, { capture: true });
    window.addEventListener("click", tap, { capture: true });
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("pagehide", audio.suspend.bind(audio));
    // Friendly activation hint, at most once per browser session.
    const t = setTimeout(() => {
      let seen = false; try { seen = sessionStorage.getItem("pv-audio-hint") === "1"; sessionStorage.setItem("pv-audio-hint", "1"); } catch { /* ignore */ }
      if (!seen && !audio.unlocked && (audio.musicActive || audio.voiceActive)) setHint(true);
    }, 1200);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointerdown", unlock, { capture: true });
      window.removeEventListener("keydown", unlock, { capture: true });
      window.removeEventListener("click", tap, { capture: true });
      document.removeEventListener("visibilitychange", vis);
      audio.onPrefsChange = null;
      audio.shutdown(); // leaving the child's world: no audio keeps playing on parent/login pages
    };
  }, []);

  // Music theme follows the page; voice lines from the previous page stop.
  useEffect(() => {
    audio.setTheme(themeForPath(path));
    const intro = INTROS[path];
    const t = intro ? setTimeout(() => introduce(intro), 900) : null;
    return () => { if (t) clearTimeout(t); audio.stopVoice(); audio.dropPending(); };
  }, [path]);

  const c = audio.caption;
  return (
    <>
      {/* Centred by a flex wrapper: the slide-in animation sets `transform`, which would cancel a translate-based centring. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 flex justify-center px-4 lg:bottom-6">
        <AnimatePresence>
          {hint && !audio.unlocked && (
            <motion.button key="hint" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              onClick={() => { audio.unlock(); setHint(false); }}
              className="pointer-events-auto rounded-full border border-line/15 bg-vibe-midnight-2/95 px-5 py-3 font-display text-sm font-bold shadow-card backdrop-blur">
              🔊 Tap to turn on music &amp; voices
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {/* Captions sit just under the header (action buttons live lower down) and never block taps: only ✕ is clickable. */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-3 top-[4.5rem] z-[45] flex justify-center">
        <AnimatePresence>
          {c && (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
              className="flex max-w-lg items-center gap-3 rounded-3xl border border-line/10 bg-vibe-midnight-2/95 p-2.5 pr-2 shadow-card backdrop-blur">
              {c.who !== "narrator" && <Character name={c.who as CharacterName} mood="welcome" size={44} still className="shrink-0" />}
              <p className="text-sm leading-snug">{NAMES[c.who] && <b className="mr-1 font-display text-vibe-sun-ink">{NAMES[c.who]}:</b>}{c.text}</p>
              <button onClick={() => { audio.stopVoice(); audio.clearCaption(); }} className="pointer-events-auto ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-glass/10" aria-label="Close caption">✕</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
