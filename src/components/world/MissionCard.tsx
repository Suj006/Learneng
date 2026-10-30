"use client";
import Link from "next/link";
import { useState } from "react";
import { Character, type CharacterName } from "@/components/Character";
import { Celebration, Progress, type AwardLike } from "@/components/ui";
import { api } from "@/lib/client";

export interface MissionData { slug: string; scope: string; character: string; title: string; description: string; target: number; progress: number; done: boolean; claimed: boolean; href: string; xp: number; coins: number; crystals: number }

const SCOPE: Record<string, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly", character: "Character", mystery: "Mystery", event: "Event" };

export function MissionCard({ m, compact = false }: { m: MissionData; compact?: boolean }) {
  const [state, setState] = useState(m);
  const [award, setAward] = useState<{ result: AwardLike; card: { title: string; emoji: string } | null } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  async function claim() {
    setErr(null);
    try {
      const r = await api<{ result: AwardLike; card: { title: string; emoji: string } | null }>("/api/missions/claim", { body: { slug: m.slug } });
      setAward(r); setState({ ...state, claimed: true });
    } catch (e) { setErr((e as Error).message); }
  }
  return (
    <div className={`glass relative flex gap-3 p-4 ${state.done && !state.claimed ? "ring-2 ring-vibe-sun/70" : ""}`}>
      {!compact && <Character name={m.character as CharacterName} mood={state.done ? "celebrating" : "welcome"} size={56} still className="shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><span className="chip px-2 py-0.5 text-[10px] uppercase">{SCOPE[m.scope] ?? m.scope}</span><b className="font-display">{m.title}</b></div>
        <p className="mt-1 text-sm text-vibe-lavender/90">{m.description}</p>
        <div className="mt-2 flex items-center gap-2"><Progress value={state.progress} max={m.target} className="h-2" /><span className="shrink-0 text-xs font-bold">{state.progress}/{m.target}</span></div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-vibe-lavender">Reward: ⚡{m.xp} 🪙{m.coins}{m.crystals ? ` 💎${m.crystals}` : ""}</span>
          {state.claimed ? <span className="chip text-vibe-mint">✅ Claimed</span>
            : state.done ? <button onClick={claim} className="btn-sun btn-sm">Claim reward</button>
            : <Link href={m.href} className="btn-ghost btn-sm">Go →</Link>}
        </div>
        {err && <p className="mt-1 text-xs text-vibe-coral">{err}</p>}
      </div>
      {award && <Celebration award={award.result} who={m.character as CharacterName} title="Mission complete!" message={award.card ? <>New collectible card: {award.card.emoji} <b>{award.card.title}</b></> : "MAX: Mission completed! Your next adventure is ready."} onClose={() => setAward(null)} />}
    </div>
  );
}
