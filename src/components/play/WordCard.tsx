"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { listenOnce, speak, speechAccuracy, speechRecognitionCtor } from "@/lib/client";
import { Character } from "@/components/Character";
import { useMounted } from "@/lib/useMounted";

export interface WordData { id: string; word: string; phonetic: string; part_of_speech: string; meaning: string; explanation: string; example: string; usage: string; synonyms: string[]; antonyms: string[]; emoji: string; difficulty: number; band: number }

export function WordCard({ w, index, total }: { w: WordData; index?: number; total?: number }) {
  const [heard, setHeard] = useState<{ text: string; score: number } | null>(null);
  const [listening, setListening] = useState(false);
  const mounted = useMounted();
  const canListen = mounted && !!speechRecognitionCtor();
  async function repeat() {
    setListening(true); setHeard(null);
    try { const t = await listenOnce(); setHeard({ text: t, score: speechAccuracy(w.word, t) }); }
    catch { setHeard({ text: "", score: -1 }); } finally { setListening(false); }
  }
  return (
    <motion.article key={w.id} initial={{ opacity: 0, x: 40, rotate: 2 }} animate={{ opacity: 1, x: 0, rotate: 0 }} className="card relative overflow-hidden p-6 sm:p-8">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-vibe-aqua/20 blur-2xl" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        {index !== undefined && <span className="chip">Word {index + 1} of {total}</span>}
        <span className="chip text-vibe-sun">{"★".repeat(w.difficulty)}{"☆".repeat(5 - w.difficulty)} difficulty</span>
      </div>
      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <motion.div className="text-8xl sm:text-9xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} aria-hidden>{w.emoji}</motion.div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-display text-5xl font-bold uppercase tracking-wide sm:text-6xl">{w.word}</h2>
          <p className="mt-1 text-lg text-vibe-aqua">{w.phonetic} · <i>{w.part_of_speech}</i></p>
          <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button className="btn-primary btn-sm" onClick={() => speak(w.word, { rate: 0.75 })}>🔊 Listen</button>
            <button className="btn-ghost btn-sm" onClick={() => speak(w.example)}>🔊 Example</button>
            {canListen && <button className="btn-ghost btn-sm" onClick={repeat} disabled={listening}>{listening ? "🎙️ Listening…" : "🎙️ Repeat the word"}</button>}
          </div>
          {heard && <p className={`mt-2 text-sm font-semibold ${heard.score >= 80 ? "text-vibe-mint" : "text-vibe-sun"}`}>{heard.score < 0 ? "I couldn't hear you — try again in a quiet place!" : heard.score >= 80 ? `SPEAKY: Perfect! I heard “${heard.text}” 🎉` : `SPEAKY: I heard “${heard.text}”. Let's try once more — slowly: ${w.phonetic}`}</p>}
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="glass p-4"><div className="text-xs font-bold uppercase text-vibe-lavender">Meaning</div><p className="mt-1 text-lg font-semibold">{w.meaning}</p><p className="mt-2 text-sm text-vibe-lavender">{w.explanation}</p></div>
        <div className="glass p-4"><div className="text-xs font-bold uppercase text-vibe-lavender">Example</div><p className="mt-1 text-lg font-semibold">“{w.example}”</p>{w.usage && <p className="mt-2 text-sm text-vibe-lavender">🌍 Real life: {w.usage}</p>}</div>
      </div>
      {(w.synonyms.length > 0 || w.antonyms.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {w.synonyms.length > 0 && <span className="chip">≈ Similar: {w.synonyms.join(", ")}</span>}
          {w.antonyms.length > 0 && <span className="chip">≠ Opposite: {w.antonyms.join(", ")}</span>}
        </div>
      )}
      <div className="pointer-events-none absolute -bottom-3 -right-3 hidden sm:block"><Character name="lexi" mood="explaining" size={96} still /></div>
    </motion.article>
  );
}
