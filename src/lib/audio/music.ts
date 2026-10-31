"use client";
/**
 * Generative background music (Web Audio). Each area of PING VIBE has its own gentle theme:
 * soft pads, marimba / bell / harp / flute voices on calm scales. Nothing is downloaded, and the melody
 * varies every cycle so it never becomes an irritating loop. Kept quiet and mellow so voices stay clear.
 */

export type ThemeName = "dashboard" | "forest" | "galaxy" | "castle" | "arcade" | "speaking" | "reading" | "rewards";
type Instrument = "marimba" | "bell" | "harp" | "flute" | "piano";

interface Theme {
  bpm: number;
  root: number;            // MIDI note of the key centre
  scale: number[];         // semitone steps used by the melody
  chords: number[][];      // each chord = semitone offsets from root (one chord per bar)
  lead: Instrument;
  sparkle?: Instrument;    // occasional high accents
  density: number;         // 0..1 chance of a melody note per eighth
  padLevel: number;
  bright: number;          // pad filter cutoff (Hz)
}

const PENTA = [0, 2, 4, 7, 9];
export const THEMES: Record<ThemeName, Theme> = {
  dashboard: { bpm: 76, root: 60, scale: PENTA, chords: [[0, 4, 7, 11], [-3, 0, 4, 7], [-7, -3, 0, 4], [-5, -1, 2, 9]], lead: "marimba", sparkle: "bell", density: 0.42, padLevel: 0.05, bright: 900 },
  forest:    { bpm: 72, root: 67, scale: PENTA, chords: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]], lead: "flute", sparkle: "marimba", density: 0.35, padLevel: 0.05, bright: 800 },
  galaxy:    { bpm: 66, root: 62, scale: [0, 2, 3, 7, 9], chords: [[0, 3, 7, 14], [-4, 0, 3, 7], [-9, -5, 0, 4], [-2, 2, 5, 9]], lead: "bell", sparkle: "bell", density: 0.3, padLevel: 0.065, bright: 1100 },
  castle:    { bpm: 70, root: 65, scale: [0, 2, 4, 6, 7, 9, 11], chords: [[0, 4, 7], [-5, -1, 2, 7], [-3, 0, 4, 9], [-7, -3, 0, 5]], lead: "harp", sparkle: "bell", density: 0.5, padLevel: 0.05, bright: 850 },
  arcade:    { bpm: 96, root: 69, scale: PENTA, chords: [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]], lead: "marimba", sparkle: "harp", density: 0.55, padLevel: 0.035, bright: 1300 },
  speaking:  { bpm: 84, root: 58, scale: PENTA, chords: [[0, 4, 7, 11], [5, 9, 12], [-3, 0, 4, 7], [7, 11, 14]], lead: "piano", sparkle: "bell", density: 0.38, padLevel: 0.045, bright: 1000 },
  reading:   { bpm: 62, root: 64, scale: PENTA, chords: [[0, 4, 7, 11], [-3, 0, 4, 9], [-7, -3, 0, 4], [-5, -1, 2, 7]], lead: "piano", sparkle: "bell", density: 0.25, padLevel: 0.06, bright: 750 },
  rewards:   { bpm: 92, root: 72, scale: PENTA, chords: [[0, 4, 7], [-7, -3, 0, 5], [-5, -1, 2, 7], [0, 4, 7, 12]], lead: "bell", sparkle: "marimba", density: 0.5, padLevel: 0.04, bright: 1400 },
};

/** Which theme plays on which page. */
export function themeForPath(path: string): ThemeName {
  if (/^\/world\/(rewards|museum|collection|certificate|avatar|pets)/.test(path)) return "rewards";
  if (/^\/world\/(quest|notebook|revision|map\/vocabulary-forest|companion)/.test(path)) return "forest";
  if (/^\/world\/(grammar|map\/grammar-galaxy)/.test(path)) return "galaxy";
  if (/^\/world\/(writing|story-builder|map\/storytelling-castle)/.test(path)) return "castle";
  if (/^\/world\/(arcade|challenge|boss|map\/word-wizards-arena)/.test(path)) return "arcade";
  if (/^\/world\/(speaking|listening)/.test(path)) return "speaking";
  if (/^\/world\/(reading|map\/reading-ocean)/.test(path)) return "reading";
  return "dashboard";
}

