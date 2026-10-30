"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api, listenOnce, speechRecognitionCtor, startTimer } from "@/lib/client";
import { Celebration, CharacterSays, ErrorNote, Progress, type AwardLike } from "@/components/ui";
import { useMounted } from "@/lib/useMounted";

export interface Feedback {
  score: number; breakdown: Record<string, number>; positives: string[]; corrections: { original: string; corrected: string; why: string }[];
  suggestions: string[]; better_words: { instead_of: string; try: string }[]; improved_sample: string; encouragement: string;
}
const LABELS: Record<string, string> = { grammar: "Grammar", spelling: "Spelling", vocabulary: "Vocabulary", sentence_structure: "Sentences", creativity: "Creativity", relevance: "On topic", punctuation: "Punctuation", readability: "Readability" };

export function WritingCanvas({ kind, topic, meta, existing }: {
  kind: "topic" | "story_builder"; topic: { id: string | null; title: string; prompt: string; minWords: number; words: string[] }; meta?: Record<string, string>;
  existing?: { id: string; content: string; status: string; feedback: Feedback | null; evaluator: string | null };
}) {
  const [text, setText] = useState(existing?.content ?? "");
  const [id, setId] = useState<string | null>(existing?.id ?? null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fb, setFb] = useState<{ f: Feedback; evaluator: string; award?: AwardLike; wordsUsed?: number } | null>(existing?.feedback ? { f: existing.feedback, evaluator: existing.evaluator ?? "offline" } : null);
  const [cele, setCele] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dictating, setDictating] = useState(false);
  const [timer] = useState(() => startTimer());
  const mounted = useMounted();
  const canDictate = mounted && !!speechRecognitionCtor();
  const area = useRef<HTMLTextAreaElement>(null);
  const words = (text.match(/[A-Za-z']+/g) ?? []).length;
  const sentences = (text.match(/[^.!?]+[.!?]+/g) ?? []).length + (/[A-Za-z]\s*$/.test(text) ? 1 : 0);
  const readOnly = existing?.status === "evaluated" || !!fb;

  async function save(silent = false) {
    if (!text.trim()) return null;
    try {
      const r = await api<{ submissionId: string }>("/api/writing/draft", { body: { submissionId: id ?? undefined, topicId: topic.id ?? undefined, kind, title: topic.title, content: text, meta } });
      setId(r.submissionId); if (!silent) setSaved("Draft saved ✅"); return r.submissionId;
    } catch (e) { setErr((e as Error).message); return null; }
  }
  useEffect(() => { if (readOnly) return; const t = setInterval(() => { if (text.trim()) save(true); }, 30000); return () => clearInterval(t); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [text, readOnly]);

  async function submit() {
    setBusy(true); setErr(null);
    const sid = await save(true);
    if (!sid) { setBusy(false); return; }
    try { const r = await api<{ evaluation: Feedback; evaluator: string; award: AwardLike; wordsUsed: number }>("/api/writing/submit", { body: { submissionId: sid, seconds: timer() } }); setFb({ f: r.evaluation, evaluator: r.evaluator, award: r.award, wordsUsed: r.wordsUsed }); setCele(true); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  async function dictate() {
    setDictating(true); setErr(null);
    try { const t = await listenOnce(); setText((x) => (x.trim() ? `${x.trim()} ${t}` : t.charAt(0).toUpperCase() + t.slice(1))); }
    catch { setErr("I couldn't hear that. Try again in a quiet place, or type instead!"); } finally { setDictating(false); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <CharacterSays who="story" mood={fb ? "celebrating" : "thinking"} size={90}>{topic.prompt}</CharacterSays>
        <div className="card p-4">
          <textarea ref={area} value={text} onChange={(e) => setText(e.target.value)} readOnly={readOnly} rows={12} maxLength={6000}
            className="w-full resize-y rounded-2xl bg-white p-5 text-lg leading-relaxed text-vibe-midnight outline-none focus:ring-4 focus:ring-vibe-aqua/40" placeholder="Once upon a time…" aria-label="Your writing" spellCheck />
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="chip">📝 {words} words</span><span className="chip">✏️ {sentences} sentences</span>
            <div className="flex-1"><Progress value={words} max={topic.minWords} className="h-2" label="Words towards the goal" /></div>
            <span className="text-vibe-lavender">Goal: {topic.minWords}+</span>
          </div>
          {!readOnly && (
            <div className="mt-4 flex flex-wrap gap-2">
              {canDictate && <button className="btn-ghost btn-sm" onClick={dictate} disabled={dictating}>{dictating ? "🎙️ Listening…" : "🎙️ Tell it with my voice"}</button>}
              <button className="btn-ghost btn-sm" onClick={() => save()}>💾 Save draft</button>
              <button className="btn-primary" onClick={submit} disabled={busy || words < 3}>{busy ? "GRAMMY is reading…" : "Submit for feedback ✨"}</button>
              {saved && <span className="self-center text-sm text-vibe-mint">{saved}</span>}
            </div>
          )}
          <ErrorNote error={err} />
        </div>
        {fb && <FeedbackView f={fb.f} evaluator={fb.evaluator} original={text} wordsUsed={fb.wordsUsed} />}
      </div>
      <aside className="space-y-4">
        <div className="glass p-4"><b className="font-display">💎 Power words</b><p className="text-xs text-vibe-lavender">Tap to add to your writing</p>
          <div className="mt-2 flex flex-wrap gap-2">{topic.words.map((w) => <button key={w} disabled={readOnly} onClick={() => { setText((x) => `${x}${x && !x.endsWith(" ") ? " " : ""}${w} `); area.current?.focus(); }} className="chip hover:bg-white/20">{w}</button>)}</div></div>
        <div className="glass p-4 text-sm"><b className="font-display">🦊 STORY's tips</b><ul className="mt-2 list-disc space-y-1 pl-4 text-vibe-lavender"><li>Start each sentence with a capital letter.</li><li>End with . ? or !</li><li>Who? Where? What happened? How did it feel?</li><li>Use one power word to make it sparkle.</li></ul></div>
        {fb && <Link href="/world/writing" className="btn-ghost w-full">Write something new</Link>}
      </aside>
      {cele && fb?.award && <Celebration award={fb.award} who="grammy" title={`Writing score: ${fb.f.score}/100`} message={fb.f.encouragement} onClose={() => setCele(false)} />}
    </div>
  );
}

function FeedbackView({ f, evaluator, original, wordsUsed }: { f: Feedback; evaluator: string; original: string; wordsUsed?: number }) {
  return (
    <div className="card space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="title-md">GRAMMY's feedback</h2><span className="chip">{evaluator === "claude" ? "✨ AI feedback" : "🧮 Quick check (offline)"}</span></div>
      <div className="flex items-center gap-4"><div className="grid h-20 w-20 place-items-center rounded-full bg-vibe-cta font-display text-3xl font-bold shadow-glow">{f.score}</div><p className="flex-1 font-display text-lg">{f.encouragement}</p></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{Object.entries(f.breakdown).map(([k, v]) => <div key={k} className="rounded-2xl bg-white/5 p-3 text-center"><div className="text-xs text-vibe-lavender">{LABELS[k] ?? k}</div><div className="font-display text-xl font-bold">{v}/10</div></div>)}</div>
      {wordsUsed ? <p className="text-sm text-vibe-aqua">🗝️ You used {wordsUsed} word{wordsUsed > 1 ? "s" : ""} from your vocabulary journey!</p> : null}
      <div><b>🌟 What you did well</b><ul className="mt-1 list-disc pl-5 text-vibe-lavender">{f.positives.map((p) => <li key={p}>{p}</li>)}</ul></div>
      {f.corrections.length > 0 && (
        <div><b>🔧 Magic fixes</b>
          <div className="mt-2 space-y-2">{f.corrections.map((c, k) => (
            <div key={k} className="grid gap-2 sm:grid-cols-2"><div className="rounded-2xl bg-vibe-coral/10 p-3 text-sm"><div className="text-xs text-vibe-coral">You wrote</div>{c.original}</div><div className="rounded-2xl bg-vibe-mint/10 p-3 text-sm"><div className="text-xs text-vibe-mint">Even better</div>{c.corrected}<div className="mt-1 text-xs text-vibe-lavender">{c.why}</div></div></div>
          ))}</div>
        </div>
      )}
      <div><b>🚀 Level-up tips</b><ul className="mt-1 list-disc pl-5 text-vibe-lavender">{f.suggestions.map((s) => <li key={s}>{s}</li>)}</ul></div>
      {f.better_words.length > 0 && <div><b>💎 Try these words</b><div className="mt-2 flex flex-wrap gap-2">{f.better_words.map((b) => <span key={b.instead_of} className="chip">{b.instead_of} → <b className="text-vibe-sun">{b.try}</b></span>)}</div></div>}
      {f.improved_sample && f.improved_sample !== original && <details className="glass p-4"><summary className="cursor-pointer font-bold">✨ See an improved version</summary><p className="mt-2 whitespace-pre-wrap text-vibe-lavender">{f.improved_sample}</p></details>}
    </div>
  );
}
