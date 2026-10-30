"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Question, type Q } from "./Question";
import { Character, type CharacterName } from "@/components/Character";
import { Celebration, CharacterSays, ErrorNote, Progress, Spinner, type AwardLike } from "@/components/ui";
import { api, startTimer } from "@/lib/client";

interface Created { attemptId: string; questions: (Q & { i: number })[]; meta: { title: string; intro: string; villain?: string; emoji: string; rounds: string[] }; difficulty: string }
interface Result { score: number; correct: number; total: number; passed: boolean; results: boolean[]; answers: string[]; reward: AwardLike | null }

/** Plays any server-scored challenge: bosses, weekly/monthly, mystery, special events, family and listening. */
export function ChallengePlayer({ kind, refSlug, guide = "max", backHref = "/world", allowDifficulty = false, familyId }: { kind: string; refSlug?: string; guide?: CharacterName; backHref?: string; allowDifficulty?: boolean; familyId?: string }) {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">("normal");
  const [c, setC] = useState<Created | null>(null);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [timer] = useState(() => startTimer());
  const load = async (d = difficulty) => {
    setErr(null); setC(null); setResult(null); setAnswers([]); setI(0); setStarted(false);
    const qs = new URLSearchParams({ ...(refSlug ? { ref: refSlug } : {}), ...(familyId ? { family: familyId } : {}), difficulty: d });
    try { setC(await api<Created>(`/api/challenge/${kind}?${qs}`)); } catch (e) { setErr((e as Error).message); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  if (err && !c) return <div className="mx-auto max-w-2xl"><CharacterSays who={guide} mood="encouraging">{err}</CharacterSays><Link href={backHref} className="btn-ghost mt-4">← Back</Link></div>;
  if (!c) return <Spinner label="Preparing your challenge…" />;
  const isBoss = kind === "boss";
  const hp = result ? Math.max(0, 100 - result.score) : Math.max(0, 100 - Math.round((answers.length / Math.max(1, c.questions.length)) * 100));

  if (!started) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card relative overflow-hidden p-6 sm:p-8">
          <div className="absolute inset-0 bg-vibe-hero opacity-60" />
          <div className="relative flex flex-col items-center gap-4 text-center">
            <motion.div className="text-8xl" animate={{ y: [0, -10, 0], rotate: isBoss ? [0, -5, 5, 0] : 0 }} transition={{ duration: 2.5, repeat: Infinity }}>{c.meta.emoji}</motion.div>
            <h1 className="title-lg">{c.meta.title}</h1>
            {c.meta.villain && <p className="font-display text-vibe-coral">vs {c.meta.villain}</p>}
            <p className="max-w-xl text-lg text-vibe-lavender">{c.meta.intro}</p>
            {c.meta.rounds.length > 1 && <ol className="flex flex-wrap justify-center gap-2">{c.meta.rounds.map((r, k) => <li key={k} className="chip">Round {k + 1}: {r}</li>)}</ol>}
            {allowDifficulty && (
              <div className="flex gap-2" role="radiogroup" aria-label="Difficulty">
                {(["easy", "normal", "hard"] as const).map((d) => <button key={d} role="radio" aria-checked={difficulty === d} onClick={() => { setDifficulty(d); load(d); }} className={`btn btn-sm ${difficulty === d ? "bg-vibe-aqua text-vibe-midnight" : "btn-ghost"}`}>{d === "easy" ? "🌱 Easy" : d === "normal" ? "⚔️ Normal" : "🔥 Hard"}</button>)}
              </div>
            )}
            <p className="text-sm text-vibe-lavender/80">{c.questions.length} questions · you can retry anytime — nothing earned is ever lost.</p>
            <button className="btn-primary text-lg" onClick={() => setStarted(true)}>{isBoss ? "Start the battle ⚔️" : "Let's go! 🚀"}</button>
          </div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card p-6 text-center">
          <Character name={guide} mood={result.passed ? "celebrating" : "encouraging"} size={130} className="mx-auto" />
          <h1 className="title-lg mt-2">{result.passed ? (isBoss ? `${c.meta.villain ?? "The boss"} is defeated!` : "Challenge complete!") : "So close, Explorer!"}</h1>
          <p className="mt-2 text-lg">You scored <b className="text-vibe-sun">{result.score}%</b> ({result.correct}/{result.total})</p>
          {!result.passed && <p className="mt-1 text-vibe-lavender">You need 70% to win. Every try trains your brain — and your progress is saved!</p>}
          <div className="mt-6 grid gap-2 text-left text-sm sm:grid-cols-2">
            {c.questions.map((q, k) => <div key={k} className={`rounded-2xl p-3 ${result.results[k] ? "bg-vibe-mint/10" : "bg-vibe-coral/10"}`}>{result.results[k] ? "✅" : "🔁"} {q.prompt.slice(0, 70)}{!result.results[k] && <div className="mt-1 text-vibe-lavender">Answer: <b>{result.answers[k]}</b></div>}</div>)}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button className="btn-primary" onClick={() => load()}>{result.passed ? "Play again" : "Try again"}</button>
            <Link href={backHref} className="btn-ghost">Back</Link>
          </div>
        </div>
        {celebrate && result.reward && <Celebration award={result.reward} who={guide} title={result.passed ? "Victory!" : "Great effort!"} onClose={() => { setCelebrate(false); router.refresh(); }} />}
      </div>
    );
  }

  const q = c.questions[i];
  const submit = async (all: string[]) => {
    try { const r = await api<Result>(`/api/challenge/${kind}`, { body: { attemptId: c.attemptId, answers: all, seconds: timer() } }); setResult(r); setCelebrate(true); }
    catch (e) { setErr((e as Error).message); }
  };
  return (
    <div className="mx-auto max-w-3xl">
      {isBoss ? (
        <div className="glass mb-6 flex items-center gap-4 p-4">
          <motion.span className="text-5xl" animate={{ x: [0, -4, 4, 0] }} transition={{ duration: 0.4 }} key={answers.length}>{c.meta.emoji}</motion.span>
          <div className="flex-1"><div className="flex justify-between text-sm font-bold"><span>{c.meta.villain}</span><span>{hp}% HP</span></div><Progress value={hp} color="bg-vibe-coral" label="Boss health" /></div>
        </div>
      ) : (
        <Progress value={i} max={c.questions.length} className="mb-6" />
      )}
      <div className="flex items-center justify-between text-sm"><span className="chip text-vibe-sun">{String(q.round ?? "")}</span><span className="font-bold">{i + 1}/{c.questions.length}</span></div>
      <div className="card mt-3 p-6">
        <Question q={q} onAnswer={(a) => {
          const next = [...answers, a];
          setAnswers(next);
          if (i + 1 < c.questions.length) setI(i + 1); else submit(next);
        }} />
      </div>
      <ErrorNote error={err} />
    </div>
  );
}
