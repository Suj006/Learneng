"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { api, speak, startTimer } from "@/lib/client";
import { Celebration, CharacterSays, ErrorNote, Progress, Spinner, type AwardLike } from "@/components/ui";
import { cheer } from "@/lib/audio/lines";
import { mistakeWords, spellingTip } from "@/lib/feedback";

/** Records an answer and gives gentle sound (and now and then voice) feedback — one place for every game. */
function pushResult<T extends { correct: boolean }>(arr: T[], r: T) { arr.push(r); cheer(r.correct); }

type W = { id: string; word: string; meaning: string; example: string; emoji: string; synonyms: string[]; antonyms: string[]; band: number; phonetic: string };
type Res = { score: number; max: number; results: { wordId: string; correct: boolean }[] };
type GameProps = { words: W[]; band: number; onDone: (r: Res) => void };

const shuffle = <T,>(a: T[]) => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; };
const tokenOf = (w: W) => (w.example.match(/[A-Za-z'-]+/g) ?? []).find((t) => t.toLowerCase().startsWith(w.word.toLowerCase().slice(0, Math.max(3, w.word.length - 2)))) ?? null;
const opts = (w: W, all: W[], f: (x: W) => string, n = 3) => shuffle([f(w), ...shuffle(all.filter((x) => x.id !== w.id)).slice(0, n).map(f)]);

/**
 * Shown after a wrong answer in every game: the child's choice, the correct answer, a short explanation and an
 * explicit Continue button. The game never moves on by itself after a mistake.
 */
export function MistakeReview({ chosen, correct, explain, band = 2, onContinue }: { chosen: string; correct: string; explain?: string; band?: number; onContinue: () => void }) {
  const m = mistakeWords(band, correct);
  return (
    <div className="mt-5 rounded-3xl border-2 border-vibe-sun/50 bg-vibe-sun/10 p-4 text-left" role="status" aria-live="polite">
      <p className="font-display text-lg font-bold">{m.title}</p>
      <p className="mt-1">You chose: <span className="font-semibold text-vibe-coral-ink line-through">{chosen}</span></p>
      <p>Correct answer: <span className="font-display text-lg font-bold text-vibe-mint-ink">✓ {correct}</span></p>
      {explain && <p className="mt-1 text-sm text-vibe-lavender">{explain}</p>}
      <p className="mt-2 text-sm"><b className="text-vibe-aqua-ink">LEXI:</b> {m.line}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-ghost btn-sm" onClick={() => speak(correct, { rate: 0.8 })}>🔊 Hear it</button>
        <button className="btn-primary btn-sm" onClick={onContinue} autoFocus>Continue →</button>
      </div>
    </div>
  );
}

function MCQ({ prompt, options, answer, onPick, emoji, sentence, explain, band = 2 }: { prompt: string; options: string[]; answer: string; onPick: (ok: boolean) => void; emoji?: string; sentence?: string; explain?: string; band?: number }) {
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => setPicked(null), [prompt, sentence, emoji]);
  const wrong = picked !== null && picked !== answer;
  return (
    <div>
      <p className="font-display text-2xl font-bold">{prompt}</p>
      {emoji && <div className="my-3 text-center text-7xl">{emoji}</div>}
      {sentence && <p className="glass my-3 p-4 text-lg font-semibold">{sentence}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <button key={o} disabled={!!picked} onClick={() => { setPicked(o); if (o === answer) setTimeout(() => onPick(true), 650); }}
            className={`rounded-2xl border p-4 text-left font-semibold transition ${picked ? (o === answer ? "border-vibe-mint bg-vibe-mint/20" : o === picked ? "border-vibe-coral bg-vibe-coral/20" : "opacity-50") : "border-line/10 bg-glass/5 hover:bg-glass/10"}`}>
            {picked && o === answer ? "✓ " : picked && o === picked ? "✗ " : ""}{o}</button>
        ))}
      </div>
      {wrong && <MistakeReview chosen={picked!} correct={answer} explain={explain} band={band} onContinue={() => onPick(false)} />}
    </div>
  );
}

/**
 * Picks a game's rounds ONCE per game. (Previously it re-shuffled whenever it received a new array; Word Detective
 * passed a freshly filtered array on every render, so each letter guess silently swapped the secret word.)
 */
