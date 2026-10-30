"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CharacterSays, Celebration, ErrorNote, Progress, Spinner, type AwardLike } from "@/components/ui";
import { api, startTimer } from "@/lib/client";

type Ex = { i: number; q: string; options: string[]; hint: string };
const md = (s: string) => s.split(/\*\*(.+?)\*\*/g).map((p, k) => (k % 2 ? <b key={k} className="text-vibe-sun">{p}</b> : p));

export function GrammarMission({ topic, exercises }: { topic: { slug: string; title: string; explanation: string; examples: { sentence: string; note: string }[] }; exercises: Ex[] }) {
  const [phase, setPhase] = useState<"learn" | "play" | "done">("learn");
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [hint, setHint] = useState(false);
  const [res, setRes] = useState<{ score: number; correct: number; total: number; results: boolean[]; answers: number[]; award: AwardLike | null } | null>(null);
  const [cele, setCele] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [timer] = useState(() => startTimer());
  if (phase === "learn") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <CharacterSays who="grammy" mood="explaining" size={130} speakText={topic.explanation}>{topic.explanation}</CharacterSays>
        <div className="grid gap-3">{topic.examples.map((e) => <div key={e.sentence} className="glass p-4"><p className="text-lg">{md(e.sentence)}</p><p className="text-sm text-vibe-aqua">{e.note}</p></div>)}</div>
        <button className="btn-primary w-full text-lg" onClick={() => setPhase("play")}>Start the mission ({exercises.length} questions) 🚀</button>
      </div>
    );
  }
  if (phase === "done" && res) {
    return (
      <div className="mx-auto max-w-3xl">
        <CharacterSays who="grammy" mood={res.score >= 80 ? "celebrating" : "encouraging"}>{res.score >= 80 ? `Spellbinding! ${res.score}% — you earned the ${topic.title} grammar card!` : `You scored ${res.score}%. Oops-a-daisy — let's fix the tricky ones together and try again!`}</CharacterSays>
        <div className="mt-6 space-y-2">{exercises.map((e, k) => <div key={k} className={`rounded-2xl p-3 ${res.results[k] ? "bg-vibe-mint/10" : "bg-vibe-coral/10"}`}>{res.results[k] ? "✅" : "🔁"} {e.q} — <b>{e.options[res.answers[k]]}</b>{!res.results[k] && <div className="text-sm text-vibe-lavender">💡 {e.hint}</div>}</div>)}</div>
        <div className="mt-6 flex gap-3"><button className="btn-primary" onClick={() => location.reload()}>Try a new set</button><Link href="/world/grammar" className="btn-ghost">Back to the galaxy</Link></div>
        {cele && res.award && <Celebration award={res.award} who="grammy" title="Mission complete!" onClose={() => setCele(false)} />}
      </div>
    );
  }
  const e = exercises[i];
  return (
    <div className="mx-auto max-w-3xl">
      <Progress value={i} max={exercises.length} />
      <div className="card mt-6 p-6">
        <p className="font-display text-2xl font-bold">{e.q}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{e.options.map((o, k) => <button key={o} onClick={async () => {
          const next = [...answers, k]; setAnswers(next); setHint(false);
          if (i + 1 < exercises.length) return setI(i + 1);
          try { const r = await api<NonNullable<typeof res>>(`/api/grammar/${topic.slug}`, { body: { items: exercises.map((x, n) => ({ i: x.i, answer: next[n] })), seconds: timer() } }); setRes(r); setPhase("done"); setCele(true); } catch (x) { setErr((x as Error).message); }
        }} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left text-lg font-semibold hover:bg-white/10">{o}</button>)}</div>
        {hint ? <p className="mt-4 text-sm text-vibe-aqua">🦉 GRAMMY's hint: {e.hint}</p> : <button className="mt-4 text-sm text-vibe-aqua underline" onClick={() => setHint(true)}>Ask GRAMMY for a hint</button>}
      </div>
      <ErrorNote error={err} />
    </div>
  );
}

type Drill = { q: string; options: string[]; answer: number; hint: string };
export function DrillRunner({ topic }: { topic: string }) {
  const [ex, setEx] = useState<Drill[] | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [award, setAward] = useState<AwardLike | null>(null);
  const [timer, setTimer] = useState(() => startTimer());
  const load = () => { setEx(null); setI(0); setCorrect(0); setPicked(null); setTimer(() => startTimer()); api<{ exercises: Drill[] }>(`/api/grammar/practice?topic=${topic}`).then((r) => setEx(r.exercises)); };
  useEffect(load, [topic]);
  if (!ex) return <Spinner label="Generating fresh practice…" />;
  if (!ex.length) return <p>Not enough words yet — discover more words first!</p>;
  if (i >= ex.length) {
    return (
      <div className="mx-auto max-w-2xl text-center"><CharacterSays who="grammy" mood="celebrating">{correct}/{ex.length} correct! Want another fresh set?</CharacterSays>
        <div className="mt-6 flex justify-center gap-3"><button className="btn-primary" onClick={load}>New set 🔁</button><Link href="/world/grammar" className="btn-ghost">Back</Link></div>
        {award && <Celebration award={award} who="grammy" title="Drill complete!" onClose={() => setAward(null)} />}</div>
    );
  }
  const e = ex[i];
  return (
    <div className="mx-auto max-w-3xl">
      <Progress value={i} max={ex.length} />
      <div className="card mt-6 p-6">
        <p className="font-display text-2xl font-bold">{e.q}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{e.options.map((o, k) => (
          <button key={o} disabled={picked !== null} onClick={() => { setPicked(k); if (k === e.answer) setCorrect((c) => c + 1); }}
            className={`rounded-2xl border p-4 text-left text-lg font-semibold ${picked === null ? "border-white/10 bg-white/5 hover:bg-white/10" : k === e.answer ? "border-vibe-mint bg-vibe-mint/20" : k === picked ? "border-vibe-coral bg-vibe-coral/20" : "opacity-50"}`}>{o}</button>
        ))}</div>
        {picked !== null && <><p className="mt-3 text-sm text-vibe-aqua">💡 {e.hint}</p><button className="btn-primary mt-4" autoFocus onClick={async () => {
          setPicked(null);
          if (i + 1 === ex.length) { try { const r = await api<{ award: AwardLike }>("/api/grammar/practice", { body: { topic, correct: correct, total: ex.length, seconds: timer() } }); setAward(r.award); } catch { /* practice still counts as learning; the reward call is best-effort and retried next set */ } }
          setI(i + 1);
        }}>Next →</button></>}
      </div>
    </div>
  );
}
