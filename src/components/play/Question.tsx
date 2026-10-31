"use client";
import { useEffect, useMemo, useState } from "react";
import { speak } from "@/lib/client";
import { cheer } from "@/lib/audio/lines";

export interface Q {
  type: string; prompt: string; options?: string[]; speak?: string; emoji?: string; sentence?: string; tokens?: string[]; passage?: string; round?: string | number;
}

/** Renders any PING VIBE question type and reports the child's answer as a string. */
export function Question({ q, onAnswer, disabled, feedback, big = false }: { q: Q; onAnswer: (a: string) => void; disabled?: boolean; feedback?: { correct: boolean; answer: string } | null; big?: boolean }) {
  const [typed, setTyped] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [choice, setChoice] = useState<string | null>(null);
  const pool = useMemo(() => q.tokens ?? [], [q]);
  // Reset answer state while rendering the new question (not in an effect), so nothing the
  // child types after the question appears can be wiped by a late reset.
  const [shown, setShown] = useState(q);
  if (shown !== q) { setShown(q); setTyped(""); setPicked([]); setChoice(null); }
  useEffect(() => { if (q.speak && (q.type === "spelling" || q.type.startsWith("listen"))) speak(q.speak); }, [q]);
  // Answer feedback sound (and the occasional character cheer) whenever a result arrives.
  useEffect(() => { if (feedback) cheer(feedback.correct); }, [feedback]);

  const optionClass = (o: string) => {
    const base = `w-full rounded-2xl border px-4 py-4 text-left font-semibold transition ${big ? "text-xl" : "text-base"} `;
    if (feedback) {
      if (o === feedback.answer || (q.type === "fill_blank" && o.toLowerCase() === feedback.answer.toLowerCase())) return base + "border-vibe-mint bg-vibe-mint/20";
      if (o === choice && !feedback.correct) return base + "border-vibe-coral bg-vibe-coral/20";
      return base + "border-white/10 bg-white/5 opacity-60";
    }
    return base + (choice === o ? "border-vibe-aqua bg-vibe-aqua/20" : "border-white/10 bg-white/5 hover:bg-white/10 active:scale-[0.99]");
  };

  return (
    <div>
      {q.passage && <details className="glass mb-4 p-4 text-sm" open><summary className="cursor-pointer font-bold">📖 Read the story</summary><p className="mt-2 leading-relaxed text-vibe-lavender">{q.passage}</p></details>}
      <p className={`font-display font-bold ${big ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}>{q.prompt}</p>
      {q.emoji && <div className="my-4 text-center text-7xl sm:text-8xl" aria-hidden>{q.emoji}</div>}
      {q.sentence && <p className="glass my-4 p-4 text-lg font-semibold sm:text-xl">{q.sentence}</p>}
      {q.speak && <button type="button" onClick={() => speak(q.speak!)} className="btn-ghost btn-sm my-3">🔊 {q.type.startsWith("listen") || q.type === "spelling" ? "Play again" : "Hear the word"}</button>}

      {q.options && (
        <div className={`mt-4 grid gap-3 ${q.options.every((o) => o.length < 18) ? "sm:grid-cols-2" : ""}`}>
          {q.options.map((o) => (
            <button key={o} type="button" disabled={disabled || !!feedback} onClick={() => { setChoice(o); onAnswer(o); }} className={optionClass(o)}>{o}</button>
          ))}
        </div>
      )}

      {(q.type === "spelling" || q.type === "mystery") && (
        <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (typed.trim()) onAnswer(typed.trim()); }}>
          <input className="input text-center text-2xl font-bold tracking-widest" value={typed} onChange={(e) => setTyped(e.target.value)} autoCapitalize="none" autoComplete="off" spellCheck={false} disabled={disabled || !!feedback} placeholder="type here" aria-label="Your answer" />
          <button className="btn-primary" disabled={disabled || !!feedback || !typed.trim()}>Check</button>
        </form>
      )}

      {q.type === "order" && (
        <div className="mt-4">
          <div className="glass min-h-16 p-3 text-lg font-semibold" aria-live="polite">{picked.length ? picked.join(" ") : <span className="text-vibe-lavender/60">Tap the words in order…</span>}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {pool.map((t, i) => {
              const used = picked.filter((p) => p === t).length >= pool.slice(0, i + 1).filter((p) => p === t).length;
              return <button key={i} type="button" disabled={used || !!feedback} onClick={() => setPicked([...picked, t])} className={`rounded-full border border-white/15 px-4 py-2 font-semibold ${used ? "opacity-30" : "bg-white/10 hover:bg-white/20"}`}>{t}</button>;
            })}
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" className="btn-ghost btn-sm" onClick={() => setPicked(picked.slice(0, -1))} disabled={!picked.length || !!feedback}>↩ Undo</button>
            <button type="button" className="btn-primary btn-sm" onClick={() => onAnswer(picked.join(" "))} disabled={picked.length !== pool.length || !!feedback}>Check sentence</button>
          </div>
        </div>
      )}

      {feedback && (
        <p role="status" className={`mt-4 rounded-2xl p-3 font-semibold ${feedback.correct ? "bg-vibe-mint/15 text-vibe-mint" : "bg-vibe-coral/15 text-vibe-coral"}`}>
          {feedback.correct ? "✨ Correct! Brilliant!" : <>Nearly! The answer is <b>{feedback.answer}</b>. Every try makes your brain stronger!</>}
        </p>
      )}
    </div>
  );
}
