"use client";
/** Gentle synthesized sound effects: soft chimes and sparkles, never harsh arcade buzzers. */
import { midiHz, playNote } from "./music";

export type Sfx = "tap" | "select" | "correct" | "incorrect" | "xp" | "coin" | "levelup" | "badge" | "unlock" | "treasure" | "complete" | "celebrate";

export function playSfx(ctx: AudioContext, out: AudioNode, name: Sfx) {
  const t = ctx.currentTime + 0.01;
  const seq = (notes: number[], step: number, inst: Parameters<typeof playNote>[2] = "bell", vel = 0.9, at = 0) =>
    notes.forEach((n, i) => playNote(ctx, out, inst, midiHz(n), t + at + i * step, vel));
  const sweep = (from: number, to: number, dur: number, level = 0.05, type: OscillatorType = "sine") => {
    const o = ctx.createOscillator(); const g = ctx.createGain(); o.type = type;
    o.frequency.setValueAtTime(from, t); o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(level, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.1);
    o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.15);
  };
  switch (name) {
    case "tap": sweep(900, 700, 0.05, 0.035); break;
    case "select": seq([79, 86], 0.06, "marimba", 0.6); break;
    case "correct": seq([84, 88, 91], 0.08, "bell", 1.1); break;
    case "incorrect": seq([64, 60], 0.14, "marimba", 0.5); break; // soft "try again", no buzzer
    case "xp": sweep(600, 1500, 0.28, 0.04); seq([96, 100], 0.1, "bell", 0.6); break;
    case "coin": seq([83, 88], 0.07, "harp", 0.9); break;
    case "levelup": seq([60, 64, 67], 0, "piano", 0.6); seq([72, 76, 79, 84, 88, 91, 96], 0.09, "bell", 1, 0.05); break;
    case "badge": seq([79, 83, 86, 91], 0.12, "bell", 1); break;
    case "unlock": sweep(400, 1600, 0.6, 0.035, "triangle"); seq([84, 91, 96], 0.15, "bell", 0.9); break;
    case "treasure": seq([96, 93, 91, 88, 84, 88, 91, 96], 0.05, "bell", 0.7); break;
    case "complete": seq([72, 76, 79, 84], 0.11, "marimba", 1); seq([84, 88], 0.3, "bell", 0.8, 0.45); break;
    case "celebrate": seq([72, 76, 79], 0.1, "marimba", 1); seq([84, 88, 91, 96], 0.08, "bell", 0.9, 0.3); sweep(800, 2000, 0.5, 0.025); break;
  }
}
