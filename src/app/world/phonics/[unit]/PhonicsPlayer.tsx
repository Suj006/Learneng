"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { audio } from "@/lib/audio/manager";
import { Celebration, ErrorNote, InlineSpinner, Progress, type AwardLike } from "@/components/ui";
import type { PQuestion } from "@/lib/phonics";

type Fb = { right: boolean; answer: string; explain: string; done: boolean; correct: number; total: number; score?: number; passed?: boolean; award?: AwardLike };

export function PhonicsPlayer({ unit }: { unit: string }) {
  const [att, setAtt] = useState<{ attemptId: string; questions: PQuestion[] } | null>(null);
  const [i, setI] = useState(0);
  const [fb, setFb] = useState<Fb | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cele, setCele] = useState(false);
  const hear = (t?: string) => { if (t) void audio.say("lexi", t, { rate: 0.8, server: true, caption: false }); };
  const start = async () => {
    setErr(null); setFb(null); setI(0); setPicked(null);
    try { const r = await api<{ attemptId: string; questions: PQuestion[] }>("/api/phonics", { body: { action: "start", unit } }); setAtt(r); hear(r.questions[0]?.say); }
    catch (e) { setErr((e as Error).message); }
  };
  useEffect(() => { void start(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [unit]);
  if (err && !att) return <div className="mx-auto max-w-xl"><ErrorNote error={err} /><Link href="/world/phonics" className="btn-ghost mt-4">← Back to the valley</Link></div>;
  if (!att) return <p className="text-center"><InlineSpinner /></p>;
  const q = att.questions[i];
  const choose = async (o: string) => {
    if (fb || busy) return;
    setBusy(true); setPicked(o);
    try {
      const r = await api<Fb>("/api/phonics", { body: { action: "answer", attemptId: att.attemptId, index: i, choice: o } });
      setFb(r); audio.sfx(r.right ? "correct" : "incorrect");
      if (r.done && r.award) setCele(true);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  const next = () => { setFb(null); setPicked(null); setI(i + 1); hear(att.questions[i + 1]?.say); };
  if (fb?.done && !cele) {
    return (
      <div className="card mx-auto max-w-xl p-6 text-center" data-testid="phonics-result">
        <p className="text-5xl">{fb.passed ? "🌟" : "🌱"}</p>
        <p className="title-md mt-2">You got {fb.correct} of {fb.total}!</p>
        <p className="mt-1 text-sm text-vibe-lavender">{fb.passed ? "Brilliant listening! The next sound path is open." : "Great practice! Score 60% to open the next path — try again whenever you like."}</p>
        <div className="mt-4 flex justify-center gap-2"><button className="btn-primary" onClick={start}>🔁 Practise again</button><Link href="/world/phonics" className="btn-ghost">🎶 Back to the valley</Link></div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-xl">
      <Progress value={i + (fb ? 1 : 0)} max={att.questions.length} label="Phonics progress" />
      <div className="card mt-4 p-6 text-center" data-testid="phonics-question">
        {q.show && <p className="text-7xl" aria-hidden>{q.show}</p>}
        <p className="mt-3 font-display text-xl font-bold">{q.prompt}</p>
        {q.say && <button className="btn-ghost btn-sm mt-3" onClick={() => hear(q.say)}>🔊 Hear it again</button>}
        <div className="mt-5 grid grid-cols-2 gap-3">{q.options.map((o) => {
          const state = fb ? (o === fb.answer ? "bg-vibe-mint/25 ring-2 ring-vibe-mint" : o === picked ? "bg-vibe-coral/20 line-through" : "opacity-60") : "";
          return <button key={o} className={`rounded-2xl border border-line/10 bg-glass/5 p-4 text-2xl font-bold hover:bg-glass/10 ${state}`} disabled={!!fb || busy} onClick={() => choose(o)}>{o}</button>;
        })}</div>
        {fb && (
          <div className={`mt-4 rounded-2xl p-3 text-left text-sm ${fb.right ? "bg-vibe-mint/15" : "bg-vibe-sun/15"}`} role="status">
            <b>{fb.right ? "Yes! 🎉" : "Almost! 🌟"}</b> {fb.explain}
            <div className="mt-2 flex gap-2">{q.say && <button className="btn-ghost btn-sm" onClick={() => hear(q.say)}>🔊 Hear it</button>}{!fb.done && <button className="btn-primary btn-sm" onClick={next}>Continue →</button>}</div>
          </div>
        )}
        <ErrorNote error={err} />
      </div>
      {cele && fb?.award && <Celebration award={fb.award} who="lexi" title="Sound path complete!" message={`You got ${fb.correct} of ${fb.total}.`} onClose={() => setCele(false)} />}
    </div>
  );
}
