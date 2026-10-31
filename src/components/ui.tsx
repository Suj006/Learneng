"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { audio, type Speaker } from "@/lib/audio/manager";
import { LINES } from "@/lib/audio/lines";
import { Character, CHARACTER_INFO, type CharacterName, type Mood } from "./Character";
import { speak } from "@/lib/client";
import { BrandLogo } from "./BrandLogo";

export function SpeakButton({ text, label = "Listen", className = "" }: { text: string; label?: string; className?: string }) {
  return (
    <button type="button" onClick={() => speak(text)} className={`btn-ghost btn-sm ${className}`} aria-label={`${label}: ${text}`}>
      <span aria-hidden>🔊</span> {label}
    </button>
  );
}

export function CharacterSays({ who, mood = "welcome", children, size = 110, speakText, align = "left" }: { who: CharacterName; mood?: Mood; children: React.ReactNode; size?: number; speakText?: string; align?: "left" | "right" }) {
  return (
    <div className={`flex items-end gap-3 ${align === "right" ? "flex-row-reverse" : ""}`}>
      <Character name={who} mood={mood} size={size} className="shrink-0" />
      <motion.div initial={{ opacity: 0, y: 10, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="relative mb-6 max-w-xl rounded-3xl bg-white px-5 py-4 text-vibe-night shadow-card">
        <div className="mb-1 flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-vibe-night/80"><span className="h-2.5 w-2.5 rounded-full" style={{ background: CHARACTER_INFO[who].color }} aria-hidden />{CHARACTER_INFO[who].name}</div>
        <div className="text-base font-semibold leading-snug sm:text-lg">{children}</div>
        {speakText && <button type="button" onClick={() => speak(speakText, { who: who as Speaker, rate: 1, server: true })} className="-ml-2 mt-1 inline-flex min-h-[40px] items-center gap-1 rounded-full px-2 text-sm font-bold text-vibe-purple-ink hover:bg-vibe-purple/10" aria-label="Read aloud">🔊 Read to me</button>}
        <span className={`absolute bottom-3 h-4 w-4 rotate-45 bg-white ${align === "right" ? "-right-1.5" : "-left-1.5"}`} />
      </motion.div>
    </div>
  );
}

export function Progress({ value, max = 100, color = "bg-vibe-cta", className = "", label }: { value: number; max?: number; color?: string; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-glass/15 ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-valuetext={max === 100 ? `${Math.round(pct)}%` : `${value} of ${max}`} aria-label={label ?? "Progress"}>
      <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
    </div>
  );
}

export const RARITY: Record<string, { label: string; ring: string; text: string; glow: string }> = {
  common: { label: "Common", ring: "border-line/20", text: "text-ink-soft", glow: "" },
  rare: { label: "Rare", ring: "border-vibe-aqua/70", text: "text-vibe-aqua-ink", glow: "shadow-glow-aqua" },
  epic: { label: "Epic", ring: "border-vibe-purple-light", text: "text-vibe-purple-ink", glow: "shadow-glow" },
  legendary: { label: "Legendary", ring: "border-vibe-sun", text: "text-vibe-sun-ink", glow: "shadow-glow-sun" },
};
export function RarityBadge({ rarity }: { rarity: string }) {
  const r = RARITY[rarity] ?? RARITY.common;
  return <span className={`chip ${r.text}`}>{rarity === "legendary" ? "🌟" : rarity === "epic" ? "💜" : rarity === "rare" ? "💎" : "⚪"} {r.label}</span>;
}

export function BackLink({ href = "/world", label = "Back" }: { href?: string; label?: string }) {
  return <Link href={href} className="btn-ghost btn-sm shrink-0 whitespace-nowrap" aria-label={label}>← {label}</Link>;
}

export function PageTitle({ title, subtitle, back = "/world", right }: { title: string; subtitle?: string; back?: string | null; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {back && <BackLink href={back} />}
        <div>
          <h1 className="title-lg">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-vibe-lavender sm:text-base">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function ErrorNote({ error }: { error: string | null }) {
  if (!error) return null;
  return <p role="alert" className="mt-3 rounded-2xl bg-vibe-coral/15 px-4 py-3 text-sm font-semibold text-vibe-coral-ink">{error}</p>;
}

/** Small spinner for buttons that are working. */
export function InlineSpinner() {
  return <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" aria-hidden />;
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-vibe-lavender" role="status">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-line/15 border-t-vibe-aqua" />
      <span className="font-display">{label}</span>
    </div>
  );
}

// ── Celebrations ──────────────────────────────────────────────────────────

export interface AwardLike {
  xp?: number; coins?: number; crystals?: number; capped?: boolean; duplicate?: boolean; restReminder?: boolean;
  levelUp?: { id: number; name: string; coins: number; rewards: { title: string; emoji: string }[]; mission: string | null } | null;
  achievements?: { title: string; emoji: string }[];
  unlocks?: { kind: string; title: string; emoji: string }[];
}

const PARTICLES: Record<string, string[]> = { confetti: ["🎉", "✨", "🎊", "⭐"], stars: ["🌠", "⭐", "✨"], hearts: ["💖", "💜", "💛"], fireworks: ["🎆", "🎇", "✨", "💥"] };

export function Burst({ kind = "confetti" }: { kind?: string }) {
  const items = PARTICLES[kind] ?? PARTICLES.confetti;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden" aria-hidden>
      {Array.from({ length: 28 }, (_, i) => (
        <motion.span key={i} className="absolute text-2xl" style={{ left: `${(i * 37) % 100}%`, top: "-5%" }}
          initial={{ y: 0, opacity: 1, rotate: 0 }} animate={{ y: "110vh", opacity: [1, 1, 0], rotate: 360 * (i % 2 ? 1 : -1) }}
          transition={{ duration: 2.2 + (i % 5) * 0.3, delay: (i % 7) * 0.08, ease: "easeIn" }}>
          {items[i % items.length]}
        </motion.span>
      ))}
    </div>
  );
}

export interface RewardInfo { emoji: string; title: string; category?: string; cost?: { coins?: number; crystals?: number } }

/** Renders children straight into <body> so no ancestor (blur, transform, overflow) can clip or trap a modal. */
export function Portal({ children }: { children: React.ReactNode }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => setEl(document.body), []);
  return el ? createPortal(children, el) : null;
}

