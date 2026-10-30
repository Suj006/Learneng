"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { WordCard, type WordData } from "@/components/play/WordCard";
import { Question } from "@/components/play/Question";
import { Celebration, CharacterSays, ErrorNote, PageTitle, Progress, Spinner, type AwardLike } from "@/components/ui";
import { api, startTimer } from "@/lib/client";

type QQ = { key: string; wordId: string; type: string; round: number; prompt: string; options?: string[]; emoji?: string; speak?: string; sentence?: string };
interface Data { session: { completed: boolean; cardsViewed: number }; newWords: WordData[]; reviewWords: WordData[]; questions: QQ[]; answered: { key: string; correct: boolean }[]; assessmentDay: boolean }

const ROUNDS = ["", "Vocabulary Quiz", "Picture Matching", "Spelling Challenge", "Sentence Building", "Final Word Challenge"];

export function QuestClient() {
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [phase, setPhase] = useState<"intro" | "learn" | "quiz" | "done">("intro");
  const [card, setCard] = useState(0);
  const [qi, setQi] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; answer: string } | null>(null);
  const [score, setScore] = useState({ c: 0, n: 0 });
  const [result, setResult] = useState<{ accuracy: number; award: AwardLike; bandChange: { from: number; to: number } | null } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [elapsed] = useState(() => startTimer());

  useEffect(() => {
    api<Data>("/api/quest").then((d) => {
      setData(d);
      if (d.session.completed) setPhase("done");
    }).catch((e) => setErr(e.message));
  }, []);
  const pending = useMemo(() => (data ? data.questions.filter((q) => !data.answered.some((a) => a.key === q.key)) : []), [data]);

  if (err && !data) return <ErrorNote error={err} />;
  if (!data) return <Spinner label="LEXI is gathering today's words…" />;

  if (data.assessmentDay && data.newWords.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageTitle title="Daily Word Quest" />
        <CharacterSays who="lexi" mood="excited">Today is <b>Weekly Assessment day</b>! No new words — show me everything you learned this week instead.</CharacterSays>
        <div className="mt-6 flex gap-3"><Link href="/world/challenge/weekly" className="btn-primary">Start the Weekly Quest 🏅</Link><Link href="/world/revision" className="btn-ghost">Revise first</Link></div>
      </div>
    );
  }
  if (data.newWords.length === 0 && data.reviewWords.length === 0) {
    return (
      <div className="mx-auto max-w-2xl"><PageTitle title="Daily Word Quest" />
        <CharacterSays who="lexi" mood="thinking">Wow — you've discovered every word in my library right now! New words are being prepared by the PING VIBE team. Meanwhile, let's master the ones you know.</CharacterSays>
        <Link href="/world/revision" className="btn-primary mt-6">Revision Boost</Link></div>
    );
  }

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-3xl">
        <PageTitle title="Daily Word Quest" subtitle={`${data.newWords.length} new words${data.reviewWords.length ? ` + ${data.reviewWords.length} to revise` : ""}`} />
        <CharacterSays who="lexi" mood="excited" size={140} speakText="Hi Explorer! I found new words for you today!">Hi Explorer! I found <b>{data.newWords.length} brand-new words</b> for you today. First we'll meet each word, then play 5 quick challenge rounds. Ready?</CharacterSays>
        <div className="mt-6 flex flex-wrap gap-2">{data.newWords.map((w) => <span key={w.id} className="chip text-base">{w.emoji} ?</span>)}</div>
        <button className="btn-primary mt-8 w-full text-lg" onClick={() => setPhase(data.session.cardsViewed >= data.newWords.length && data.answered.length ? "quiz" : "learn")}>{data.answered.length ? "Continue my quest →" : "Meet today's words →"}</button>
      </div>
    );
  }

  if (phase === "learn") {
    const w = data.newWords[card];
    return (
      <div className="mx-auto max-w-3xl">
        <Progress value={card + 1} max={data.newWords.length} label="Words learned" />
        <div className="mt-6"><WordCard w={w} index={card} total={data.newWords.length} /></div>
        <div className="mt-6 flex justify-between">
          <button className="btn-ghost" disabled={card === 0} onClick={() => setCard(card - 1)}>← Back</button>
          {card + 1 < data.newWords.length
            ? <button className="btn-primary" onClick={() => { setCard(card + 1); api("/api/quest/view", { body: { count: card + 2 } }).catch(() => {}); }}>Next word →</button>
            : <button className="btn-sun" onClick={() => { api("/api/quest/view", { body: { count: data.newWords.length } }).catch(() => {}); setPhase("quiz"); }}>Start the challenge rounds! 🎯</button>}
        </div>
      </div>
    );
  }

  if (phase === "quiz" && pending.length) {
    const q = pending[Math.min(qi, pending.length - 1)];
    const answer = async (a: string) => {
      try {
        const r = await api<{ correct: boolean; answer: string }>("/api/quest/answer", { body: { wordId: q.wordId, type: q.type, answer: a } });
        setFeedback({ correct: r.correct, answer: r.answer });
        setScore((s) => ({ c: s.c + (r.correct ? 1 : 0), n: s.n + 1 }));
      } catch (e) { setErr((e as Error).message); }
    };
    const next = () => {
      setFeedback(null);
      setData({ ...data, answered: [...data.answered, { key: q.key, correct: !!feedback?.correct }] });
      setQi(0);
    };
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3"><span className="chip text-vibe-sun">Round {q.round}: {ROUNDS[q.round]}</span><span className="text-sm font-bold">{data.answered.length + 1}/{data.questions.length}</span></div>
        <Progress value={data.answered.length} max={data.questions.length} className="mt-3" />
        <div className="card mt-6 p-6"><Question q={q} onAnswer={answer} feedback={feedback} /></div>
        {feedback && !feedback.correct && (() => {
          const w = [...data.newWords, ...data.reviewWords].find((x) => x.id === q.wordId);
          return w ? <div className="mt-4"><CharacterSays who="lexi" mood="hint" size={80} speakText={`${w.word}. ${w.explanation} For example: ${w.example}`}>
            <span className="text-2xl">{w.emoji}</span> <b>{w.word}</b> ({w.phonetic}) — {w.explanation} <i>“{w.example}”</i></CharacterSays></div> : null;
        })()}
        {feedback && <button className="btn-primary mt-4 w-full" onClick={next} autoFocus>Next →</button>}
        <ErrorNote error={err} />
      </div>
    );
  }

  if (phase === "quiz" && !pending.length && !result) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <CharacterSays who="lexi" mood="celebrating">All rounds done! Let's count your treasure…</CharacterSays>
        <button className="btn-sun mt-6 text-lg" onClick={async () => { try { setResult(await api("/api/quest/complete", { body: { seconds: elapsed() } })); setPhase("done"); } catch (e) { setErr((e as Error).message); } }}>Finish quest & collect XP ⚡</button>
        <ErrorNote error={err} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle title="Daily Word Quest" />
      <CharacterSays who="lexi" mood="celebrating">Quest complete for today! Your new words are in your Vocabulary Notebook. Come back tomorrow for {data.newWords.length || 10} more!</CharacterSays>
      <div className="mt-6 flex flex-wrap gap-3"><Link href="/world" className="btn-primary">Open the Surprise Box 🎁</Link><Link href="/world/arcade" className="btn-ghost">Play word games</Link><Link href="/world/notebook" className="btn-ghost">My notebook</Link></div>
      {result && <Celebration award={result.award} who="lexi" title="Daily Word Quest complete!" message={<>Accuracy: <b>{result.accuracy}%</b>{result.bandChange && result.bandChange.to > result.bandChange.from ? " · 🚀 Challenge unlocked: harder words tomorrow!" : ""}</>} onClose={() => { setResult(null); router.refresh(); }} />}
    </div>
  );
}
