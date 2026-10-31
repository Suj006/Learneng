"use client";
import { useState } from "react";
import { api } from "@/lib/client";
import { applyAppearance, type Motion } from "@/lib/theme/client";
import { audio } from "@/lib/audio/manager";
import { Character } from "@/components/Character";
import { ErrorNote } from "@/components/ui";
import { SoundSettings } from "@/components/audio/AudioControls";

type T = { slug: string; name: string; emoji: string; tagline: string; swatches: string[] };
const SWATCH_NAMES = ["main", "blue", "pink", "green", "yellow", "orange"];

/** A real miniature of the app, drawn with the theme's own variables (the card carries data-theme). */
function MiniDashboard({ t }: { t: T }) {
  return (
    <div data-theme={t.slug} className="pv-page overflow-hidden rounded-3xl border border-line/15 p-3 text-left" aria-hidden>
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-vibe-cta text-xs text-white">⭐</span>
        <b className="flex-1 truncate font-display text-sm text-ink">PING VIBE Adventure</b>
        <span className="chip bg-vibe-sun/25 px-2 py-0.5 text-[10px] text-vibe-sun-ink">🪙 120</span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="module-quest rounded-2xl p-2"><div className="text-lg">📖</div><div className="text-[11px] font-bold text-ink">Word Quest</div></div>
        <div className="module-rewards rounded-2xl p-2"><div className="text-lg">🎁</div><div className="text-[11px] font-bold text-ink">Rewards</div></div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-glass/15"><div className="h-full w-2/3 rounded-full bg-vibe-mint" /></div>
      <div className="mt-2 flex gap-2">
        <span className="btn-primary btn-sm pointer-events-none !min-h-0 flex-1 !px-2 !py-1.5 text-xs">Explore!</span>
        <span className="btn-ghost btn-sm pointer-events-none !min-h-0 !px-2 !py-1.5 text-xs">Later</span>
      </div>
    </div>
  );
}

export function LookPicker({ themes, current, chosen, defaultTheme, motion: initialMotion }: { themes: T[]; current: string; chosen: string | null; defaultTheme: string; motion: Motion }) {
  const [sel, setSel] = useState(current);
  const [motion, setMotion] = useState<Motion>(initialMotion);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  /** Applies instantly (no reload), then saves. The previous look comes back if saving fails. */
  async function choose(slug: string | null) {
    const before = sel; const next = slug ?? defaultTheme;
    setErr(null); setSel(next);
    applyAppearance({ theme: slug });
    audio.sfx("unlock");
    try {
      await api("/api/world/appearance", { body: { theme: slug } });
      const t = themes.find((x) => x.slug === next);
      setSaved(slug ? `${t?.emoji} ${t?.name} is your new look!` : "Back to Rainbow Wonder, the classic PING VIBE look!");
    } catch (e) { setSel(before); applyAppearance({ theme: before }); setErr((e as Error).message); }
  }
  async function chooseMotion(m: Motion) {
    setMotion(m); applyAppearance({ motion: m });
    try { await api("/api/world/appearance", { body: { motion: m } }); } catch (e) { setErr((e as Error).message); }
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="themes-h">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Character name="max" mood="excited" size={64} still className="shrink-0" />
            <div><h2 id="themes-h" className="title-md">Make PING VIBE Your Own!</h2><p className="text-sm text-vibe-lavender">Every theme is free. Change it whenever you like — your progress always stays safe.</p></div>
          </div>
          <button className="btn-ghost btn-sm" onClick={() => choose(null)} disabled={!chosen && sel === defaultTheme}>↺ Reset to default</button>
        </div>
        <div aria-live="polite">{saved && <p className="mb-4 rounded-2xl bg-vibe-mint/15 p-3 font-semibold text-vibe-mint-ink">✅ {saved}</p>}<ErrorNote error={err} /></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Colour theme">
          {themes.map((t) => {
            const on = sel === t.slug;
            return (
              <div key={t.slug} className={`card flex flex-col gap-3 p-4 transition ${on ? "ring-4 ring-vibe-purple/60" : "hover:-translate-y-0.5"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div><b className="font-display text-lg">{t.emoji} {t.name}</b><p className="text-sm text-vibe-lavender">{t.tagline}</p></div>
                  {on && <span className="chip shrink-0 bg-vibe-mint/20 text-vibe-mint-ink">✓ Selected</span>}
                  {t.slug === defaultTheme && !on && <span className="chip shrink-0">Default</span>}
                </div>
                <div className="flex gap-1.5" aria-label={`${t.name} colours`}>
                  {t.swatches.map((c, i) => <span key={i} title={SWATCH_NAMES[i]} className="h-6 flex-1 rounded-full border border-line/10" style={{ background: c }} />)}
                </div>
                <MiniDashboard t={t} />
                <button role="radio" aria-checked={on} onClick={() => !on && choose(t.slug)} className={on ? "btn-ghost w-full" : "btn-primary w-full"}>
                  {on ? "✓ This is my look" : "Select theme"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="motion-h" className="card p-5">
        <h2 id="motion-h" className="title-md">✨ Animations</h2>
        <p className="mt-1 text-sm text-vibe-lavender">How much movement do you like?</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Animation intensity">
          {([["full", "🎆 Full sparkle", "All the magic"], ["calm", "🌙 Calm", "Gentle — no looping decorations"], ["off", "🪨 Still", "No movement at all"]] as const).map(([k, l, d]) => (
            <button key={k} role="radio" aria-checked={motion === k} onClick={() => chooseMotion(k)}
              className={`rounded-3xl border-2 p-4 text-left transition ${motion === k ? "border-vibe-purple bg-vibe-purple/10" : "border-line/15 hover:bg-glass/[0.06]"}`}>
              <b className="font-display">{l}</b>{motion === k && <span className="ml-2 text-sm font-bold text-vibe-purple-ink">✓</span>}<span className="block text-sm text-vibe-lavender">{d}</span>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="sound-h" className="card p-5">
        <h2 id="sound-h" className="title-md">🎵 Sounds</h2>
        <div className="mt-3 max-w-md"><SoundSettings /></div>
      </section>
    </div>
  );
}