/**
 * The one reward celebration used everywhere (missions, quests, games, treasure, shop, level-ups).
 * Shown in a portal over the whole screen, scrolls inside on short screens, closes with Escape or the button,
 * and plays a matching sound plus a short character line.
 */
export function Celebration({ award, title, message, who = "max", onClose, celebration = "confetti", cta, reward, balance, sound }: {
  award?: AwardLike | null; title: string; message?: React.ReactNode; who?: CharacterName; onClose: () => void; celebration?: string; cta?: { href: string; label: string };
  reward?: RewardInfo; balance?: { coins: number; crystals: number }; sound?: "treasure" | "unlock" | "complete" | "celebrate";
}) {
  const level = award?.levelUp;
  const badges = award?.achievements?.length ?? 0;
  useEffect(() => {
    const kind = level ? "levelup" : sound ?? (badges ? "badge" : reward ? "unlock" : "celebrate");
    audio.sfx(kind);
    if (award?.coins) setTimeout(() => audio.sfx("coin"), 450);
    else if (award?.xp) setTimeout(() => audio.sfx("xp"), 450);
    const line = level ? LINES.levelUp : badges ? LINES.achievement : reward || sound === "treasure" ? LINES.reward : null;
    const t = line ? setTimeout(() => void audio.say(line.who, line.text, { server: true }), 700) : null;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    return () => { if (t) clearTimeout(t); document.removeEventListener("keydown", esc); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Portal>
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-vibe-night/55 p-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={title}>
        <Burst kind={level ? "fireworks" : celebration.replace("anim-", "")} />
        <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} className="card relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain p-6 text-center">
          <div className="absolute inset-0 -z-10 bg-vibe-hero opacity-80" />
          <div className="mx-auto mb-1 w-fit rounded-2xl bg-white px-2 py-1"><BrandLogo width={110} fallback="sm" /></div>
          {reward ? (
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: [0, 1.25, 1], rotate: 0 }} transition={{ duration: 0.7 }} className="mx-auto my-2 grid h-28 w-28 place-items-center rounded-full bg-glass/10 text-7xl shadow-glow-sun" aria-hidden>{reward.emoji}</motion.div>
          ) : <Character name={who} mood="celebrating" size={110} className="mx-auto" />}
          <h2 className="title-md mt-2">{level ? `LEVEL ${level.id}!` : title}</h2>
          {reward && (
            <div className="mt-1">
              <p className="font-display text-xl font-bold text-vibe-sun-ink">{reward.title}</p>
              {reward.category && <span className="chip mt-1">{reward.category}</span>}
            </div>
          )}
          {level && <p className="mt-1 font-display text-lg text-vibe-sun-ink">You are now {level.name}!</p>}
          {message && <div className="mt-2 text-vibe-lavender">{message}</div>}
          {award && (award.xp || award.coins || award.crystals) ? (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {!!award.xp && <span className="chip bg-vibe-purple/15 text-base text-vibe-purple-ink">⚡ +{award.xp} XP</span>}
              {!!award.coins && <span className="chip bg-vibe-sun/20 text-base text-vibe-sun-ink">🪙 +{award.coins}</span>}
              {!!award.crystals && <span className="chip bg-vibe-aqua/20 text-base text-vibe-aqua-ink">💎 +{award.crystals}</span>}
            </div>
          ) : null}
          {reward?.cost && (reward.cost.coins || reward.cost.crystals) ? (
            <p className="mt-3 text-sm text-vibe-lavender">Spent {reward.cost.coins ? `🪙 ${reward.cost.coins}` : ""}{reward.cost.crystals ? ` 💎 ${reward.cost.crystals}` : ""}</p>
          ) : null}
          {balance && <p className="mt-1 text-sm font-semibold">Your treasure now: <span className="text-vibe-sun-ink">🪙 {balance.coins}</span> · <span className="text-vibe-aqua-ink">💎 {balance.crystals}</span></p>}
          {award?.duplicate && <p className="mt-3 text-sm text-vibe-lavender">Rewards for this were already collected — great practice!</p>}
          {award?.capped && <p className="mt-3 text-sm text-vibe-lavender">You've collected today's rewards for this activity. Practising still makes you stronger! 💪</p>}
          {award?.restReminder && <p className="mt-3 rounded-2xl bg-vibe-mint/15 p-3 text-sm text-vibe-mint-ink">🌿 You've learned SO much today! Time to rest your eyes, play outside or read a book. See you tomorrow!</p>}
          {level && (level.rewards.length > 0 || level.coins > 0) && (
            <div className="mt-4 rounded-2xl bg-glass/5 p-3 text-left text-sm">
              <div className="font-display font-bold text-vibe-sun-ink">Level rewards</div>
              {level.coins > 0 && <div>🪙 {level.coins} bonus coins</div>}
              {level.rewards.map((r) => <div key={r.title}>{r.emoji} {r.title}</div>)}
              {level.mission && <div className="mt-1 text-vibe-aqua-ink">{level.mission}</div>}
            </div>
          )}
          {[...(award?.achievements ?? []), ...(award?.unlocks ?? [])].length > 0 && (
            <ul className="mt-4 space-y-1 text-left text-sm">
              {award?.achievements?.map((a) => <li key={a.title} className="rounded-xl bg-glass/5 px-3 py-2">🏅 {a.emoji} {a.title}</li>)}
              {award?.unlocks?.map((u) => <li key={u.title} className="rounded-xl bg-glass/5 px-3 py-2">{u.emoji} {u.title}</li>)}
            </ul>
          )}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {cta && <Link href={cta.href} className="btn-primary">{cta.label}</Link>}
            <button onClick={onClose} className={cta ? "btn-ghost" : "btn-primary"} autoFocus>Awesome!</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </Portal>
  );
}

/** Gentle break reminder after an age-appropriate session length (no pressure, no penalties). */
export function BreakReminder({ minutes }: { minutes: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), minutes * 60_000);
    return () => clearTimeout(t);
  }, [minutes]);
  if (!show) return null;
  return (
    <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md sm:bottom-6">
      <div className="card flex items-center gap-3 p-4">
        <Character name="speaky" mood="encouraging" size={64} still />
        <div className="flex-1 text-sm">
          <div className="font-display font-bold">Break time, Explorer! 🌿</div>
          You've been learning for {minutes} minutes. Stretch, drink water and rest your eyes. Your world will be right here!
        </div>
        <button className="btn-ghost btn-sm" onClick={() => setShow(false)}>OK</button>
      </div>
    </div>
  );
}
