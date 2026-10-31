"use client";
import { audio, type Speaker } from "@/lib/audio/manager";

/** JSON fetch helper with friendly error messages. */
export async function api<T = any>(url: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(url, {
    method: init?.method ?? (init?.body !== undefined ? "POST" : "GET"),
    headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  let data: any = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    const err = new Error(data?.error ?? "Oops! Something went wrong. Please try again.") as Error & { status?: number; data?: any };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

/**
 * Read text aloud (words, examples, stories). Goes through the central AudioManager so music is ducked, lines
 * never overlap, and the child's voice settings are respected. `who` picks a character voice.
 */
export function speak(text: string, opts: { rate?: number; who?: Speaker; server?: boolean } = {}) {
  if (typeof window === "undefined") return false;
  void audio.say(opts.who ?? "narrator", text, { rate: opts.rate ?? 0.9, caption: false, server: opts.server ?? false });
  return "speechSynthesis" in window;
}

export const ttsSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

type Rec = { start(): void; stop(): void; abort(): void; onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null; lang: string; interimResults: boolean; maxAlternatives: number };
export function speechRecognitionCtor(): (new () => Rec) | null {
  if (typeof window === "undefined") return null;
  return ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null) as any;
}

/** Listens once and resolves with the transcript. Audio is processed by the browser; nothing is uploaded by PING VIBE. */
export function listenOnce(): Promise<string> {
  const Ctor = speechRecognitionCtor();
  if (!Ctor) return Promise.reject(new Error("unsupported"));
  return new Promise((resolve, reject) => {
    const r = new Ctor();
    r.lang = "en-IN";
    r.interimResults = false;
    r.maxAlternatives = 3;
    let done = false;
    r.onresult = (e: any) => { done = true; resolve(String(e.results[0][0].transcript ?? "")); };
    r.onerror = (e: any) => { done = true; reject(new Error(e.error ?? "error")); };
    r.onend = () => { if (!done) reject(new Error("no-speech")); };
    r.start();
    setTimeout(() => { try { r.stop(); } catch {} }, 8000);
  });
}

/** Word-level similarity (0–100) between target text and what was heard. */
export function speechAccuracy(target: string, heard: string) {
  const t = target.toLowerCase().match(/[a-z']+/g) ?? [];
  const h = new Set(heard.toLowerCase().match(/[a-z']+/g) ?? []);
  if (!t.length) return 0;
  return Math.round((t.filter((w) => h.has(w)).length / t.length) * 100);
}

export function startTimer() {
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  return () => Math.round(((typeof performance !== "undefined" ? performance.now() : Date.now()) - start) / 1000);
}
