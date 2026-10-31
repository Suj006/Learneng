"use client";

/** Child's audio preferences. Saved on the device and synced to the child's profile. */
export interface AudioPrefs {
  master: number; music: number; sfx: number; voice: number; // 0..1
  musicOn: boolean; sfxOn: boolean; voiceOn: boolean; captions: boolean;
}
/** Parent policy: a parent can switch music or character voices off for their children. */
export interface AudioPolicy { musicAllowed: boolean; voicesAllowed: boolean }

export const DEFAULT_PREFS: AudioPrefs = { master: 0.8, music: 0.35, sfx: 0.6, voice: 0.9, musicOn: true, sfxOn: true, voiceOn: true, captions: true };
const KEY = "pv-audio-v1";

const clamp = (n: unknown, d: number) => (typeof n === "number" && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : d);
const bool = (b: unknown, d: boolean) => (typeof b === "boolean" ? b : d);

export function sanitizePrefs(p: Partial<AudioPrefs> | null | undefined): AudioPrefs {
  const d = DEFAULT_PREFS; const x = p ?? {};
  return { master: clamp(x.master, d.master), music: clamp(x.music, d.music), sfx: clamp(x.sfx, d.sfx), voice: clamp(x.voice, d.voice),
    musicOn: bool(x.musicOn, d.musicOn), sfxOn: bool(x.sfxOn, d.sfxOn), voiceOn: bool(x.voiceOn, d.voiceOn), captions: bool(x.captions, d.captions) };
}

export function loadLocalPrefs(): Partial<AudioPrefs> | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.localStorage.getItem(KEY) ?? "null"); } catch { return null; }
}
export function saveLocalPrefs(p: AudioPrefs) {
  try { window.localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* private mode */ }
}