function useRounds(words: W[], n: number) { const [r] = useState(() => shuffle(words).slice(0, Math.min(n, words.length))); return r; }

function SequenceGame({ words, onDone, n, render }: GameProps & { n: number; render: (w: W, done: (ok: boolean) => void) => React.ReactNode }) {
  const rounds = useRounds(words, n);
  const [i, setI] = useState(0);
  const res = useRef<Res["results"]>([]);
  const done = (ok: boolean) => {
    pushResult(res.current, { wordId: rounds[i].id, correct: ok });
    if (i + 1 < rounds.length) setI(i + 1);
    else onDone({ score: res.current.filter((r) => r.correct).length, max: rounds.length, results: res.current });
  };
  return <div><Progress value={i} max={rounds.length} className="mb-4" /><div key={i}>{render(rounds[i], done)}</div></div>;
}

const MissingWord = (p: GameProps) => (
  <SequenceGame {...p} n={8} render={(w, done) => {
    const t = tokenOf(w) ?? w.word;
    return <MCQ prompt="Which word completes the sentence?" sentence={w.example.replace(t, "_____")} options={opts({ ...w, word: t }, p.words, (x) => (x.id === w.id ? t : x.word))} answer={t} onPick={done} />;
  }} />
);

function PictureVocabulary({ words, band, onDone }: GameProps) {
  const rounds = useRounds(words, 6);
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "ok" | "no">("idle");
  const res = useRef<Res["results"]>([]);
  const w = rounds[i];
  const choices = useMemo(() => (w ? opts(w, words, (x) => x.word) : []), [w, words]);
  if (!w) return null;
  const [chosen, setChosen] = useState<string | null>(null);
  const advance = () => { setState("idle"); setDrag(null); setChosen(null); if (i + 1 < rounds.length) setI(i + 1); else onDone({ score: res.current.filter((r) => r.correct).length, max: rounds.length, results: res.current }); };
  const drop = (word: string) => {
    if (state !== "idle") return;
    const ok = word === w.word;
    setState(ok ? "ok" : "no"); setChosen(word); speak(w.word);
    pushResult(res.current, { wordId: w.id, correct: ok });
    if (ok) setTimeout(advance, 900); // a mistake waits for Continue (MistakeReview)
  };
  return (
    <div>
      <Progress value={i} max={rounds.length} className="mb-4" />
      <p className="font-display text-2xl font-bold">{band === 1 ? "Drag the word onto the picture!" : "Drag (or tap) the matching word onto the picture."}</p>
      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e.dataTransfer.getData("text"))} onClick={() => drag && drop(drag)}
        className={`mx-auto my-6 grid h-48 w-48 place-items-center rounded-[2.5rem] border-4 border-dashed text-8xl transition ${state === "ok" ? "border-vibe-mint bg-vibe-mint/20" : state === "no" ? "border-vibe-coral bg-vibe-coral/20" : "border-line/30 bg-glass/5"}`}>
        {w.emoji}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {choices.map((c) => (
          <button key={c} draggable onDragStart={(e) => e.dataTransfer.setData("text", c)} onClick={() => (drag === c ? drop(c) : setDrag(c))}
            className={`rounded-full border-2 px-5 py-3 font-display text-xl font-bold ${drag === c ? "border-vibe-aqua bg-vibe-aqua/30" : "border-line/20 bg-glass/10"}`}>{c}</button>
        ))}
      </div>
      {state === "no" && chosen ? <MistakeReview chosen={chosen} correct={w.word} explain={`${w.emoji} ${w.word} means: ${w.meaning}`} band={band} onContinue={advance} />
        : <p className="mt-4 text-center text-sm text-vibe-lavender">Tip: tap a word, then tap the picture.</p>}
    </div>
  );
}

