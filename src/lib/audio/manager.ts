"use client";
/**
 * AudioManager — the single place that controls sound in PING VIBE.
 *
 *  Layer 1  background music   (MusicManager: one theme at a time, crossfaded)
 *  Layer 2  sound effects      (gentle synthesized chimes)
 *  Layer 3  character voices   (per-character voices; music is ducked while a character speaks)
 *
 * Each layer has its own on/off and volume under a master volume. Nothing plays until the child's first tap
 * (browser autoplay rules), everything pauses when the page is hidden, and only one music track and one voice
 * line can play at once. Audio is always optional: every spoken line is also shown as a caption.
 */
import { DEFAULT_PREFS, sanitizePrefs, saveLocalPrefs, type AudioPolicy, type AudioPrefs } from "./prefs";
import { ThemePlayer, type ThemeName } from "./music";
import { playSfx, type Sfx } from "./sfx";
import { PROFILES, shapeLine, voiceFor, type Speaker } from "./voices";

export interface Caption { who: Speaker; text: string; id: number }
type Listener = () => void;

class AudioManager {
  prefs: AudioPrefs = DEFAULT_PREFS;
  policy: AudioPolicy = { musicAllowed: true, voicesAllowed: true };
  unlocked = false;
  caption: Caption | null = null;
  serverTts = false;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private duck: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private player: ThemePlayer | null = null;
  private wantedTheme: ThemeName | null = null;
  private listeners = new Set<Listener>();
  private lastSfx = new Map<string, number>();
  private speaking = 0;
  private audioEl: HTMLAudioElement | null = null;
  private ttsCache = new Map<string, string>();
  private captionTimer: ReturnType<typeof setTimeout> | null = null;
  private captionSeq = 0;
  onPrefsChange: ((p: AudioPrefs) => void) | null = null;
  private pending: { key: string; who: Speaker; text: string; server?: boolean } | null = null;

  subscribe(fn: Listener) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private emit() { for (const l of this.listeners) l(); }

  get musicActive() { return this.prefs.musicOn && this.policy.musicAllowed; }
  get voiceActive() { return this.prefs.voiceOn && this.policy.voicesAllowed; }

  configure(prefs: Partial<AudioPrefs> | null, policy: AudioPolicy, serverTts: boolean) {
    this.prefs = sanitizePrefs(prefs); this.policy = policy; this.serverTts = serverTts;
    this.applyVolumes(); this.emit();
  }

  setPrefs(patch: Partial<AudioPrefs>) {
    this.prefs = sanitizePrefs({ ...this.prefs, ...patch });
    saveLocalPrefs(this.prefs);
    this.applyVolumes();
    if (!this.voiceActive) this.stopVoice();
    if (this.musicActive) this.ensureMusic(); else this.stopMusic();
    this.onPrefsChange?.(this.prefs);
    this.emit();
  }

