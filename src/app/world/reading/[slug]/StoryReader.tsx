"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio/manager";
import { motion } from "framer-motion";
import { api, startTimer } from "@/lib/client";
import { Celebration, CharacterSays, ErrorNote, Progress, type AwardLike } from "@/components/ui";

const SIZES = ["text-lg sm:text-xl", "text-xl sm:text-2xl", "text-2xl sm:text-3xl"];
const sentencesOf = (t: string) => t.match(/[^.!?]+[.!?]+["”']?\s*|[^.!?]+$/g)?.map((x) => x.trim()).filter(Boolean) ?? [t];

export function StoryReader({ slug, pages, glossary, questions, known, level }: { slug: string; pages: { scene: string; text: string }[]; glossary: { word: string; meaning: string }[]; questions: { q: string; options: string[] }[]; known: { word: string; meaning: string }[]; level?: { label: string; note: string } }) {
  const [page, setPage] = useState(0);
  const [quiz, setQuiz] = useState(false);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [tip, setTip] = useState<string | null>(null);
  const [res, setRes] = useState<{ score: number; correct: number; total: number; answers: number[]; award: AwardLike } | null>(null);
  const [cele, setCele] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [timer] = useState(() => startTimer());
  const [size, setSize] = useState(1);
  const [reading, setReading] = useState<number | null>(null); // sentence being read aloud (highlighted)
  const stopRef = useRef(false);
  useEffect(() => { try { const v = Number(localStorage.getItem("pv-text-size")); if (v >= 0 && v <= 2) setSize(v); } catch { /* ignore */ } }, []);
  useEffect(() => () => { stopRef.current = true; audio.stopVoice(); }, []);
  const changeSize = (d: number) => { const v = Math.max(0, Math.min(2, size + d)); setSize(v); try { localStorage.setItem("pv-text-size", String(v)); } catch { /* ignore */ } };
  const gl = new Map(glossary.map((g) => [g.word.toLowerCase(), g.meaning]));
  const kn = new Map(known.map((g) => [g.word.toLowerCase(), g.meaning]));
  const explain = (w: string, meaning: string) => { setTip(`${w}: ${meaning}`); void audio.say("story", `${w}. ${meaning}`, { caption: false, server: true }); };
  const render = (text: string) => text.split(/(\s+)/).map((tok, k) => {
    const clean = tok.toLowerCase().replace(/[^a-z']/g, "");
    if (gl.has(clean)) return <button key={k} onClick={() => explain(clean, gl.get(clean)!)} className="rounded bg-vibe-sun/25 px-1 font-bold text-vibe-sun-ink underline decoration-dotted">{tok}</button>;
    if (kn.has(clean)) return <button key={k} onClick={() => explain(clean, kn.get(clean)!)} className="rounded bg-vibe-aqua/20 px-0.5 text-vibe-aqua-ink" title="A word you've discovered! Tap for its meaning.">{tok}</button>;
    return tok;
  });
  /** Read-along: reads sentence by sentence and highlights the one being read. */
  const readFrom = (sents: string[], i: number, once = false) => {
    if (stopRef.current || i >= sents.length) { setReading(null); return; }
    setReading(i);
    void audio.say("story", sents[i], { rate: 0.95, server: true, caption: false, onEnd: () => (once ? setReading(null) : readFrom(sents, i + 1)) }).then((ok) => { if (!ok) setReading(null); });
  };
  const stopReading = () => { stopRef.current = true; audio.stopVoice(); setReading(null); };
  const go = (n: number) => { stopReading(); setPage(n); setTip(null); };

  if (res) {
    return (
      <div className="mx-auto max-w-2xl">
        <CharacterSays who="story" mood={res.score >= 70 ? "celebrating" : "encouraging"}>You answered {res.correct} of {res.total} correctly! {res.score >= 70 ? "What a reader!" : "Let's read it once more and look for clues."}</CharacterSays>
        <div className="mt-6 space-y-2">{questions.map((q, k) => <div key={k} className={`rounded-2xl p-3 ${answers[k] === res.answers[k] ? "bg-vibe-mint/10" : "bg-vibe-coral/10"}`}>{q.q} — <b>{q.options[res.answers[k]]}</b></div>)}</div>
        <div className="mt-6 flex gap-3"><Link href="/world/reading" className="btn-primary">More stories</Link><button className="btn-ghost" onClick={() => { setRes(null); setQuiz(false); setPage(0); setAnswers([]); setQi(0); }}>Read again</button></div>
        {cele && <Celebration award={res.award} who="story" title="Story complete!" onClose={() => setCele(false)} />}
      </div>
    );
  }
  if (quiz) {
    const q = questions[qi];
    return (
      <div className="mx-auto max-w-2xl"><Progress value={qi} max={questions.length} />
        <div className="card mt-6 p-6"><p className="font-display text-2xl font-bold">{q.q}</p>
          <div className="mt-4 grid gap-3">{q.options.map((o, k) => <button key={o} className="rounded-2xl border border-line/10 bg-glass/5 p-4 text-left font-semibold hover:bg-glass/10" onClick={async () => {
            const next = [...answers, k]; setAnswers(next);
            if (qi + 1 < questions.length) return setQi(qi + 1);
            try { setRes(await api(`/api/reading/${slug}`, { body: { answers: next, seconds: timer() } })); setCele(true); } catch (e) { setErr((e as Error).message); }
          }}>{o}</button>)}</div></div><ErrorNote error={err} /></div>
    );
  }
  const p = pages[page];
  const sents = sentencesOf(p.text);
  return (
    <div className="mx-auto max-w-3xl">
      <Progress value={page + 1} max={pages.length} />
      <motion.div key={page} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="card mt-6 p-6 sm:p-10">
        <div className="text-center text-7xl tracking-widest sm:text-8xl" aria-hidden>{p.scene}</div>
        <p className={`mt-6 leading-relaxed ${SIZES[size]}`} data-testid="story-text">{sents.map((t, i) => (
          <span key={i} className={`rounded transition-colors ${reading === i ? "bg-vibe-sun/30" : ""}`} data-reading={reading === i ? "1" : undefined}>
            {render(t)}{" "}
            <button type="button" className="align-middle text-sm opacity-60 hover:opacity-100" aria-label={`Replay sentence ${i + 1}`} onClick={() => { stopRef.current = false; readFrom(sents, i, true); }}>🔁</button>{" "}
          </span>
        ))}</p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {reading === null
            ? <button className="btn-ghost btn-sm" onClick={() => { stopRef.current = false; readFrom(sents, 0); }}>🔊 Read it to me</button>
            : <button className="btn-ghost btn-sm" onClick={stopReading}>⏹ Stop</button>}
          <span className="ml-auto flex items-center gap-1" role="group" aria-label="Text size">
            <button className="btn-ghost btn-sm" aria-label="Smaller text" disabled={size === 0} onClick={() => changeSize(-1)}>A−</button>
            <button className="btn-ghost btn-sm" aria-label="Bigger text" disabled={size === 2} onClick={() => changeSize(1)}>A+</button>
          </span>
        </div>
        {tip && <p className="mt-3 rounded-2xl bg-vibe-sun/15 p-3 text-sm">📖 {tip}</p>}
      </motion.div>
      <p className="mt-2 text-xs text-vibe-lavender"><span className="text-vibe-sun-ink">Yellow</span> = tap for meaning · <span className="text-vibe-aqua-ink">Blue</span> = a word you've discovered (tap it too) · 🔁 = hear one sentence again{level ? ` · Reading level: ${level.label} — ${level.note}` : ""}</p>
      <div className="mt-4 flex justify-between">
        <button className="btn-ghost" disabled={page === 0} onClick={() => go(page - 1)}>← Back</button>
        {page + 1 < pages.length ? <button className="btn-primary" onClick={() => go(page + 1)}>Next page →</button> : <button className="btn-sun" onClick={() => { stopReading(); setQuiz(true); }}>Story quiz! 🧠</button>}
      </div>
    </div>
  );
}