function SpellMaster({ words, band, onDone }: GameProps) {
  const rounds = useRounds(words, 6);
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const [hint, setHint] = useState(false);
  const [fb, setFb] = useState<boolean | null>(null);
  const res = useRef<Res["results"]>([]);
  const w = rounds[i];
  useEffect(() => { if (w) setTimeout(() => speak(w.word, { rate: 0.75 }), 300); }, [w]);
  if (!w) return null;
  const next = () => { setFb(null); setTyped(""); setHint(false); if (i + 1 < rounds.length) setI(i + 1); else onDone({ score: res.current.filter((r) => r.correct).length, max: rounds.length, results: res.current }); };
  return (
    <div className="text-center">
      <Progress value={i} max={rounds.length} className="mb-4" />
      <div className="text-7xl">{w.emoji}</div>
      <button className="btn-primary mt-4" onClick={() => speak(w.word, { rate: 0.7 })}>🔊 Hear the word</button>
      <p className="mt-3 text-vibe-lavender">Meaning: {w.meaning}</p>
      {hint && <p className="mt-2 font-display text-2xl tracking-[0.4em]">{w.word[0]}{"_".repeat(w.word.length - 1)}</p>}
      <form className="mx-auto mt-4 flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); if (fb !== null) return next(); const ok = typed.trim().toLowerCase() === w.word.toLowerCase(); setFb(ok); pushResult(res.current, { wordId: w.id, correct: ok && !hint }); }}>
        <input className="input text-center text-2xl font-bold tracking-widest" value={typed} onChange={(e) => setTyped(e.target.value)} autoCapitalize="none" autoComplete="off" spellCheck={false} aria-label="Spell the word" disabled={fb !== null} />
        {fb !== false && <button className="btn-primary">{fb === null ? "Check" : "Next"}</button>}
      </form>
      {fb === null && !hint && <button className="mt-2 text-sm text-vibe-aqua-ink underline" onClick={() => setHint(true)}>Need a hint?</button>}
      {fb === true && <p className="mt-3 font-bold text-vibe-mint-ink">Spelled perfectly! ✨</p>}
      {fb === false && <MistakeReview chosen={typed || "(nothing typed)"} correct={w.word.toUpperCase()} explain={spellingTip(typed, w.word)} band={band} onContinue={next} />}
    </div>
  );
}

function WordRace({ words, onDone }: GameProps) {
  const [left, setLeft] = useState(60);
  const [q, setQ] = useState(() => shuffle(words)[0]);
  const res = useRef<Res["results"]>([]);
  const finished = useRef(false);
  useEffect(() => {
    const t = setInterval(() => setLeft((l) => {
      if (l <= 1 && !finished.current) { finished.current = true; clearInterval(t); const r = res.current; onDone({ score: r.filter((x) => x.correct).length, max: Math.max(r.length, 1), results: r }); }
      return Math.max(0, l - 1);
    }), 1000);
    return () => clearInterval(t);
  }, [onDone]);
  const options = useMemo(() => opts(q, words, (x) => x.meaning), [q, words]);
  return (
    <div>
      <div className="mb-4 flex items-center gap-3"><span className="font-display text-3xl font-bold text-vibe-sun-ink">⏱️ {left}s</span><Progress value={left} max={60} color="bg-vibe-sun" /><span className="chip">✅ {res.current.filter((r) => r.correct).length}</span></div>
      <MCQ prompt={`What does “${q.word}” mean?`} options={options} answer={q.meaning} onPick={(ok) => { pushResult(res.current, { wordId: q.id, correct: ok }); let n = shuffle(words)[0]; if (n.id === q.id && words.length > 1) n = words.find((x) => x.id !== q.id)!; setQ(n); }} />
    </div>
  );
}