  /** Called from the first user gesture. Safe to call many times. */
  unlock() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
      this.duck = this.ctx.createGain(); this.duck.connect(this.master);
      this.musicBus = this.ctx.createGain(); this.musicBus.connect(this.duck);
      this.sfxBus = this.ctx.createGain(); this.sfxBus.connect(this.master);
      this.applyVolumes();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    if (!this.unlocked) {
      this.unlocked = true; this.ensureMusic(); this.emit();
      const p = this.pending; this.pending = null;
      if (p) setTimeout(() => this.greetOnce(p.key, p.who, p.text, { server: p.server }), 400);
    }
  }

  private applyVolumes() {
    if (!this.ctx || !this.master || !this.musicBus || !this.sfxBus) return;
    const now = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(this.prefs.master, now, 0.05);
    this.musicBus.gain.setTargetAtTime(this.musicActive ? this.prefs.music : 0, now, 0.1);
    this.sfxBus.gain.setTargetAtTime(this.prefs.sfxOn ? this.prefs.sfx : 0, now, 0.05);
    if (this.audioEl) this.audioEl.volume = this.prefs.master * this.prefs.voice;
  }

  // ── Layer 1: music ──────────────────────────────────────────────
  setTheme(name: ThemeName | null) {
    this.wantedTheme = name;
    if (!name) { this.stopMusic(); return; }
    this.ensureMusic();
  }
  private ensureMusic() {
    if (!this.ctx || !this.musicBus || !this.unlocked || !this.musicActive || !this.wantedTheme) return;
    if (this.ctx.state === "suspended") return;
    if (this.player?.name === this.wantedTheme) return;
    this.player?.stop(1.5);                      // crossfade: old theme fades out…
    this.player = new ThemePlayer(this.ctx, this.musicBus, this.wantedTheme);
    this.player.start(2.5);                      // …while the new one fades in
  }
  private stopMusic() { this.player?.stop(1); this.player = null; }

  // ── Layer 2: effects ────────────────────────────────────────────
  sfx(name: Sfx) {
    if (!this.prefs.sfxOn || !this.ctx || !this.sfxBus || !this.unlocked) return;
    const now = performance.now();
    if (now - (this.lastSfx.get(name) ?? 0) < (name === "tap" ? 60 : 180)) return; // no machine-gun repeats
    this.lastSfx.set(name, now);
    playSfx(this.ctx, this.sfxBus, name);
  }

  // ── Layer 3: voices ─────────────────────────────────────────────
  private duckMusic(on: boolean) {
    if (!this.ctx || !this.duck) return;
    this.duck.gain.setTargetAtTime(on ? 0.22 : 1, this.ctx.currentTime, on ? 0.12 : 0.6);
  }
  private showCaption(who: Speaker, text: string) {
    if (!this.prefs.captions) return;
    if (this.captionTimer) clearTimeout(this.captionTimer);
    this.caption = { who, text, id: ++this.captionSeq }; this.emit();
    this.captionTimer = setTimeout(() => { this.caption = null; this.emit(); }, Math.min(12000, 2500 + text.length * 60));
  }
  clearCaption() { if (this.captionTimer) clearTimeout(this.captionTimer); this.caption = null; this.emit(); }

  stopVoice() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    if (this.audioEl) { this.audioEl.pause(); this.audioEl = null; }
    this.speaking = 0; this.duckMusic(false);
  }

  /**
   * Speak a line as a character. Interrupts any line in progress (never overlaps).
   * `server`: allow the server neural voice (only for PING VIBE's own lines and content, never children's text).
   * `caption`: show the words on screen (important instructions and character lines).
   */
  async say(who: Speaker, text: string, opts: { rate?: number; server?: boolean; caption?: boolean } = {}): Promise<boolean> {
    if (!text) return false;
    if (opts.caption !== false) this.showCaption(who, text);
    if (!this.voiceActive) return false;
    this.unlock();
    this.stopVoice();
    const token = ++this.speaking;
    this.duckMusic(true);
    const end = () => { if (this.speaking === token) { this.speaking = 0; this.duckMusic(false); } };
    if (opts.server && this.serverTts) {
      try { await this.playServer(who, text, end); return true; } catch { /* fall back to the browser voice */ }
      if (this.speaking !== token) return false;
    }
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { end(); return false; }
    const p = PROFILES[who];
    const u = new SpeechSynthesisUtterance(shapeLine(text));
    const v = await voiceFor(who);
    if (this.speaking !== token) return false; // a newer line started while voices loaded
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-IN";
    u.pitch = p.pitch; u.rate = (opts.rate ?? 1) * p.rate; u.volume = this.prefs.master * this.prefs.voice;
    u.onend = end; u.onerror = end;
    window.speechSynthesis.speak(u);
    return true;
  }

  private async playServer(who: Speaker, text: string, end: () => void) {
    const key = `${who}|${text}`;
    let url = this.ttsCache.get(key);
    if (!url) {
      const res = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ who, text }) });
      if (!res.ok) throw new Error("tts unavailable");
      url = URL.createObjectURL(await res.blob());
      if (this.ttsCache.size > 60) { const [k, u] = this.ttsCache.entries().next().value as [string, string]; URL.revokeObjectURL(u); this.ttsCache.delete(k); }
      this.ttsCache.set(key, url);
    }
    const a = new Audio(url); this.audioEl = a; a.volume = this.prefs.master * this.prefs.voice;
    a.onended = end; a.onerror = end;
    await a.play();
  }

  /** Greets at most once per day per key, so children don't hear the same welcome on every visit. */
  greetOnce(key: string, who: Speaker, text: string, opts: { server?: boolean } = {}) {
    if (!this.unlocked) { this.pending = { key, who, text, server: opts.server }; return; } // played right after the first tap
    try {
      const k = `pv-greet-${key}`; const today = new Date().toDateString();
      if (window.localStorage.getItem(k) === today) return;
      window.localStorage.setItem(k, today);
    } catch { /* ignore */ }
    void this.say(who, text, { server: opts.server ?? true });
  }

  /** Pause everything (page hidden / leaving the world) and resume afterwards. */
  suspend() { this.stopVoice(); if (this.ctx && this.ctx.state === "running") void this.ctx.suspend(); }
  resume() { if (this.ctx && this.unlocked && this.ctx.state === "suspended") void this.ctx.resume().then(() => this.ensureMusic()); }
  shutdown() { this.stopVoice(); this.stopMusic(); this.wantedTheme = null; this.pending = null; this.clearCaption(); }
  /** Leaving a page: drop a greeting that never got to play, so it isn't spoken on the wrong page. */
  dropPending(key?: string) { if (!key || this.pending?.key === key) this.pending = null; }
}

/** One instance per page load — never duplicated across components. */
export const audio: AudioManager = (globalThis as any).__pvAudio ?? ((globalThis as any).__pvAudio = new AudioManager());
export type { Sfx, ThemeName, Speaker };
