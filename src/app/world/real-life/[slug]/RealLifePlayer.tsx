"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { api, listenOnce, speechRecognitionCtor } from "@/lib/client";
import { audio, type Speaker } from "@/lib/audio/manager";
import { Celebration, ErrorNote, InlineSpinner, type AwardLike } from "@/components/ui";
import type { Level } from "@/lib/reallife";

type Pub = { slug: string; title: string; emoji: string; place: string; character: { name: string; emoji: string; voice: Speaker }; intro: string; mission: string; words: { word: string; emoji: string }[]; phrases: string[]; reflection: string[] };
type Turn = { index: number; say: string; task: string; options: { text: string; emoji: string | null }[] };
type Msg = { from: "them" | "me" | "tip"; text: string; tone?: "great" | "ok" | "retry" };
const LEVELS: [Level, string, string][] = [["beginner", "Beginner", "Pick from picture choices"], ["developing", "Developing", "Pick or type your answer"], ["advanced", "Advanced", "Type or speak, longer conversations"]];

/** A playable real-world conversation. All judging happens on the server; the browser only shows the conversation. */
export function RealLifePlayer({ s, level: initialLevel, suggested, band, name }: { s: Pub; level: Level; suggested: Level; band: number; name: string }) {
  const router = useRouter();
  const [level, setLevel] = useState<Level>(initialLevel);
  const [phase, setPhase] = useState<"intro" | "talk" | "done">("intro");
  const [run, setRun] = useState<{ id: string; total: number } | null>(null);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [log, setLog] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(initialLevel === "advanced");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [canSkip, setCanSkip] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; award: AwardLike } | null>(null);
  const [cele, setCele] = useState(false);
  const [mic, setMic] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMic(!!speechRecognitionCtor()), []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [log, turn]);
  useEffect(() => () => audio.stopVoice(), []);

  const voice = s.character.voice;
  const sayIt = (line: string, slow = false) => void audio.say(voice, line, { rate: slow ? 0.7 : 1, caption: false, server: true });

  async function start() {
    setErr(null); setBusy(true);
    try {
      const r = await api<{ runId: string; total: number; turn: Turn }>(`/api/real-life/${s.slug}`, { body: { action: "start", level } });
      setRun({ id: r.runId, total: r.total }); setTurn(r.turn); setLog([{ from: "them", text: r.turn.say }]); setPhase("talk"); setTyping(level === "advanced");
      audio.unlock(); sayIt(r.turn.say);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  async function answer(input: { option?: number; text?: string; mode: "choice" | "text" | "voice"; skip?: boolean }, shown: string) {
    if (!run || busy) return;
    setErr(null); setBusy(true);
    if (!input.skip) setLog((l) => [...l, { from: "me", text: shown }]);
    try {
      const r = await api<{ result: "great" | "ok" | "retry"; tip: string | null; reply?: string; next?: Turn | null; done: boolean; model?: string | null; canSkip?: boolean; completion?: { score: number; award: AwardLike } }>(
        `/api/real-life/${s.slug}`, { body: { action: "answer", runId: run.id, ...input } });
      audio.sfx(r.result === "retry" ? "incorrect" : "correct");
      if (r.result === "retry") {
        setLog((l) => [...l, { from: "tip", tone: "retry", text: `${r.tip ?? "Try again!"}${r.model ? `  Model answer: “${r.model}”` : ""}` }]);
        setCanSkip(!!r.canSkip);
        return;
      }
      setCanSkip(false); setText("");
      setLog((l) => [...l, ...(r.tip ? [{ from: "tip" as const, tone: "ok" as const, text: r.tip }] : []), { from: "them", text: r.reply ?? "" }]);
      sayIt(r.reply ?? "");
      if (r.done) { setResult(r.completion ?? null); setTimeout(() => { setPhase("done"); setCele(true); }, 1400); }
      else if (r.next) { const n = r.next; setTimeout(() => { setTurn(n); setLog((l) => [...l, { from: "them", text: n.say }]); sayIt(n.say); }, 1600); setTurn(null); }
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  }

  async function speakAnswer() {
    setListening(true); setErr(null);
    try { const heard = await listenOnce(); setText(heard); if (heard.trim()) await answer({ text: heard, mode: "voice" }, heard); }
    catch { setErr("I couldn't hear that. You can type your answer instead."); } finally { setListening(false); }
  }

  if (phase === "intro") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="card overflow-hidden">
          <div className="module-quest grid h-44 place-items-center text-8xl" aria-hidden>{s.emoji}</div>
          <div className="p-6">
            <p className="text-sm font-bold uppercase tracking-widest text-vibe-purple-ink">📍 {s.place}</p>
            <p className="mt-2 text-lg">{s.intro}</p>
            <p className="mt-3 rounded-2xl bg-vibe-sun/15 p-3 font-semibold"><span aria-hidden>🎯</span> Your mission: {s.mission}</p>
            <p className="mt-3 flex items-center gap-2 text-sm text-vibe-lavender"><span className="text-3xl" aria-hidden>{s.character.emoji}</span> You'll talk with <b className="text-ink">{s.character.name}</b>.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="card p-5">
            <b className="font-display">🔤 Useful words</b>
            <div className="mt-2 flex flex-wrap gap-2">{s.words.map((w) => <button key={w.word} onClick={() => sayIt(w.word, true)} className="chip text-sm">{w.emoji} {w.word} 🔊</button>)}</div>
            <b className="mt-4 block font-display">💬 Useful phrases</b>
            <ul className="mt-2 space-y-1.5">{s.phrases.map((p) => <li key={p}><button onClick={() => sayIt(p.replace(/_+/g, "something"))} className="text-left text-sm hover:text-vibe-purple-ink">🔊 {p}</button></li>)}</ul>
          </div>
          <div className="card p-5">
            <b className="font-display">Choose your level</b>
            <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Level">
              {LEVELS.map(([k, l, d]) => (
                <button key={k} role="radio" aria-checked={level === k} onClick={() => setLevel(k)} className={`rounded-2xl border-2 p-3 text-left ${level === k ? "border-vibe-purple bg-vibe-purple/10" : "border-line/15"}`}>
                  <b>{l}</b>{k === suggested && <span className="chip ml-2 text-[11px]">Suggested</span>}<span className="block text-sm text-vibe-lavender">{d}</span>
                </button>
              ))}
            </div>
            <ErrorNote error={err} />
            <button className="btn-primary mt-4 w-full text-lg" onClick={start} disabled={busy}>{busy ? <InlineSpinner /> : "Start the adventure →"}</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="text-7xl" aria-hidden>🌟</div>
        <h2 className="title-lg mt-2">Mission complete, {name}!</h2>
        {result && <p className="mt-1 text-vibe-lavender">Conversation score: <b className="text-ink">{result.score}%</b></p>}
        <div className="card mt-6 p-5 text-left">
          <b className="font-display">What you practised</b>
          <ul className="mt-2 space-y-1">{s.reflection.map((r) => <li key={r}>✅ {r}</li>)}</ul>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn-ghost" onClick={() => { setPhase("intro"); setLog([]); setResult(null); }}>Play again</button>
          {level !== "advanced" && <button className="btn-primary" onClick={() => { setLevel(level === "beginner" ? "developing" : "advanced"); setPhase("intro"); setLog([]); }}>Try a harder level →</button>}
          <Link href="/world/real-life" className="btn-ghost">More adventures</Link>
        </div>
        {cele && result && <Celebration award={result.award} who="max" title="Real-life mission complete!" sound="complete" onClose={() => { setCele(false); router.refresh(); }} />}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center justify-between text-sm text-vibe-lavender">
        <span>{s.character.emoji} {s.character.name}</span>
        <span>{turn ? `Turn ${turn.index + 1} of ${run?.total}` : "…"}</span>
      </div>
      <div className="card space-y-3 p-4" aria-live="polite">
        {log.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            {m.from === "them" && (
              <div className="max-w-[85%] rounded-3xl rounded-tl-md bg-white px-4 py-3 text-vibe-night shadow-card">
                <span className="mr-1" aria-hidden>{s.character.emoji}</span>{m.text}
                <span className="ml-2 inline-flex gap-1"><button onClick={() => sayIt(m.text)} aria-label="Replay" className="rounded-full px-1.5 hover:bg-black/5">🔁</button><button onClick={() => sayIt(m.text, true)} aria-label="Slower" className="rounded-full px-1.5 hover:bg-black/5">🐢</button></span>
              </div>
            )}
            {m.from === "me" && <div className="max-w-[85%] rounded-3xl rounded-tr-md bg-vibe-cta px-4 py-3 text-white">{m.text}</div>}
            {m.from === "tip" && <div className={`w-full rounded-2xl p-3 text-sm font-semibold ${m.tone === "retry" ? "bg-vibe-sun/15 text-ink" : "bg-vibe-mint/15 text-vibe-mint-ink"}`}>💡 {m.text}</div>}
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {turn && (
        <div className="mt-4">
          <p className="mb-2 font-display font-bold">🎯 {turn.task}</p>
          {(!typing || level === "beginner") && (
            <div className={`grid gap-2 ${band <= 1 ? "" : "sm:grid-cols-2"}`}>
              {turn.options.map((o, i) => (
                <button key={i} disabled={busy} onClick={() => answer({ option: i, mode: "choice" }, o.text)} className={`card flex items-center gap-3 p-3 text-left font-semibold ${band <= 1 ? "text-lg" : ""}`}>
                  {o.emoji && <span className="text-3xl" aria-hidden>{o.emoji}</span>}<span>{o.text}</span>
                </button>
              ))}
            </div>
          )}
          {typing && level !== "beginner" && (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) answer({ text, mode: "text" }, text); }}>
              <input className="input flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your answer…" aria-label="Your answer" maxLength={300} disabled={busy} />
              <button className="btn-primary" disabled={busy || !text.trim()}>Send</button>
            </form>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {level !== "beginner" && <button className="btn-ghost btn-sm" onClick={() => setTyping(!typing)}>{typing ? "🔘 Show choices" : "✍️ Type my answer"}</button>}
            {level !== "beginner" && mic && <button className="btn-ghost btn-sm" onClick={speakAnswer} disabled={busy || listening}>{listening ? "🎙️ Listening…" : "🎤 Say it (optional)"}</button>}
            {canSkip && <button className="btn-sun btn-sm" onClick={() => answer({ mode: "text", skip: true }, "")}>Continue →</button>}
          </div>
          <ErrorNote error={err} />
        </div>
      )}
      {!turn && phase === "talk" && <p className="mt-4 text-center text-sm text-vibe-lavender">{s.character.name} is talking…</p>}
    </div>
  );
}