function SentenceBuilder({ words, onDone }: GameProps) {
  const rounds = useMemo(() => shuffle(words.filter((w) => w.example.split(" ").length <= 9)).slice(0, 5), [words]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [fb, setFb] = useState<boolean | null>(null);
  const res = useRef<Res["results"]>([]);
  const w = rounds[i];
  const tokens = useMemo(() => (w ? shuffle(w.example.replace(/[.!?]+$/, "").split(" ").map((t, k) => ({ t, k }))) : []), [w]);
  if (!w) return <p>Discover more words with short example sentences to play this game!</p>;
  const target = w.example.replace(/[.!?]+$/, "");
  const built = picked.map((k) => tokens.find((x) => x.k === k)!.t).join(" ");
  return (
    <div>
      <Progress value={i} max={rounds.length} className="mb-4" />
      <p className="font-display text-2xl font-bold">Build the sentence using “{w.word}” {w.emoji}</p>
      <div className="glass my-4 min-h-16 p-4 text-xl font-semibold">{built || <span className="text-vibe-lavender">Tap the words in order…</span>}</div>
      <div className="flex flex-wrap gap-2">{tokens.map((x) => <button key={x.k} disabled={picked.includes(x.k) || fb !== null} onClick={() => setPicked([...picked, x.k])} className={`rounded-full border border-line/20 px-4 py-2 font-semibold ${picked.includes(x.k) ? "opacity-30" : "bg-glass/10"}`}>{x.t}</button>)}</div>
      <div className="mt-4 flex gap-2">
        <button className="btn-ghost btn-sm" disabled={!picked.length || fb !== null} onClick={() => setPicked(picked.slice(0, -1))}>↩ Undo</button>
        {fb === null
          ? <button className="btn-primary btn-sm" disabled={picked.length !== tokens.length} onClick={() => { const ok = built.toLowerCase() === target.toLowerCase(); setFb(ok); pushResult(res.current, { wordId: w.id, correct: ok }); }}>Check</button>
          : <button className="btn-primary btn-sm" onClick={() => { setFb(null); setPicked([]); if (i + 1 < rounds.length) setI(i + 1); else onDone({ score: res.current.filter((r) => r.correct).length, max: rounds.length, results: res.current }); }}>Next →</button>}
      </div>
      {fb !== null && <p className={`mt-3 font-bold ${fb ? "text-vibe-mint-ink" : "text-vibe-coral-ink"}`}>{fb ? "Perfect sentence! 🧱" : `Correct order: “${w.example}”`}</p>}
    </div>
  );
}

function WordDetective({ words, onDone }: GameProps) {
  const rounds = useRounds(words.filter((w) => !w.word.includes(" ")), 4);
  const [i, setI] = useState(0);
  const [guessed, setGuessed] = useState<string[]>([]);
  const res = useRef<Res["results"]>([]);
  const w = rounds[i];
  if (!w) return null;
  const letters = w.word.toLowerCase().split("");
  const solved = letters.every((l) => guessed.includes(l) || !/[a-z]/.test(l));
  const misses = guessed.filter((g) => !letters.includes(g)).length;
  const out = misses >= 6;
  const next = () => { pushResult(res.current, { wordId: w.id, correct: solved && misses <= 3 }); setGuessed([]); if (i + 1 < rounds.length) setI(i + 1); else onDone({ score: res.current.filter((r) => r.correct).length, max: rounds.length, results: res.current }); };
  return (
    <div className="text-center">
      <Progress value={i} max={rounds.length} className="mb-4" />
      <p className="font-display text-xl">🕵️ Case #{i + 1}: “{w.meaning}”</p>
      <p className="mt-1 text-sm text-vibe-lavender">Clue: it has {w.word.length} letters{misses >= 2 ? ` · picture clue: ${w.emoji}` : ""}{misses >= 4 ? ` · sounds like: ${w.phonetic}` : ""}</p>
      <div className="my-6 flex flex-wrap justify-center gap-2">{letters.map((l, k) => <span key={k} className="grid h-12 w-10 place-items-center rounded-xl bg-glass/10 font-display text-2xl font-bold uppercase">{guessed.includes(l) || solved || out ? l : ""}</span>)}</div>
      <p className="text-sm">Magnifying glass power: {"🔎".repeat(Math.max(0, 6 - misses))}</p>
      {solved || out ? (
        <div className="mt-4"><p className={`font-bold ${solved ? "text-vibe-mint-ink" : "text-vibe-sun-ink"}`}>{solved ? "Case solved! 🎉" : `The word was “${w.word}”. Great detective work!`}</p><button className="btn-primary mt-3" onClick={next}>Next case →</button></div>
      ) : (
        <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-1.5">{"abcdefghijklmnopqrstuvwxyz".split("").map((l) => <button key={l} disabled={guessed.includes(l)} onClick={() => setGuessed([...guessed, l])} className={`h-10 w-10 rounded-xl font-bold uppercase ${guessed.includes(l) ? (letters.includes(l) ? "bg-vibe-mint/40" : "bg-glass/5 opacity-40") : "bg-glass/10 hover:bg-glass/20"}`}>{l}</button>)}</div>
      )}
    </div>
  );
}

function WordHunter({ words, onDone }: GameProps) {
  const N = 9;
  const { grid, placed } = useMemo(() => {
    const g: string[][] = Array.from({ length: N }, () => Array(N).fill(""));
    const pl: { w: W; cells: string[] }[] = [];
    for (const w of shuffle(words.filter((x) => /^[a-z]+$/i.test(x.word) && x.word.length <= N))) {
      if (pl.length >= 5) break;
      const word = w.word.toUpperCase();
      for (let attempt = 0; attempt < 40; attempt++) {
        const horiz = Math.random() < 0.5;
        const r = Math.floor(Math.random() * (horiz ? N : N - word.length + 1));
        const c = Math.floor(Math.random() * (horiz ? N - word.length + 1 : N));
        const cells = word.split("").map((_, k) => (horiz ? [r, c + k] : [r + k, c]));
        if (cells.every(([y, x], k) => g[y][x] === "" || g[y][x] === word[k])) { cells.forEach(([y, x], k) => (g[y][x] = word[k])); pl.push({ w, cells: cells.map(([y, x]) => `${y}-${x}`) }); break; }
      }
    }
    for (const row of g) for (let k = 0; k < N; k++) if (!row[k]) row[k] = "ABCDEFGHIJKLMNOPRSTUVWY"[Math.floor(Math.random() * 23)];
    return { grid: g, placed: pl };
  }, [words]);
  const [start, setStart] = useState<string | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [timer] = useState(() => startTimer());
  const pick = (id: string) => {
    if (!start) return setStart(id);
    const [r1, c1] = start.split("-").map(Number); const [r2, c2] = id.split("-").map(Number);
    setStart(null);
    if (r1 !== r2 && c1 !== c2) return;
    const cells: string[] = [];
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) cells.push(`${r}-${c}`);
    const hit = placed.find((p) => !found.includes(p.w.id) && p.cells.length === cells.length && p.cells.every((x) => cells.includes(x)));
    if (hit) {
      const nf = [...found, hit.w.id]; setFound(nf); speak(hit.w.word);
      if (nf.length === placed.length) onDone({ score: placed.length, max: placed.length, results: placed.map((p) => ({ wordId: p.w.id, correct: timer() < 600 })) });
    }
  };
  const foundCells = new Set(placed.filter((p) => found.includes(p.w.id)).flatMap((p) => p.cells));
  return (
    <div className="grid gap-6 md:grid-cols-[auto_1fr]">
      <div className="mx-auto grid gap-1" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}>
        {grid.flatMap((row, r) => row.map((ch, c) => { const id = `${r}-${c}`; return <button key={id} onClick={() => pick(id)} className={`grid h-9 w-9 place-items-center rounded-lg font-display font-bold sm:h-11 sm:w-11 ${foundCells.has(id) ? "bg-vibe-mint/50" : start === id ? "bg-vibe-aqua" : "bg-glass/10 hover:bg-glass/20"}`}>{ch}</button>; }))}
      </div>
      <div>
        <p className="font-display text-lg">Tap the FIRST letter, then the LAST letter of each hidden word.</p>
        <ul className="mt-3 space-y-2">{placed.map((p) => <li key={p.w.id} className={`glass p-3 ${found.includes(p.w.id) ? "line-through opacity-60" : ""}`}>{p.w.emoji} {found.includes(p.w.id) ? p.w.word : `${p.w.word.length} letters — ${p.w.meaning}`}</li>)}</ul>
      </div>
    </div>
  );
}

