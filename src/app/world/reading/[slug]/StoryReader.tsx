"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { api, speak, startTimer } from "@/lib/client";
import { Celebration, CharacterSays, ErrorNote, Progress, type AwardLike } from "@/components/ui";

export function StoryReader({ slug, pages, glossary, questions, known }: { slug: string; pages: { scene: string; text: string }[]; glossary: { word: string; meaning: string }[]; questions: { q: string; options: string[] }[]; known: string[] }) {
  const [page, setPage] = useState(0);
  const [quiz, setQuiz] = useState(false);
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [tip, setTip] = useState<string | null>(null);
  const [res, setRes] = useState<{ score: number; correct: number; total: number; answers: number[]; award: AwardLike } | null>(null);
  const [cele, setCele] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [timer] = useState(() => startTimer());
  const gl = new Map(glossary.map((g) => [g.word.toLowerCase(), g.meaning]));
  const render = (text: string) => text.split(/(\s+)/).map((tok, k) => {
    const clean = tok.toLowerCase().replace(/[^a-z']/g, "");
    if (gl.has(clean)) return <button key={k} onClick={() => setTip(`${clean}: ${gl.get(clean)}`)} className="rounded bg-vibe-sun/25 px-1 font-bold text-vibe-sun-ink underline decoration-dotted">{tok}</button>;
    if (known.includes(clean)) return <span key={k} className="rounded bg-vibe-aqua/20 px-0.5 text-vibe-aqua-ink" title="A word you've discovered!">{tok}</span>;
    return tok;
  });

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
  return (
    <div className="mx-auto max-w-3xl">
      <Progress value={page + 1} max={pages.length} />
      <motion.div key={page} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="card mt-6 p-6 sm:p-10">
        <div className="text-center text-7xl tracking-widest sm:text-8xl" aria-hidden>{p.scene}</div>
        <p className="mt-6 text-xl leading-relaxed sm:text-2xl">{render(p.text)}</p>
        <button className="btn-ghost btn-sm mt-6" onClick={() => speak(p.text, { who: "story", rate: 0.95, server: true })}>🔊 Read it to me</button>
        {tip && <p className="mt-3 rounded-2xl bg-vibe-sun/15 p-3 text-sm">📖 {tip}</p>}
      </motion.div>
      <p className="mt-2 text-xs text-vibe-lavender"><span className="text-vibe-sun-ink">Yellow</span> = tap for meaning · <span className="text-vibe-aqua-ink">Blue</span> = a word you've discovered</p>
      <div className="mt-4 flex justify-between">
        <button className="btn-ghost" disabled={page === 0} onClick={() => { setPage(page - 1); setTip(null); }}>← Back</button>
        {page + 1 < pages.length ? <button className="btn-primary" onClick={() => { setPage(page + 1); setTip(null); }}>Next page →</button> : <button className="btn-sun" onClick={() => setQuiz(true)}>Story quiz! 🧠</button>}
      </div>
    </div>
  );
}
