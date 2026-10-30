"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/client";
import { ErrorNote, Progress, RarityBadge, RARITY } from "@/components/ui";

type Pet = { slug: string; name: string; emoji: string; personality: string; hint_style: string; unlock_label: string; unlock_target: number; rarity: string; nickname: string | null; growth: number | null; owned: boolean; active: boolean; stage: string; progress: number };
const NEXT = [20, 60, 150];

export function PetsClient({ pets }: { pets: Pet[] }) {
  const router = useRouter();
  const [names, setNames] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [said, setSaid] = useState<Record<string, boolean>>({});
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {pets.map((p) => {
        const nextGoal = NEXT.find((n) => (p.growth ?? 0) < n);
        return (
          <article key={p.slug} className={`card border-2 p-5 ${p.owned ? `${RARITY[p.rarity].ring} ${p.active ? "shadow-glow" : ""}` : "border-white/5"}`}>
            <div className="flex items-start justify-between">
              <motion.button whileTap={{ scale: 1.3, rotate: 10 }} onClick={() => setSaid({ ...said, [p.slug]: !said[p.slug] })} disabled={!p.owned} className={`text-6xl ${p.owned ? "" : "grayscale opacity-40"}`} aria-label={`Play with ${p.name}`}>{p.emoji}</motion.button>
              <RarityBadge rarity={p.rarity} />
            </div>
            <h2 className="mt-2 font-display text-xl font-bold">{p.owned ? (p.nickname ?? p.name) : p.name}{p.active && <span className="chip ml-2 text-vibe-mint">With you</span>}</h2>
            <p className="text-sm text-vibe-lavender">{p.personality}</p>
            {said[p.slug] && <p className="mt-2 rounded-2xl bg-white/10 p-2 text-sm">💬 “{p.hint_style}”</p>}
            {p.owned ? (
              <>
                <p className="mt-3 text-sm"><b>{p.stage}</b> stage · grows with every learning activity</p>
                {nextGoal && <Progress value={p.growth ?? 0} max={nextGoal} className="mt-1 h-2" />}
                <div className="mt-3 flex gap-2">
                  <input className="input py-2 text-sm" placeholder="Give a nickname" maxLength={20} value={names[p.slug] ?? ""} onChange={(e) => setNames({ ...names, [p.slug]: e.target.value })} />
                  <button className="btn-primary btn-sm" onClick={async () => { setErr(null); try { await api("/api/pets", { body: { slug: p.slug, nickname: names[p.slug] || undefined } }); router.refresh(); } catch (e) { setErr((e as Error).message); } }}>{p.active ? "Save" : "Choose"}</button>
                </div>
              </>
            ) : (
              <div className="mt-3 text-sm"><p>🔓 {p.unlock_label}</p><Progress value={p.progress} max={p.unlock_target} className="mt-1 h-2" /><p className="mt-1 text-xs text-vibe-lavender">{p.progress}/{p.unlock_target}</p></div>
            )}
          </article>
        );
      })}
      <div className="sm:col-span-2 lg:col-span-3"><ErrorNote error={err} /></div>
    </div>
  );
}
