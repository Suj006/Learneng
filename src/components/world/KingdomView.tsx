"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Scene, type SceneName } from "@/components/Scenes";
import { Celebration, ErrorNote, InlineSpinner, PageTitle, Progress, type AwardLike } from "@/components/ui";
import { api } from "@/lib/client";

export interface Loc { slug: string; title: string; emoji: string; kind: string; x: number; y: number; open: boolean; hidden: boolean; claimed: boolean; defeated: boolean; href: string | null; unlock_label: string; progress: number; unlock_target: number; reward_crystals: number; reward_coins: number; bossLevel: number | null }

export function KingdomView({ k, level }: { k: { title: string; emoji: string; art: string; description: string; progress: number; locations: Loc[] }; level: number }) {
  const router = useRouter();
  const [sel, setSel] = useState<Loc | null>(null);
  const [award, setAward] = useState<{ a: AwardLike; title: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function claim(l: Loc) {
    if (busy) return;
    setErr(null); setBusy(true);
    try { const r = await api<{ result: AwardLike; title: string; emoji: string }>("/api/world/treasure", { body: { slug: l.slug } }); setAward({ a: r.result, title: `${r.emoji} ${r.title} opened!` }); }
    catch (e) { setErr(`${(e as Error).message} You can safely try again.`); } finally { setBusy(false); }
  }
  const icon = (l: Loc) => (l.hidden ? "❔" : !l.open ? "🔒" : l.kind === "treasure" ? (l.claimed ? "📭" : "🎁") : l.kind === "boss" ? (l.defeated ? "🏆" : l.emoji) : l.emoji);
  return (
    <div>
      <PageTitle title={`${k.emoji} ${k.title}`} subtitle={k.description} back="/world/map" right={<div className="w-40"><Progress value={k.progress} /><p className="mt-1 text-right text-xs">{k.progress}% explored</p></div>} />
      <div className="card relative aspect-[4/3] overflow-hidden sm:aspect-[16/9]">
        <div className="absolute inset-0"><Scene name={k.art as SceneName} /></div>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <polyline points={k.locations.map((l) => `${l.x},${l.y}`).join(" ")} fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
        </svg>
        {k.locations.map((l) => (
          <motion.button key={l.slug} onClick={() => setSel(l)} whileHover={{ scale: 1.1 }} animate={l.open && l.kind === "treasure" && !l.claimed ? { y: [0, -6, 0] } : undefined} transition={{ repeat: Infinity, duration: 1.6 }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-2 text-2xl shadow-card sm:p-3 sm:text-3xl ${l.open ? "border-vibe-sun bg-vibe-midnight/80" : "border-white/20 bg-vibe-midnight/60"}`}
            style={{ left: `${l.x}%`, top: `${l.y}%` }} aria-label={l.hidden ? "Hidden location" : l.title}>
            {icon(l)}
          </motion.button>
        ))}
      </div>
      {sel && (
        <div className="card mt-4 flex flex-wrap items-center gap-4 p-5">
          <span className="text-4xl">{icon(sel)}</span>
          <div className="flex-1">
            <b className="font-display text-lg">{sel.hidden ? "A hidden place…" : sel.title}</b>
            <p className="text-sm text-vibe-lavender">{sel.open ? (sel.kind === "treasure" ? (sel.claimed ? "You already opened this treasure." : `Contains 🪙${sel.reward_coins} and 💎${sel.reward_crystals}!`) : sel.kind === "boss" ? (sel.defeated ? "Boss defeated! Replay on a harder difficulty anytime." : "A boss battle awaits!") : "Open — go explore!") : `To unlock: ${sel.unlock_label} (${sel.progress}/${sel.unlock_target})`}</p>
            {!sel.open && <Progress value={sel.progress} max={sel.unlock_target} className="mt-2 h-2 max-w-xs" />}
            {sel.kind === "boss" && sel.bossLevel && level < sel.bossLevel && <p className="text-sm text-vibe-sun">Reach Level {sel.bossLevel} to battle.</p>}
          </div>
          {sel.open && sel.kind === "treasure" && !sel.claimed && <button className="btn-sun" disabled={busy} aria-busy={busy} onClick={() => claim(sel)}>{busy ? <><InlineSpinner /> Opening…</> : "Open treasure!"}</button>}
          {sel.open && (sel.kind === "secret" && !sel.claimed && sel.reward_crystals > 0) && <button className="btn-sun" onClick={() => claim(sel)}>Collect secret reward</button>}
          {sel.open && sel.href && <Link href={sel.href} className="btn-primary">{sel.kind === "boss" ? "Battle! ⚔️" : "Go →"}</Link>}
        </div>
      )}
      <ErrorNote error={err} />
      {award && <Celebration award={award.a} who="max" title={award.title} sound="treasure" onClose={() => { setAward(null); setSel(null); router.refresh(); }} />}
    </div>
  );
}
