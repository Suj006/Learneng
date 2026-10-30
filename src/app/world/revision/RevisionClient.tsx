"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Question } from "@/components/play/Question";
import { Celebration, CharacterSays, ErrorNote, PageTitle, Progress, Spinner, type AwardLike } from "@/components/ui";
import { api, startTimer } from "@/lib/client";

type RQ = { key: string; wordId: string; type: string; prompt: string; options?: string[]; emoji?: string; speak?: string; sentence?: string };

export function RevisionClient() {
  const [qs, setQs] = useState<RQ[] | null>(null);
  const [i, setI] = useState(0);
  const [fb, setFb] = useState<{ correct: boolean; answer: string } | null>(null);
  const [score, setScore] = useState(0);
  const [award, setAward] = useState<AwardLike | null>(null);
  const [finished, setFinished] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [elapsed] = useState(() => startTimer());
  useEffect(() => { api<{ questions: RQ[] }>(`/api/revision${typeof window !== "undefined" ? window.location.search.replace("?", "?") : ""}`).then((r) => setQs(r.questions)).catch((e) => setErr(e.message)); }, []);
  if (err && !qs) return <ErrorNote error={err} />;
  if (!qs) return <Spinner label="Finding words to revise…" />;
  if (!qs.length) return <div className="mx-auto max-w-2xl"><PageTitle title="Revision Boost" /><CharacterSays who="lexi" mood="thinking">You haven't discovered any words yet! Start with today's Word Quest.</CharacterSays><Link href="/world/quest" className="btn-primary mt-6">Daily Word Quest</Link></div>;
  if (finished) {
    return (
      <div className="mx-auto max-w-2xl"><PageTitle title="Revision Boost" />
        <CharacterSays who="lexi" mood="celebrating">You revised {qs.length} words and got {score} right! Words you get right on different days become MASTERED. 👑</CharacterSays>
        <div className="mt-6 flex gap-3"><Link href="/world" className="btn-primary">Back to adventure</Link><button className="btn-ghost" onClick={() => location.reload()}>Revise more</button></div>
        {award && <Celebration award={award} who="lexi" title="Revision Boost complete!" onClose={() => setAward(null)} />}
      </div>
    );
  }
  const q = qs[i];
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="Revision Boost" subtitle="Spaced repetition: words come back right when you're about to forget them." />
      <Progress value={i} max={qs.length} />
      <div className="card mt-6 p-6"><Question q={q} feedback={fb} onAnswer={async (a) => {
        try { const r = await api<{ correct: boolean; answer: string }>("/api/revision/answer", { body: { wordId: q.wordId, type: q.type, answer: a } }); setFb(r); if (r.correct) setScore((s) => s + 1); } catch (e) { setErr((e as Error).message); }
      }} /></div>
      {fb && <button className="btn-primary mt-4 w-full" autoFocus onClick={async () => {
        setFb(null);
        if (i + 1 < qs.length) return setI(i + 1);
        try { const r = await api<{ award: AwardLike }>("/api/revision/complete", { body: { correct: score, total: qs.length, seconds: elapsed() } }); setAward(r.award); } catch (e) { setErr((e as Error).message); }
        setFinished(true);
      }}>{i + 1 < qs.length ? "Next →" : "Finish"}</button>}
      <ErrorNote error={err} />
    </div>
  );
}