function WordMatch({ words, onDone }: GameProps) {
  const pairs = useRounds(words, 5);
  const tiles = useMemo(() => shuffle(pairs.flatMap((w) => [{ id: w.id, kind: "w", text: w.word }, { id: w.id, kind: "m", text: w.meaning }])), [pairs]);
  const [sel, setSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [shake, setShake] = useState<number | null>(null);
  const tap = (k: number) => {
    const t = tiles[k];
    if (matched.includes(t.id)) return;
    if (sel === null) return setSel(k);
    const s = tiles[sel];
    if (s.id === t.id && s.kind !== t.kind) {
      const m = [...matched, t.id]; setMatched(m); setSel(null);
      if (m.length === pairs.length) onDone({ score: pairs.filter((p) => !wrong.includes(p.id)).length, max: pairs.length, results: pairs.map((p) => ({ wordId: p.id, correct: !wrong.includes(p.id) })) });
    } else { setWrong([...wrong, s.id, t.id]); setShake(k); setSel(null); setTimeout(() => setShake(null), 400); }
  };
  return (
    <div>
      <p className="mb-4 font-display text-xl">Tap a word, then tap its meaning.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((t, k) => (
          <motion.button key={k} animate={shake === k ? { x: [0, -8, 8, 0] } : {}} onClick={() => tap(k)} disabled={matched.includes(t.id)}
            className={`min-h-24 rounded-2xl border p-3 text-sm font-semibold transition ${matched.includes(t.id) ? "border-vibe-mint bg-vibe-mint/20 opacity-60" : sel === k ? "border-vibe-aqua bg-vibe-aqua/25" : t.kind === "w" ? "border-line/20 bg-vibe-purple/25 font-display text-lg" : "border-line/10 bg-glass/5"}`}>{t.text}</motion.button>
        ))}
      </div>
    </div>
  );
}

