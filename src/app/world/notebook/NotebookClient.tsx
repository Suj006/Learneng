"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, speak } from "@/lib/client";
import { CharacterSays, Spinner } from "@/components/ui";

type W = { id: string; word: string; emoji: string; phonetic: string; meaning: string; example: string; status: string; favourite: boolean; due_on: string; correct_count: number; wrong_count: number };
const FILTERS = [["all", "All"], ["due", "Due for revision"], ["discovered", "Discovered"], ["practising", "Practising"], ["mastered", "Mastered 👑"], ["favourite", "Favourites ❤️"]];
const BADGE: Record<string, string> = { discovered: "🌱 Discovered", practising: "🔁 Practising", mastered: "👑 Mastered" };

export function NotebookClient() {
  const params = useSearchParams();
  const [words, setWords] = useState<W[] | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState(params.get("filter") ?? "all");
  useEffect(() => { api<{ words: W[] }>("/api/words").then((r) => setWords(r.words)).catch(() => setWords([])); }, []);
  const today = new Date().toISOString().slice(0, 10);
  const isDue = (w: W) => w.due_on < today || (w.due_on === today && w.correct_count + w.wrong_count > 0);
  const list = useMemo(() => (words ?? []).filter((w) =>
    (!q || w.word.includes(q.toLowerCase()) || w.meaning.toLowerCase().includes(q.toLowerCase())) &&
    (filter === "all" || (filter === "due" ? isDue(w) : filter === "favourite" ? w.favourite : w.status === filter))), [words, q, filter, today]);
  if (!words) return <Spinner />;
  if (!words.length) return <div><CharacterSays who="lexi" mood="thinking">Your notebook is empty! Discover your first 10 words in the Daily Word Quest.</CharacterSays><Link href="/world/quest" className="btn-primary mt-4">Start the quest</Link></div>;
  const due = list.filter(isDue).map((w) => w.id).slice(0, 12);
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="🔍 Search words…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search words" />
        <div className="row-scroll flex-1 pb-0">{FILTERS.map(([k, l]) => <button key={k} onClick={() => setFilter(k)} className={`btn btn-sm shrink-0 ${filter === k ? "bg-vibe-cta text-white" : "btn-ghost"}`}>{l}</button>)}</div>
      </div>
      <p className="mt-3 text-sm text-vibe-lavender">{words.length} words · {words.filter((w) => w.status === "mastered").length} mastered{due.length ? <> · <Link className="text-vibe-aqua underline" href={`/world/revision?words=${due.join(",")}`}>Revise these {due.length} now</Link></> : null}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((w) => (
          <article key={w.id} className="glass p-4">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{w.emoji}</span>
              <div className="min-w-0 flex-1"><b className="font-display text-xl">{w.word}</b> <span className="text-xs text-vibe-aqua">{w.phonetic}</span><p className="text-sm">{w.meaning}</p></div>
              <button aria-label={w.favourite ? "Remove favourite" : "Add favourite"} onClick={async () => { await api("/api/words/favourite", { body: { wordId: w.id, favourite: !w.favourite } }); setWords(words.map((x) => (x.id === w.id ? { ...x, favourite: !x.favourite } : x))); }} className="text-2xl">{w.favourite ? "❤️" : "🤍"}</button>
            </div>
            <p className="mt-2 text-xs italic text-vibe-lavender">“{w.example}”</p>
            <div className="mt-3 flex items-center justify-between"><span className="chip">{BADGE[w.status]}</span><button className="btn-ghost btn-sm" onClick={() => speak(w.word)}>🔊</button></div>
          </article>
        ))}
      </div>
    </div>
  );
}
