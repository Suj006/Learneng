"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, speak } from "@/lib/client";
import { Celebration, ErrorNote, InlineSpinner, type AwardLike } from "@/components/ui";
import type { Suggestion } from "@/lib/improve";

type Res = { id: string; original: string; praise: string; suggestions: Suggestion[]; challenge: string; evaluator: "claude" | "offline"; safety?: string };
type Saved = { improved: boolean; notes: string[]; original: string; mine: string; award: AwardLike | null; safety?: string };
const KIND: Record<Suggestion["kind"], string> = { fix: "🔧 Fix", word: "💪 Power word", detail: "🎨 Add detail", join: "🔗 Join ideas" };

export default function ImproveSentence() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [res, setRes] = useState<Res | null>(null);
  const [mine, setMine] = useState("");
  const [saved, setSaved] = useState<Saved | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [safety, setSafety] = useState<string | null>(null);
  const [cele, setCele] = useState(false);

  async function suggest() {
    setBusy(true); setErr(null); setSafety(null);
    try {
      const r = await api<Res>("/api/writing/improve", { body: { action: "suggest", text } });
      if (r.safety) setSafety(r.safety); else { setRes(r); setMine(r.original); speak(r.praise, { who: "grammy" }); }
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  async function save() {
    if (!res) return;
    setBusy(true); setErr(null); setSafety(null);
    try {
      const r = await api<Saved>("/api/writing/improve", { body: { action: "save", id: res.id, mine } });
      if (r.safety) setSafety(r.safety); else { setSaved(r); if (r.award) setCele(true); }
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }
  function again() { setText(""); setRes(null); setMine(""); setSaved(null); router.refresh(); }

  return (
    <div className="mt-6 grid gap-4">
      {!res && (
        <div className="card p-5">
          <label htmlFor="orig" className="font-bold">My sentence</label>
          <textarea id="orig" data-testid="improve-input" value={text} onChange={(e) => setText(e.target.value)} maxLength={300} rows={3}
            className="input mt-2 w-full" placeholder="e.g. i saw a dog in the park" />
          <button className="btn-primary mt-3" disabled={busy || text.trim().length < 3} onClick={suggest}>{busy ? <InlineSpinner /> : "✨ Give me ideas"}</button>
        </div>
      )}
      {safety && <p className="glass p-4" role="status">💜 {safety}</p>}
      <ErrorNote error={err} />
      {res && (
        <>
          <div className="card p-5" data-testid="improve-original">
            <p className="text-xs font-bold uppercase text-vibe-lavender">Your original (kept safe)</p>
            <p className="mt-1 text-lg">{res.original}</p>
            <p className="mt-3 font-bold text-vibe-aqua-ink">🪄 {res.praise}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2" data-testid="improve-suggestions">
            {res.suggestions.map((s, i) => (
              <li key={i} className="glass p-4">
                <span className="chip">{KIND[s.kind]}</span>
                <p className="mt-2 font-bold">{s.idea}</p>
                <p className="mt-1 text-sm">Idea: <em>{s.example}</em></p>
                <p className="mt-1 text-xs text-vibe-lavender">Why? {s.why}</p>
              </li>
            ))}
          </ul>
          {!saved ? (
            <div className="card p-5">
              <label htmlFor="mine" className="font-bold">✍️ {res.challenge}</label>
              <textarea id="mine" data-testid="improve-mine" value={mine} onChange={(e) => setMine(e.target.value)} maxLength={400} rows={3} className="input mt-2 w-full" />
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-primary" disabled={busy || mine.trim().length < 2} onClick={save}>{busy ? <InlineSpinner /> : "💾 Save my sentence"}</button>
                <button className="btn-ghost" onClick={() => setMine(res.original)}>↩️ Start again from my original</button>
              </div>
              <p className="mt-2 text-xs text-vibe-lavender">{res.evaluator === "claude" ? "Ideas by GRAMMY (AI). " : "Ideas by GRAMMY's spell book (offline checks: capitals, punctuation, words). "}Your words are never changed for you.</p>
            </div>
          ) : (
            <div className="card p-5" data-testid="improve-result">
              <p className="text-sm text-vibe-lavender">Before: {saved.original}</p>
              <p className="mt-1 text-lg font-bold">After: {saved.mine}</p>
              <ul className="mt-3 list-disc pl-5 text-sm">{saved.notes.map((n) => <li key={n}>{n}</li>)}</ul>
              <button className="btn-primary mt-4" onClick={again}>✨ Improve another sentence</button>
            </div>
          )}
        </>
      )}
      {cele && saved?.award && <Celebration award={saved.award} who="grammy" title="Sentence power-up!" message="You improved your own sentence." onClose={() => setCele(false)} />}
    </div>
  );
}