function TreasureHunt({ words, onDone }: GameProps) {
  const rounds = useRounds(words, 6);
  const [open, setOpen] = useState<number | null>(null);
  const [state, setState] = useState<Record<number, boolean>>({});
  if (open !== null) {
    const w = rounds[open];
    const syn = w.synonyms[0];
    return (
      <div>
        <button className="btn-ghost btn-sm mb-4" onClick={() => setOpen(null)}>← Back to the chests</button>
        {syn
          ? <MCQ prompt={`🗝️ Which word means almost the same as “${w.word}”?`} options={shuffle([syn, ...shuffle(words.filter((x) => x.id !== w.id && !w.synonyms.includes(x.word))).slice(0, 3).map((x) => x.word)])} answer={syn} onPick={(ok) => finish(ok)} />
          : <MCQ prompt={`🗝️ What does “${w.word}” mean?`} options={opts(w, words, (x) => x.meaning)} answer={w.meaning} onPick={(ok) => finish(ok)} />}
      </div>
    );
    function finish(ok: boolean) {
      const st = { ...state, [open!]: ok }; setState(st); setOpen(null);
      if (Object.keys(st).length === rounds.length) onDone({ score: Object.values(st).filter(Boolean).length, max: rounds.length, results: rounds.map((r, k) => ({ wordId: r.id, correct: !!st[k] })) });
    }
  }
  return (
    <div>
      <p className="mb-4 font-display text-xl">Each chest is locked by a word riddle. Open them all!</p>
      <div className="grid grid-cols-3 gap-4">
        {rounds.map((w, k) => (
          <button key={w.id} disabled={k in state} onClick={() => setOpen(k)} className="card flex aspect-square flex-col items-center justify-center text-6xl transition hover:-translate-y-1">
            {k in state ? (state[k] ? "💎" : "🪨") : "🧰"}<span className="mt-2 text-sm font-bold">{k in state ? (state[k] ? "Gem found!" : "Try again next time") : w.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function BossBattleGame({ words, onDone }: GameProps) {
  const rounds = useRounds(words, 10);
  const [i, setI] = useState(0);
  const [hp, setHp] = useState(100);
  const res = useRef<Res["results"]>([]);
  const w = rounds[i];
  const kinds = ["meaning", "antonym", "picture"] as const;
  const kind = w && w.antonyms.length && i % 3 === 1 ? "antonym" : kinds[i % 3] === "antonym" ? "meaning" : kinds[i % 3];
  const pick = (ok: boolean) => {
    pushResult(res.current, { wordId: w.id, correct: ok });
    const nh = ok ? Math.max(0, hp - Math.ceil(100 / rounds.length) - 2) : hp;
    setHp(nh);
    if (i + 1 < rounds.length && nh > 0) setI(i + 1);
    else onDone({ score: res.current.filter((r) => r.correct).length, max: rounds.length, results: res.current });
  };
  if (!w) return null;
  return (
    <div>
      <div className="glass mb-6 flex items-center gap-4 p-4"><motion.span key={hp} animate={{ x: [0, -6, 6, 0] }} className="text-6xl">👾</motion.span><div className="flex-1"><div className="flex justify-between text-sm font-bold"><span>Gloom Giant</span><span>{hp}%</span></div><Progress value={hp} color="bg-vibe-coral" /></div></div>
      {kind === "antonym" ? <MCQ prompt={`⚡ Opposite of “${w.word}”?`} options={shuffle([w.antonyms[0], ...shuffle(words.filter((x) => x.id !== w.id)).slice(0, 3).map((x) => x.word)])} answer={w.antonyms[0]} onPick={pick} />
        : kind === "picture" ? <MCQ prompt="⚡ Which word is this?" emoji={w.emoji} options={opts(w, words, (x) => x.word)} answer={w.word} onPick={pick} />
        : <MCQ prompt={`⚡ “${w.word}” means…`} options={opts(w, words, (x) => x.meaning)} answer={w.meaning} onPick={pick} />}
    </div>
  );
}

const GAMES: Record<string, (p: GameProps) => React.ReactElement | null> = {
  "word-match": WordMatch, "spell-master": SpellMaster, "missing-word": MissingWord, "picture-vocabulary": PictureVocabulary, "word-race": WordRace,
  "sentence-builder": SentenceBuilder, "word-detective": WordDetective, "word-hunter": WordHunter, "treasure-hunt": TreasureHunt, "boss-battle": BossBattleGame,
};

/** Easier alternative formats practising the same skill (offered after a tricky round). */
const ALTERNATIVE: Record<string, [string, string]> = {
  "spell-master": ["word-detective", "Word Detective (letter clues)"], "word-race": ["word-match", "Word Match (no timer)"], "sentence-builder": ["missing-word", "Missing Word"],
  "missing-word": ["picture-vocabulary", "Picture Vocabulary"], "word-hunter": ["word-match", "Word Match"], "boss-battle": ["treasure-hunt", "Word Treasure Hunt"],
  "word-detective": ["picture-vocabulary", "Picture Vocabulary"], "treasure-hunt": ["word-match", "Word Match"], "word-match": ["picture-vocabulary", "Picture Vocabulary"],
};

export function GameRunner({ slug }: { slug: string }) {
  const router = useRouter();
  const [words, setWords] = useState<W[] | null>(null);
  const [band, setBand] = useState(2);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<(Res & { award: AwardLike; best: number }) | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [cele, setCele] = useState(false);
  const timer = useRef(startTimer());
  useEffect(() => { api<{ words: W[] }>("/api/words").then((r) => { setWords(r.words); setBand(Math.round(r.words.reduce((s, w) => s + w.band, 0) / Math.max(1, r.words.length)) || 2); }).catch((e) => setErr(e.message)); }, []);
  const Game = GAMES[slug];
  if (err) return <ErrorNote error={err} />;
  if (!words) return <Spinner label="Loading your words…" />;
  if (words.length < 3) return <div><CharacterSays who="max" mood="hint">You need a few more words to play! Discover today's words first.</CharacterSays><Link href="/world/quest" className="btn-primary mt-4">Daily Word Quest</Link></div>;
  const finish = async (r: Res) => {
    try { const s = await api<{ award: AwardLike; best: number }>("/api/games/result", { body: { slug, score: r.score, max: r.max, seconds: timer.current(), results: r.results } }); setResult({ ...r, ...s }); setCele(true); }
    catch (e) { setErr((e as Error).message); }
  };
  return (
    <div className="mx-auto max-w-4xl">
      {result ? (
        <div className="card p-6 text-center">
          <h2 className="title-lg">{result.score}/{result.max}</h2><p className="mt-1 text-vibe-lavender">Your best score: {result.best}</p>
          {result.score / result.max < 0.5 && ALTERNATIVE[slug] && (
            <div className="mx-auto mt-4 max-w-md"><CharacterSays who="max" mood="encouraging" size={70}>That one was tricky! Want to warm up with <Link className="font-bold text-vibe-purple-ink underline" href={`/world/arcade/${ALTERNATIVE[slug][0]}`}>{ALTERNATIVE[slug][1]}</Link> first?</CharacterSays></div>
          )}
          <div className="mt-6 flex justify-center gap-3"><button className="btn-primary" onClick={() => { setResult(null); setRound(round + 1); timer.current = startTimer(); }}>Play again 🔁</button><Link href="/world/arcade" className="btn-ghost">More games</Link></div>
          {cele && <Celebration award={result.award} who="max" title={result.score / result.max >= 0.8 ? "Amazing game!" : "Great practice!"} message={`You scored ${result.score} out of ${result.max}.`} onClose={() => { setCele(false); router.refresh(); }} />}
        </div>
      ) : (
        <div className="card p-5 sm:p-8" key={round}>{Game ? <Game words={words} band={band} onDone={finish} /> : <p>Game not found.</p>}</div>
      )}
    </div>
  );
}
