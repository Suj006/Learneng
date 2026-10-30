"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Character, type CharacterName } from "@/components/Character";
import { Avatar, type AvatarArt, type AvatarLook } from "@/components/Avatar";
import { Scene, type SceneName } from "@/components/Scenes";
import { Celebration, Progress, type AwardLike } from "@/components/ui";
import { MissionCard, type MissionData } from "./MissionCard";
import { BrandLogo } from "@/components/BrandLogo";
import { api } from "@/lib/client";

export interface AdventureData {
  name: string; buddy: CharacterName; evolution: number; avatar: AvatarLook; art: AvatarArt; pet: { emoji: string; name: string; nickname: string | null; hint_style: string } | null;
  memory: { who: CharacterName; line: string }[]; welcomeBack: number | null;
  journey: { day: number; planDay: number; year: number; theme: { title: string; emoji: string }; focus: string; items: { type: string; title: string; emoji: string; href: string; detail: string; done: boolean; core: boolean; adapted?: string }[]; dayComplete: boolean; completedToday: boolean };
  missions: MissionData[]; recs: { title: string; reason: string; href: string; emoji: string; who: CharacterName }[];
  events: { slug: string; title: string; emoji: string; description: string }[];
  kingdoms: { slug: string; title: string; emoji: string; art: string; unlocked: boolean; unlock_level: number; progress: number; href: string }[];
  status: Record<string, number>; skills: { key: string; title: string; level: string }[]; missionOfDay: string; dueWords: number;
  choices: readonly { key: string; title: string; emoji: string; who: string }[];
  family: { id: string; title: string; message: string }[];
}

const EVOLUTION = ["", "🌟", "👑", "🌈"];

