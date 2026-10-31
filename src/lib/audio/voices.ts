"use client";
/**
 * Character voices. Each character has a fixed personality (pitch, speed, preferred voices). The browser's best
 * natural/neural voice is chosen once per character and remembered, so a character never changes voice between
 * sessions. Optional server neural TTS (/api/tts) is used for character lines when configured.
 */
export type Speaker = "lexi" | "grammy" | "speaky" | "story" | "max" | "narrator";

interface Profile { pitch: number; rate: number; prefer: RegExp; avoid?: RegExp; style: string }
/**
 * Browser voices can't act, so personality comes from pitch, pace and voice choice.
 * Preferred names cover Edge "Natural" voices, Google voices and common OS voices.
 */
export const PROFILES: Record<Speaker, Profile> = {
  lexi:     { pitch: 1.3,  rate: 1.0,  prefer: /neerja|aria|jenny|ana\b|samantha|uk english female|zira|heera|female/i, style: "curious and cheerful" },
  grammy:   { pitch: 1.15, rate: 0.95, prefer: /sonia|libby|emma|neerja|moira|karen|uk english female|female/i, style: "playful and magical" },
  speaky:   { pitch: 1.25, rate: 1.02, prefer: /ana\b|prabhat|guy|ryan|daniel|us english|male/i, style: "warm and lively" },
  story:    { pitch: 1.05, rate: 0.88, prefer: /neerja|natasha|libby|sonia|serena|tessa|uk english female|female/i, style: "expressive storyteller" },
  max:      { pitch: 1.2,  rate: 1.06, prefer: /prabhat|guy|davis|ryan|uk english male|daniel|ravi|male/i, avoid: /female/i, style: "energetic adventurer" },
  narrator: { pitch: 1.05, rate: 1.0,  prefer: /neerja|aria|jenny|sonia|libby|uk english female|heera/i, style: "clear" },
};

const STORE = "pv-voices-v1";
let cache: Record<string, string> = {};
try { cache = JSON.parse(typeof window !== "undefined" ? window.localStorage.getItem(STORE) ?? "{}" : "{}"); } catch { cache = {}; }

/** Higher is better: natural/neural voices first, then Google/online voices, English (India) favoured. */
function score(v: SpeechSynthesisVoice, p: Profile) {
  let s = 0;
  if (!/^en/i.test(v.lang)) return -100;
  if (/natural|neural|online/i.test(v.name)) s += 20;
  if (/google/i.test(v.name)) s += 10;
  if (/en[-_]IN/i.test(v.lang)) s += 6; else if (/en[-_](GB|US|AU)/i.test(v.lang)) s += 3;
  if (p.prefer.test(v.name)) s += 8;
  if (p.avoid?.test(v.name)) s -= 8;
  if (/desktop|espeak|compact/i.test(v.name)) s -= 6;
  return s;
}

export function voicesReady(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve([]);
  const now = window.speechSynthesis.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    setTimeout(done, 1500); // some browsers never fire the event
  });
}

export async function voiceFor(who: Speaker): Promise<SpeechSynthesisVoice | null> {
  const voices = await voicesReady();
  if (!voices.length) return null;
  const saved = voices.find((v) => v.voiceURI === cache[who]);
  if (saved) return saved;
  const p = PROFILES[who];
  // Different characters should not share a voice when the device has several good ones.
  const taken = new Set(Object.entries(cache).filter(([k]) => k !== who && k !== "narrator").map(([, v]) => v));
  const ranked = [...voices].sort((a, b) => score(b, p) - (taken.has(b.voiceURI) ? 5 : 0) - (score(a, p) - (taken.has(a.voiceURI) ? 5 : 0)));
  const pick = ranked[0] ?? null;
  if (pick && score(pick, p) > -100) {
    cache[who] = pick.voiceURI;
    try { window.localStorage.setItem(STORE, JSON.stringify(cache)); } catch { /* ignore */ }
  }
  return pick;
}

/** Makes plain lines sound livelier with browser TTS: a natural pause after greetings and exclamations. */
export function shapeLine(text: string) {
  return text.replace(/\s*(—|–)\s*/g, ", ").replace(/([!?])\s+/g, "$1  ").trim();
}
