"use client";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio/manager";
import type { AudioPrefs } from "@/lib/audio/prefs";
import { useAudioState } from "./AudioProvider";

function Toggle({ label, on, onChange, disabled, note }: { label: string; on: boolean; onChange: (v: boolean) => void; disabled?: boolean; note?: string }) {
  return (
    <label className={`flex min-h-[44px] items-center justify-between gap-3 ${disabled ? "opacity-50" : ""}`}>
      <span className="font-semibold">{label}{note && <span className="block text-xs font-normal text-vibe-lavender">{note}</span>}</span>
      <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition ${on ? "bg-vibe-mint" : "bg-glass/15"}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-7" : "left-1"}`} />
      </button>
    </label>
  );
}
function Slider({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <label className={`block ${disabled ? "opacity-50" : ""}`}>
      <span className="flex justify-between text-sm"><span>{label}</span><span className="text-vibe-lavender">{Math.round(value * 100)}%</span></span>
      <input type="range" min={0} max={100} step={5} value={Math.round(value * 100)} disabled={disabled} onChange={(e) => onChange(Number(e.target.value) / 100)}
        className="mt-1 h-8 w-full cursor-pointer accent-vibe-aqua" aria-label={label} />
    </label>
  );
}

/** 🔊 button in the main navigation, with all sound settings in one small panel. */
export function AudioControls() {
  useAudioState();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const p = audio.prefs; const pol = audio.policy;
  const set = (patch: Partial<AudioPrefs>) => { audio.unlock(); audio.setPrefs(patch); };
  const silent = (!p.musicOn || !pol.musicAllowed) && !p.sfxOn && (!p.voiceOn || !pol.voicesAllowed) || p.master === 0;
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close); document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => { audio.unlock(); setOpen(!open); }} className="grid h-10 w-10 place-items-center rounded-full hover:bg-glass/10" aria-label="Sound settings" aria-expanded={open} title="Sound settings">
        {silent ? "🔇" : "🔊"}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(88vw,320px)] space-y-3 rounded-3xl border border-line/10 bg-vibe-midnight-2 p-4 text-left shadow-card" role="dialog" aria-label="Sound settings">
          <b className="font-display">🎵 Sounds</b>
          <Toggle label="Background music" on={p.musicOn && pol.musicAllowed} disabled={!pol.musicAllowed} note={!pol.musicAllowed ? "Switched off by your parent" : undefined} onChange={(v) => set({ musicOn: v })} />
          <Toggle label="Sound effects" on={p.sfxOn} onChange={(v) => { set({ sfxOn: v }); if (v) setTimeout(() => audio.sfx("coin"), 50); }} />
          <Toggle label="Character voices" on={p.voiceOn && pol.voicesAllowed} disabled={!pol.voicesAllowed} note={!pol.voicesAllowed ? "Switched off by your parent" : undefined} onChange={(v) => { set({ voiceOn: v }); if (v) void audio.say("lexi", "Hi! I'm LEXI. I'll talk to you on your adventure!"); }} />
          <Toggle label="Show captions" on={p.captions} onChange={(v) => set({ captions: v })} />
          <div className="space-y-2 border-t border-line/10 pt-3">
            <Slider label="Master volume" value={p.master} onChange={(v) => set({ master: v })} />
            <Slider label="Music volume" value={p.music} disabled={!p.musicOn || !pol.musicAllowed} onChange={(v) => set({ music: v })} />
            <Slider label="Voice volume" value={p.voice} disabled={!p.voiceOn || !pol.voicesAllowed} onChange={(v) => set({ voice: v })} />
            <Slider label="Effects volume" value={p.sfx} disabled={!p.sfxOn} onChange={(v) => { set({ sfx: v }); audio.sfx("tap"); }} />
          </div>
          <p className="text-xs text-vibe-lavender">Sounds are optional — every activity works with sound off.</p>
        </div>
      )}
    </div>
  );
}