export function Adventure({ d }: { d: AdventureData }) {
  const router = useRouter();
  const [memIdx, setMemIdx] = useState(0);
  const [award, setAward] = useState<{ a: AwardLike; title: string; msg?: React.ReactNode } | null>(null);
  const [busyChoice, setBusyChoice] = useState<string | null>(null);
  const [status, setStatus] = useState(d.status);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (d.memory.length < 2) return;
    const t = setInterval(() => setMemIdx((i) => (i + 1) % d.memory.length), 7000);
    return () => clearInterval(t);
  }, [d.memory.length]);
  const mem = d.welcomeBack ? { who: "max" as CharacterName, line: `Welcome back, ${d.name}! Your world is waiting for you. Let's start with a quick warm-up — your rewards are all safe!` } : d.memory[memIdx];
  const main = d.journey.items.find((i) => !i.done) ?? null;
  const done = d.journey.items.filter((i) => i.done).length;

  async function choose(key: string) {
    setBusyChoice(key); setErr(null);
    try { const r = await api<{ href: string }>("/api/adventure", { body: { choice: key } }); router.push(r.href); }
    catch (e) { setErr((e as Error).message); setBusyChoice(null); }
  }
  async function surprise() {
    setErr(null);
    try { const r = await api<{ award: AwardLike; fact: string }>("/api/surprise", { body: {} }); setStatus({ ...status, surprise_open: 1 }); setAward({ a: r.award, title: "Surprise Box opened! 🎁", msg: <>Word fact: {r.fact}</> }); }
    catch (e) { setErr((e as Error).message); }
  }
  async function realLife() {
    try { const r = await api<{ award: AwardLike }>("/api/mission", { body: {} }); setStatus({ ...status, mission_done: 1 }); setAward({ a: r.award, title: "Real-life mission done! 🌍" }); }
    catch (e) { setErr((e as Error).message); }
  }

  const modules: { title: string; emoji: string; href: string; desc: string; status: string; pct: number; skill?: string }[] = [
    { title: "Daily Word Quest", emoji: "🗝️", href: "/world/quest", desc: "10 new words with LEXI", status: status.quest_done ? "Done today ✅" : "Ready!", pct: status.quest_done ? 100 : 0, skill: "vocabulary" },
    { title: "Vocabulary Kingdom", emoji: "📒", href: "/world/notebook", desc: "Your word notebook & revision", status: `${status.mastered}/${status.words} mastered`, pct: status.words ? (status.mastered / status.words) * 100 : 0, skill: "vocabulary" },
    { title: "Creative Writing Studio", emoji: "✍️", href: "/world/writing", desc: "Write & get GRAMMY feedback", status: `${status.writing} pieces`, pct: Math.min(100, status.writing * 10), skill: "writing" },
    { title: "Grammar Galaxy", emoji: "🪐", href: "/world/grammar", desc: "Grammar missions + endless drills", status: `${status.grammar_done}/${status.grammar_total} missions`, pct: (status.grammar_done / Math.max(1, status.grammar_total)) * 100, skill: "grammar" },
    { title: "Speaking Arena", emoji: "🎤", href: "/world/speaking", desc: "Listen, repeat, talk!", status: `${status.speaking} sessions`, pct: Math.min(100, status.speaking * 10), skill: "speaking" },
    { title: "Reading Adventures", emoji: "📚", href: "/world/reading", desc: "Stories + quizzes", status: `${status.reading_done}/${status.reading_total} stories`, pct: (status.reading_done / Math.max(1, status.reading_total)) * 100, skill: "reading" },
    { title: "Word Games Arcade", emoji: "🕹️", href: "/world/arcade", desc: "10 games with your words", status: `${status.games} games played`, pct: Math.min(100, status.games * 5) },
    { title: "Story Builder", emoji: "📜", href: "/world/story-builder", desc: "Mix a character, place & object", status: `${status.stories} stories`, pct: Math.min(100, status.stories * 20), skill: "writing" },
    { title: "Listening Lab", emoji: "🎧", href: "/world/listening", desc: "Train your super-ears", status: "Hear it, pick it", pct: 0, skill: "listening" },
    { title: "My Rewards", emoji: "🎁", href: "/world/rewards", desc: "Shop, achievements & museum", status: `${status.rewards} items owned`, pct: 0 },
  ];
  const skillOf = (k?: string) => d.skills.find((s) => s.key === k)?.level;

  return (
    <div className="space-y-10">
      {/* HERO GREETING */}
      <section className="card relative overflow-hidden p-5 sm:p-8">
        <div className="absolute inset-0 opacity-30"><Scene name="islands" /></div>
        <div className="absolute inset-0 bg-gradient-to-r from-vibe-midnight via-vibe-midnight/80 to-transparent" />
        <div className="relative grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
          <div className="relative mx-auto">
            <Character name={mem?.who ?? d.buddy} mood={d.welcomeBack ? "encouraging" : d.journey.completedToday ? "celebrating" : "welcome"} size={150} />
            {d.evolution > 0 && <span className="absolute -right-1 top-2 text-2xl" title={`Buddy evolution stage ${d.evolution}`}>{EVOLUTION[d.evolution]}</span>}
          </div>
          <div>
            <motion.p key={mem?.line} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="font-display text-2xl font-bold sm:text-3xl">{mem?.line}</motion.p>
            <p className="mt-2 text-vibe-lavender">Day {d.journey.day} of your journey · {d.journey.theme.emoji} {d.journey.theme.title} week · {d.journey.focus}</p>
            <div className="mt-4 flex items-center gap-3"><Progress value={done} max={d.journey.items.length} className="max-w-xs" label="Today's plan" /><span className="text-sm font-bold">{done}/{d.journey.items.length}</span></div>
            {main ? (
              <Link href={main.href} className="btn-primary mt-5 text-lg">{main.emoji} {main.core ? "Today's main mission" : "Next"}: {main.title} →</Link>
            ) : (
              <p className="mt-5 rounded-2xl bg-vibe-mint/15 p-3 font-semibold text-vibe-mint">🎉 Today's plan is complete! Free play below — or rest and come back tomorrow for Day {d.journey.day + 1}.</p>
            )}
          </div>
          <div className="hidden md:block"><Avatar look={d.avatar} art={d.art} size={130} pet={d.pet?.emoji} /></div>
        </div>
      </section>

      {d.welcomeBack && (
        <section className="glass flex flex-wrap items-center gap-4 p-5">
          <span className="text-3xl">🌈</span>
          <div className="flex-1"><b className="font-display">Gentle recap</b><p className="text-sm text-vibe-lavender">It's been {d.welcomeBack} days — no worries! Your journey continues right where you left off. Want a quick revision of earlier words first?</p></div>
          <Link href="/world/revision" className="btn-sun btn-sm">Revise first</Link>
          <Link href={main?.href ?? "/world/quest"} className="btn-ghost btn-sm">Start something new</Link>
        </section>
      )}

      {/* CHOOSE YOUR ADVENTURE */}
      <section aria-labelledby="choose">
        <h2 id="choose" className="title-md">🧭 What kind of adventure are you in the mood for today?</h2>
        <div className="row-scroll mt-4">
          {d.choices.map((c) => (
            <button key={c.key} onClick={() => choose(c.key)} disabled={!!busyChoice} className="card group flex w-44 shrink-0 snap-start flex-col items-center gap-2 p-4 text-center transition hover:-translate-y-1 hover:shadow-glow">
              <Character name={c.who as CharacterName} mood={busyChoice === c.key ? "excited" : "welcome"} size={70} still={busyChoice !== c.key} />
              <span className="text-2xl">{c.emoji}</span><span className="font-display font-bold leading-tight">{c.title}</span>
            </button>
          ))}
        </div>
        {err && <p className="mt-2 text-sm text-vibe-coral">{err}</p>}
      </section>

      {/* TODAY'S PLAN */}
      <section aria-labelledby="plan">
        <div className="flex items-end justify-between"><h2 id="plan" className="title-md">🗓️ Today's Adventure Plan</h2><Link href="/world/calendar" className="text-sm font-bold text-vibe-aqua">365-day calendar →</Link></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {d.journey.items.map((i, k) => (
            <Link key={k} href={i.href} className={`glass flex items-start gap-3 p-4 transition hover:bg-white/10 ${i.done ? "opacity-70" : ""}`}>
              <span className="text-3xl">{i.done ? "✅" : i.emoji}</span>
              <span><b className="block font-display">{i.title}</b><span className="text-sm text-vibe-lavender/90">{i.detail}</span>
                {i.core && !i.done && <span className="mt-1 block text-xs font-bold text-vibe-sun">★ Main mission</span>}
                {i.adapted && <span className="mt-1 block text-xs font-bold text-vibe-aqua">✨ {i.adapted}</span>}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* REWARDS AVAILABLE */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="card flex flex-col p-5">
          <div className="text-4xl">🎁</div><h3 className="title-md mt-2">Daily Surprise Box</h3>
          <p className="mt-1 flex-1 text-sm text-vibe-lavender">Finish today's Word Quest to open it: +50 XP and a fun word fact. Same reward for everyone, every day — no luck needed.</p>
          <button onClick={surprise} disabled={!status.quest_done || !!status.surprise_open} className="btn-sun mt-4">{status.surprise_open ? "Opened today ✅" : status.quest_done ? "Open the box!" : "🔒 Complete the quest first"}</button>
        </div>
        <div className="card flex flex-col p-5">
          <div className="text-4xl">🌍</div><h3 className="title-md mt-2">Real-Life English Mission</h3>
          <p className="mt-1 flex-1 text-lg font-semibold">{d.missionOfDay}</p>
          <button onClick={realLife} disabled={!!status.mission_done} className="btn-ghost mt-4">{status.mission_done ? "Done today ✅" : "I did it! (+30 XP)"}</button>
        </div>
        <div className="card flex flex-col p-5">
          <div className="text-4xl">🔁</div><h3 className="title-md mt-2">Words to revise</h3>
          <p className="mt-1 flex-1 text-sm text-vibe-lavender">{d.dueWords ? `${d.dueWords} word${d.dueWords > 1 ? "s are" : " is"} ready for a memory boost.` : "No words due — your memory is in great shape!"}</p>
          <Link href="/world/revision" className="btn-ghost mt-4">Revision Boost</Link>
        </div>
      </section>

      {d.family.length > 0 && (
        <section><h2 className="title-md">👨‍👩‍👧 Family challenges</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">{d.family.map((f) => <Link key={f.id} href={`/world/challenge/family?family=${f.id}`} className="glass p-4 hover:bg-white/10"><b>{f.title}</b><p className="text-sm text-vibe-lavender">{f.message || "A challenge from your family!"}</p></Link>)}</div>
        </section>
      )}

      {/* MISSIONS */}
      <section aria-labelledby="missions">
        <div className="flex items-end justify-between"><h2 id="missions" className="title-md">🎯 Missions</h2><Link href="/world/missions" className="text-sm font-bold text-vibe-aqua">All missions →</Link></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{d.missions.slice(0, 6).map((m) => <MissionCard key={m.slug} m={m} />)}</div>
      </section>

      {d.events.length > 0 && (
        <section className="card relative overflow-hidden p-6">
          <div className="absolute inset-0 bg-vibe-cta opacity-20" />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="hidden rounded-2xl bg-white/95 p-1 sm:block"><BrandLogo width={96} fallback="sm" /></span><span className="text-5xl">{d.events[0].emoji}</span>
            <div className="flex-1"><span className="chip">Special event</span><h2 className="title-md mt-1">{d.events[0].title}</h2><p className="text-vibe-lavender">{d.events[0].description}</p></div>
            <Link href="/world/challenge/special" className="btn-sun">Join the event</Link>
          </div>
        </section>
      )}

      {/* PICKED FOR YOU */}
      {d.recs.length > 0 && (
        <section><h2 className="title-md">💡 Your buddies suggest…</h2>
          <div className="row-scroll mt-4">{d.recs.map((r) => (
            <Link key={r.title} href={r.href} className="glass flex w-72 shrink-0 snap-start gap-3 p-4 hover:bg-white/10">
              <Character name={r.who} mood="hint" size={60} still className="shrink-0" />
              <span><span className="text-xs font-bold uppercase" style={{ color: "var(--tw-prose-body)" }}>{r.emoji} {r.title}</span><span className="mt-1 block text-sm">“{r.reason}”</span></span>
            </Link>
          ))}</div>
        </section>
      )}

      {/* KINGDOMS */}
      <section><div className="flex items-end justify-between"><h2 className="title-md">🗺️ Your Kingdoms</h2><Link href="/world/map" className="text-sm font-bold text-vibe-aqua">Open the map →</Link></div>
        <div className="row-scroll mt-4">{d.kingdoms.map((k) => (
          <Link key={k.slug} href={k.unlocked ? `/world/map/${k.slug}` : "/world/map"} className="card relative h-44 w-72 shrink-0 snap-start overflow-hidden">
            <div className={k.unlocked ? "" : "grayscale"}><Scene name={k.art as SceneName} /></div>
            <div className="absolute inset-0 bg-gradient-to-t from-vibe-midnight via-vibe-midnight/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4"><b className="font-display text-lg">{k.emoji} {k.title}</b>
              {k.unlocked ? <Progress value={k.progress} className="mt-2 h-2" /> : <span className="mt-1 block text-sm text-vibe-sun">🔒 Unlocks at Level {k.unlock_level}</span>}</div>
          </Link>
        ))}</div>
      </section>

      {/* MODULES */}
      <section><h2 className="title-md">🎒 Learning Modules</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{modules.map((m) => (
          <Link key={m.title} href={m.href} className="card group flex flex-col p-4 transition hover:-translate-y-1">
            <div className="flex items-start justify-between"><span className="text-4xl transition group-hover:scale-110">{m.emoji}</span>{skillOf(m.skill) && <span className="chip px-2 text-[10px]">{skillOf(m.skill)}</span>}</div>
            <b className="mt-3 font-display leading-tight">{m.title}</b><p className="mt-1 flex-1 text-xs text-vibe-lavender/90">{m.desc}</p>
            <div className="mt-3 text-xs font-bold text-vibe-aqua">{m.status}</div>
            {m.pct > 0 && <Progress value={m.pct} className="mt-2 h-1.5" />}
            <span className="btn-primary btn-sm mt-3 w-full">Start</span>
          </Link>
        ))}</div>
      </section>

      {d.pet && <p className="text-center text-sm text-vibe-lavender">{d.pet.emoji} {d.pet.nickname ?? d.pet.name} says: “{d.pet.hint_style}”</p>}
      {award && <Celebration award={award.a} title={award.title} message={award.msg} onClose={() => { setAward(null); router.refresh(); }} />}
    </div>
  );
}
