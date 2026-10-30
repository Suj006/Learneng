"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WritingCanvas } from "@/components/play/WritingCanvas";

const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
const WORDS = ["suddenly", "mysterious", "brave", "glimmer", "astonished", "whispered", "enormous", "finally"];

export function StoryBuilderClient({ pools, minWords }: { pools: { characters: string[]; locations: string[]; objects: string[]; situations: string[] }; minWords: number }) {
  const roll = () => ({ character: pick(pools.characters), location: pick(pools.locations), object: pick(pools.objects), situation: pick(pools.situations) });
  // Roll after mount: random values must not differ between server and client render.
  const [s, setS] = useState({ character: pools.characters[0], location: pools.locations[0], object: pools.objects[0], situation: pools.situations[0] });
  useEffect(() => setS(roll()), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [go, setGo] = useState(false);
  if (go) {
    return <WritingCanvas kind="story_builder" meta={{ ...s, minWords: String(minWords), words: WORDS.join(",") }}
      topic={{ id: null, title: `A story about ${s.character}`, prompt: `Write a story with ${s.character} in ${s.location} who finds ${s.object}. Challenge: ${s.situation}! What happens next?`, minWords, words: WORDS }} />;
  }
  return (
    <div className="mx-auto max-w-3xl">
      <div className="grid gap-4 sm:grid-cols-2">
        {([["🧑‍🚀", "Character", s.character], ["🗺️", "Location", s.location], ["🗝️", "Object", s.object], ["⚡", "Challenge", s.situation]] as const).map(([e, l, v]) => (
          <motion.div key={l + v} initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} className="card p-5 text-center"><div className="text-4xl">{e}</div><div className="mt-2 text-xs uppercase text-vibe-lavender">{l}</div><div className="font-display text-xl font-bold">{v}</div></motion.div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><button className="btn-ghost" onClick={() => setS(roll())}>🎲 Spin again</button><button className="btn-primary text-lg" onClick={() => setGo(true)}>Start my story ✍️</button></div>
    </div>
  );
}
