"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { api, listenOnce, speak, speechAccuracy, speechRecognitionCtor, startTimer } from "@/lib/client";
import { Celebration, CharacterSays, Progress, type AwardLike } from "@/components/ui";

type Scenario = { slug: string; title: string; emoji: string; lines: string[] };

export function SpeakingArena({ scenarios, words }: { scenarios: Scenario[]; words: { word: string; example: string; phonetic: string; emoji: string }[] }) {
  const params = useSearchParams();
  const wordScenario: Scenario | null = words.length ? { slug: "word-practice", title: "My Word Practice", emoji: "🗝️", lines: words.map((w) => w.word) } : null;
  const [active, setActive] = useState<Scenario | null>(params.get("mode") === "words" ? wordScenario : null);
  const [i, setI] = useState(0);
  const [scores, setScores] = useState<(number | null)[]>([]);
  const [last, setLast] = useState<{ heard: string; score: number } | null>(null);
  const [listening, setListening] = useState(false);
  const [award, setAward] = useState<AwardLike | null>(null);
  const [timer, setTimer] = useState(() => startTimer());
  const supported = typeof window !== "undefined" && !!speechRecognitionCtor();

  const begin = (s: Scenario) => { setActive(s); setI(0); setScores([]); setTimer(() => startTimer()); };

  if (!active) {
    return (
      <div>
        <CharacterSays who="speaky" mood="welcome">Choose a real-life adventure! I'll say each line, then it's your turn. {supported ? "I'll listen and tell you how clear you sounded." : "Your browser can't do speech recognition, so we'll practise listen-and-repeat."}</CharacterSays>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {wordScenario && <button onClick={() => begin(wordScenario)} className="card p-5 text-center hover:-translate-y-1"><div className="text-5xl">🗝️</div><b className="mt-2 block font-display">My Word Practice</b><span className="text-xs text-vibe-lavender">Say your discovered words</span></button>}
          {scenarios.map((s) => <button key={s.slug} onClick={() => begin(s)} className="card p-5 text-center hover:-translate-y-1"><div className="text-5xl">{s.emoji}</div><b className="mt-2 block font-display">{s.title}</b><span className="text-xs text-vibe-lavender">{s.lines.length} lines</span></button>)}
        </div>
      </div>
    );
  }

  const finishLine = async (score: number | null) => {
    const next = [...scores, score];
    setScores(next);
    setLast(null);
    if (i + 1 < active.lines.length) return setI(i + 1);
    const assessed = next.filter((x): x is number => x !== null);
    const accuracy = assessed.length ? Math.round(assessed.reduce((a, b) => a + b, 0) / assessed.length) : null;
    try {
      const r = await api<{ award: AwardLike }>("/api/speaking", { body: { scenario: active.slug, lines: active.lines.length, accuracy, seconds: timer(), spokenText: active.lines.join(" ") } });
      setAward(r.award);
    } catch { /* progress UI still completes */ }
    setI(active.lines.length);
  };

  if (i >= active.lines.length) {
    const assessed = scores.filter((x): x is number => x !== null);
    const avg = assessed.length ? Math.round(assessed.reduce((a, b) => a + b, 0) / assessed.length) : null;
    return (
      <div className="mx-auto max-w-2xl">
        <CharacterSays who="speaky" mood="celebrating">{avg !== null ? `You finished “${active.title}” with ${avg}% clarity! ${avg >= 80 ? "Voice champion!" : "You're getting better every time!"}` : `You practised every line of “${active.title}”. Brilliant speaking!`}</CharacterSays>
        <div className="mt-6 flex gap-3"><button className="btn-primary" onClick={() => begin(active)}>Practise again</button><button className="btn-ghost" onClick={() => setActive(null)}>Other scenarios</button></div>
        {award && <Celebration award={award} who="speaky" title="Speaking mission complete!" onClose={() => setAward(null)} />}
      </div>
    );
  }

  const line = active.lines[i];
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center gap-3"><span className="text-4xl">{active.emoji}</span><b className="font-display text-xl">{active.title}</b></div>
      <Progress value={i} max={active.lines.length} className="mt-3" />
      <div className="card mt-6 p-6 text-center">
        <p className="font-display text-3xl font-bold">“{line}”</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn-ghost" onClick={() => speak(line, { rate: 0.85 })}>🔊 Listen</button>
          {supported ? (
            <button className="btn-primary" disabled={listening} onClick={async () => {
              setListening(true);
              try { const heard = await listenOnce(); setLast({ heard, score: speechAccuracy(line, heard) }); }
              catch { setLast({ heard: "", score: -1 }); }
              finally { setListening(false); }
            }}>{listening ? "🎙️ Listening…" : "🎙️ My turn — speak!"}</button>
          ) : <button className="btn-primary" onClick={() => finishLine(null)}>✅ I said it!</button>}
        </div>
        {last && (
          <div className="mt-5">
            {last.score < 0 ? <p className="text-vibe-sun">I couldn't hear you. Let's try once more!</p> : (
              <>
                <p className="text-sm text-vibe-lavender">I heard: “{last.heard}”</p>
                <p className={`mt-1 font-display text-2xl font-bold ${last.score >= 80 ? "text-vibe-mint" : last.score >= 50 ? "text-vibe-sun" : "text-vibe-coral"}`}>{last.score}% clear</p>
                <p className="text-sm">{last.score >= 80 ? "SPEAKY: Super clear! 🎉" : "SPEAKY: You're getting better! Listen once more and try again."}</p>
              </>
            )}
            <div className="mt-4 flex justify-center gap-2"><button className="btn-ghost btn-sm" onClick={() => setLast(null)}>Try again</button>{last.score >= 0 && <button className="btn-primary btn-sm" onClick={() => finishLine(last.score)}>Next line →</button>}</div>
          </div>
        )}
      </div>
    </div>
  );
}
