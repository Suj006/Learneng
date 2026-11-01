"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { api, listenOnce, speechRecognitionCtor } from "@/lib/client";
import { audio } from "@/lib/audio/manager";
import { Celebration, CharacterSays, ErrorNote, InlineSpinner, type AwardLike } from "@/components/ui";
import type { CharacterName } from "@/components/Character";

type Item = { word: string; emoji: string; x: number; y: number; meaning: string; example: string };
type Pub = { slug: string; title: string; emoji: string; who: CharacterName; intro: string; sky: string; ground: string; realLife: string | null; items: Item[]; tiles: string[]; hint: string; questions: { q: string; options: string[] }[]; describe: string; level: "young" | "older" };
type Result = { score: number; marks: { q: string; given: string; answer: string; correct: boolean }[]; sentenceOk: boolean; sentenceAnswer: string; describe: { ok: boolean; used: string[] }; award: AwardLike | null; realLife: string | null; safety?: string };
const STEPS = ["Explore", "Find it", "Build a sentence", "Questions", "Describe", "Done"] as const;

export function ScenePlayer({ scene }: { scene: Pub }) {
  const [step, setStep] = useState(0);
  const [explored, setExplored] = useState<string[]>([]);
  const [open, setOpen] = useState<Item | null>(null);
  const [find, setFind] = useState<{ round: number; target: Item; msg: string | null }>(() => ({ round: 0, target: scene.items[0], msg: null }));
  const [built, setBuilt] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [res, setRes] = useState<Result | null>(null);
  const [cele, setCele] = useState(false);
  const say = (t: string, rate = 0.9) => void audio.say("lexi", t, { rate, server: true, caption: false });
  const targets = useMemo(() => [...scene.items].sort((a, b) => (a.word.length * 13 + a.x) % 11 - (b.word.length * 13 + b.x) % 11).slice(0, 4), [scene.items]);
  const need = Math.min(6, scene.items.length);

  const tap = (it: Item) => {
    if (step === 0) { setOpen(it); say(`${it.word}. ${it.example}`); if (!explored.includes(it.word)) setExplored([...explored, it.word]); return; }
    if (step === 1) {
      if (it.word === find.target.word) {
        audio.sfx("correct");
        if (find.round + 1 >= targets.length) { setStep(2); return; }
        const next = targets[find.round + 1]; setFind({ round: find.round + 1, target: next, msg: null }); say(`Find the ${next.word}`);
      } else { audio.sfx("incorrect"); setFind({ ...find, msg: `That's the ${it.word}. Try again!` }); say(it.word); }
    }
  };
  const submit = async () => {
    setBusy(true); setErr(null);
    try {
      const r = await api<Result>(`/api/word-scenes/${scene.slug}`, { body: { explored, sentence: built.join(" "), answers, describe: desc } });
      if (r.safety) { setErr(r.safety); return; }
      setRes(r); setStep(5); if (r.award && (r.award.xp ?? 0) > 0) setCele(true);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <ol className="mb-4 flex flex-wrap gap-2 text-xs" aria-label="Scene steps">{STEPS.map((s, i) => <li key={s} className={`chip ${i === step ? "bg-vibe-cta text-white" : i < step ? "opacity-80" : "opacity-50"}`}>{i + 1}. {s}</li>)}</ol>
      {step <= 1 && (
        <>
          <CharacterSays who={scene.who} mood="explaining">{step === 0 ? `${scene.intro} (${explored.length}/${need} found)` : `Listen and tap: find the ${find.target.word}! (${find.round + 1}/${targets.length})`}</CharacterSays>
          {/* Original scene: a simple illustrated backdrop with tappable objects. */}
          <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-3xl border border-line/10 shadow-card" style={{ background: `linear-gradient(180deg, ${scene.sky} 0 62%, ${scene.ground} 62% 100%)` }} data-testid="scene-board">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 62" preserveAspectRatio="none" aria-hidden>
              <rect x="0" y="36" width="100" height="1.2" fill="#00000014" /><circle cx="92" cy="6" r="4" fill="#FFD65A" opacity="0.7" />
              <path d="M0 44 Q 25 40 50 44 T 100 43 V62 H0Z" fill="#ffffff22" />
            </svg>
            {scene.items.map((it) => (
              <button key={it.word} type="button" onClick={() => tap(it)} aria-label={it.word}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl p-1 text-4xl transition hover:scale-110 focus-visible:ring-4 sm:text-5xl ${explored.includes(it.word) && step === 0 ? "ring-2 ring-vibe-sun" : ""}`}
                style={{ left: `${it.x}%`, top: `${it.y}%` }}>{it.emoji}</button>
            ))}
          </div>
          {step === 0 && open && (
            <div className="card mt-4 p-4" role="status" data-testid="scene-card">
              <p className="font-display text-2xl font-bold">{open.emoji} {open.word} <button className="btn-ghost btn-sm ml-2" onClick={() => say(open.word, 0.7)}>🔊</button><button className="btn-ghost btn-sm ml-1" onClick={() => say(open.word, 0.5)}>🐢</button></p>
              <p className="mt-1 text-sm text-vibe-lavender">Meaning: {open.meaning}</p>
              <p className="mt-1">“{open.example}” <button className="btn-ghost btn-sm" onClick={() => say(open.example)}>🔊</button></p>
            </div>
          )}
          {step === 1 && <p className="mt-3 text-center"><button className="btn-ghost btn-sm" onClick={() => say(`Find the ${find.target.word}`)}>🔊 Say it again</button>{find.msg && <span className="ml-2 text-sm">{find.msg}</span>}</p>}
          {step === 0 && <div className="mt-4 text-center"><button className="btn-primary" disabled={explored.length < need} onClick={() => { setStep(1); say(`Find the ${targets[0].word}`); setFind({ round: 0, target: targets[0], msg: null }); }}>{explored.length < need ? `Find ${need - explored.length} more` : "Next: Find it! →"}</button></div>}
        </>
      )}
      {step === 2 && (
        <div className="card p-6" data-testid="scene-build">
          <h2 className="title-md">🧩 Build a sentence</h2><p className="text-sm text-vibe-lavender">Tap the words in the right order. Hint: {scene.hint}</p>
          <p className="mt-4 min-h-[3rem] rounded-2xl bg-glass/5 p-3 text-lg font-semibold">{built.join(" ") || "…"}</p>
          <div className="mt-3 flex flex-wrap gap-2">{scene.tiles.map((t, i) => { const used = built.filter((b) => b === t).length >= scene.tiles.filter((x) => x === t).length; return <button key={i} className="btn-ghost" disabled={used} onClick={() => setBuilt([...built, t])}>{t}</button>; })}</div>
          <div className="mt-4 flex gap-2"><button className="btn-ghost btn-sm" onClick={() => setBuilt([])}>↩️ Start again</button><button className="btn-primary" disabled={built.length !== scene.tiles.length} onClick={() => { say(built.join(" ")); setStep(3); }}>Next →</button></div>
        </div>
      )}
      {step === 3 && (
        <div className="card p-6" data-testid="scene-questions">
          <h2 className="title-md">❓ Questions</h2>
          {scene.questions.map((q, i) => (
            <fieldset key={i} className="mt-4"><legend className="font-semibold">{q.q}</legend>
              <div className="mt-2 flex flex-wrap gap-2">{q.options.map((o) => <button key={o} type="button" aria-pressed={answers[i] === o} className={`btn-ghost ${answers[i] === o ? "ring-2 ring-vibe-purple" : ""}`} onClick={() => { const a = [...answers]; a[i] = o; setAnswers(a); }}>{o}</button>)}</div>
            </fieldset>
          ))}
          <button className="btn-primary mt-5" disabled={scene.questions.some((_, i) => !answers[i])} onClick={() => setStep(4)}>Next →</button>
        </div>
      )}
      {step === 4 && (
        <div className="card p-6" data-testid="scene-describe">
          <h2 className="title-md">🗣️ Describe the scene</h2><p className="mt-1">{scene.describe}</p>
          <textarea className="input mt-3 w-full" rows={scene.level === "young" ? 2 : 4} maxLength={600} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Type here, or use the microphone (optional)" aria-label="Your description" />
          <div className="mt-3 flex flex-wrap gap-2">
            {speechRecognitionCtor() && <button className="btn-ghost btn-sm" onClick={async () => { try { const t = await listenOnce(); if (t) setDesc((d) => (d ? d + " " : "") + t); } catch { /* microphone optional */ } }}>🎤 Speak (optional)</button>}
            <button className="btn-primary" disabled={busy || desc.trim().length < 2} onClick={submit}>{busy ? <InlineSpinner /> : "Finish ✨"}</button>
            <button className="btn-ghost btn-sm" disabled={busy} onClick={() => { setDesc(""); void submit(); }}>Skip this part</button>
          </div>
          <ErrorNote error={err} />
        </div>
      )}
      {step === 5 && res && (
        <div className="card p-6" data-testid="scene-result">
          <p className="title-md">{res.score >= 70 ? "🌟 Brilliant exploring!" : "🌱 Great practice!"} Score: {res.score}%</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>{res.sentenceOk ? "✅" : "🔁"} Sentence: {res.sentenceOk ? built.join(" ") : `try: “${res.sentenceAnswer}”`}</li>
            {res.marks.map((m) => <li key={m.q}>{m.correct ? "✅" : "🔁"} {m.q} — {m.correct ? m.given : `answer: ${m.answer}`}</li>)}
            <li>{res.describe.ok ? "✅" : "💡"} Description: {res.describe.used.length ? `you used ${res.describe.used.join(", ")}` : "try using words from the scene next time"}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2"><button className="btn-ghost" onClick={() => { setStep(0); setBuilt([]); setAnswers([]); setDesc(""); setRes(null); }}>🔁 Explore again</button>
            {res.realLife && <Link className="btn-primary" href={`/world/real-life/${res.realLife}`}>🌍 Use these words in Real Life</Link>}
            <Link className="btn-ghost" href="/world/word-scenes">More scenes</Link></div>
        </div>
      )}
      {cele && res?.award && <Celebration award={res.award} who="lexi" title="Scene explored!" onClose={() => setCele(false)} />}
    </div>
  );
}