export const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Small deterministic random generator so each cycle is varied but reproducible. */
function rng(seed: number) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function playNote(ctx: AudioContext, out: AudioNode, inst: Instrument, hz: number, t: number, vel = 1) {
  const g = ctx.createGain(); g.connect(out);
  const osc = (type: OscillatorType, f: number, level: number, decay: number, attack = 0.005) => {
    const o = ctx.createOscillator(); const og = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(level * vel, t + attack); og.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    o.connect(og).connect(g); o.start(t); o.stop(t + decay + 0.05);
    return o;
  };
  switch (inst) {
    case "marimba": osc("sine", hz, 0.16, 0.7); osc("sine", hz * 4, 0.025, 0.12); break;
    case "bell": osc("sine", hz, 0.07, 2.2); osc("sine", hz * 2.76, 0.025, 1.2); osc("sine", hz * 5.4, 0.008, 0.6); break;
    case "harp": osc("triangle", hz, 0.11, 1.4); osc("sine", hz * 2, 0.03, 0.6); break;
    case "piano": osc("triangle", hz, 0.09, 1.6, 0.01); osc("sine", hz * 2, 0.035, 0.9); osc("sine", hz * 3, 0.01, 0.4); break;
    case "flute": {
      const o = osc("sine", hz, 0.08, 1.1, 0.12);
      const lfo = ctx.createOscillator(); const lg = ctx.createGain(); lfo.frequency.value = 5; lg.gain.value = hz * 0.006;
      lfo.connect(lg).connect(o.frequency); lfo.start(t); lfo.stop(t + 1.2);
      break;
    }
  }
}

function pad(ctx: AudioContext, out: AudioNode, notes: number[], t: number, dur: number, level: number, bright: number) {
  const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = bright; f.Q.value = 0.3;
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(level, t + dur * 0.35); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.8);
  f.connect(g).connect(out);
  for (const n of notes) for (const det of [-6, 6]) {
    const o = ctx.createOscillator(); o.type = "triangle"; o.frequency.value = midiHz(n); o.detune.value = det;
    o.connect(f); o.start(t); o.stop(t + dur + 1);
  }
}

/** Plays one theme until stopped. Uses a look-ahead scheduler so timing stays smooth. */
export class ThemePlayer {
  private timer: ReturnType<typeof setInterval> | null = null;
  private next = 0; private step = 0; readonly out: GainNode;
  constructor(private ctx: AudioContext, dest: AudioNode, readonly name: ThemeName) {
    this.out = ctx.createGain(); this.out.gain.value = 0.0001; this.out.connect(dest);
  }
  start(fade = 2) {
    const th = THEMES[this.name]; const eighth = 60 / th.bpm / 2;
    this.next = this.ctx.currentTime + 0.1;
    this.out.gain.cancelScheduledValues(this.ctx.currentTime);
    this.out.gain.setTargetAtTime(1, this.ctx.currentTime, fade / 3);
    let rand = rng(1);
    let prev = 2;
    const tick = () => {
      while (this.next < this.ctx.currentTime + 0.4) {
        const t = this.next; const s = this.step; const bar = Math.floor(s / 8); const inBar = s % 8;
        const chord = th.chords[bar % th.chords.length];
        if (inBar === 0) {
          if (bar % (th.chords.length * 2) === 0) rand = rng(7 + Math.floor(bar / (th.chords.length * 2)) % 5); // new variation each cycle
          pad(this.ctx, this.out, chord.map((c) => th.root - 12 + c), t, eighth * 8, th.padLevel, th.bright);
          playNote(this.ctx, this.out, th.lead === "flute" ? "harp" : "marimba", midiHz(th.root - 24 + chord[0]), t, 0.45); // soft bass
        }
        if (rand() < th.density && inBar !== 7) {
          // gentle stepwise melody on the theme's scale, leaning on chord tones
          prev = Math.max(0, Math.min(th.scale.length * 2 - 1, prev + Math.round((rand() - 0.5) * 3)));
          const oct = Math.floor(prev / th.scale.length); const deg = th.scale[prev % th.scale.length];
          playNote(this.ctx, this.out, th.lead, midiHz(th.root + deg + 12 * oct), t, 0.55 + rand() * 0.35);
        }
        if (th.sparkle && inBar === 4 && rand() < 0.3) playNote(this.ctx, this.out, th.sparkle, midiHz(th.root + 24 + th.scale[Math.floor(rand() * th.scale.length)]), t, 0.35);
        this.next += eighth; this.step++;
      }
    };
    tick(); this.timer = setInterval(tick, 120);
  }
  stop(fade = 1.5) {
    if (this.timer) clearInterval(this.timer); this.timer = null;
    const now = this.ctx.currentTime;
    this.out.gain.cancelScheduledValues(now); this.out.gain.setTargetAtTime(0.0001, now, fade / 3);
    setTimeout(() => { try { this.out.disconnect(); } catch { /* already gone */ } }, (fade + 2.5) * 1000);
  }
}
