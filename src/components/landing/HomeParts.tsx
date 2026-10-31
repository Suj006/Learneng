"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { Character, CHARACTER_INFO, type CharacterName } from "@/components/Character";
import { Scene, type SceneName } from "@/components/Scenes";
import { Portal } from "@/components/ui";
import { audio } from "@/lib/audio/manager";
import { loadLocalPrefs } from "@/lib/audio/prefs";
import type { Discover, HomeMe, HomeWord } from "@/server/home";

const reduced = () => typeof window !== "undefined" && (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.getAttribute("data-motion") === "off");

// ── Cinematic introduction (≈4 s, once per device, skippable, never blocks the page underneath) ─────────────
export function IntroCinematic() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let seen = true; try { seen = localStorage.getItem("pv-intro-seen") === "1"; } catch { /* ignore */ }
    if (!seen && !reduced()) { setShow(true); try { localStorage.setItem("pv-intro-seen", "1"); } catch { /* ignore */ } }
  }, []);
  useEffect(() => { if (!show) return; const t = setTimeout(() => setShow(false), 4600); return () => clearTimeout(t); }, [show]);
  if (!show) return null;
  return (
    <Portal>
      <motion.div className="fixed inset-0 z-[70] grid place-items-center overflow-hidden bg-vibe-night/95" initial={{ opacity: 1 }} animate={{ opacity: [1, 1, 0] }} transition={{ duration: 4.6, times: [0, 0.88, 1] }} role="dialog" aria-label="PING VIBE introduction">
        <motion.div className="absolute h-3 w-3 rounded-full bg-white shadow-[0_0_40px_20px_rgba(255,255,255,0.8)]" initial={{ scale: 0 }} animate={{ scale: [0, 1.6, 1] }} transition={{ duration: 0.8 }} />
        <motion.svg viewBox="0 0 600 300" className="absolute w-[min(900px,140vw)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
          {["#F52F83", "#FF9B24", "#FFD33F", "#55D934", "#16B9E9", "#852DEB"].map((c, i) => (
            <motion.path key={c} d={`M ${40 + i * 10} 300 A ${260 - i * 10} ${260 - i * 10} 0 0 1 ${560 - i * 10} 300`} fill="none" stroke={c} strokeWidth="10" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 + i * 0.08, duration: 0.8 }} />
          ))}
        </motion.svg>
        <div className="relative flex flex-col items-center px-4 text-center">
          <motion.div className="flex items-end" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.5 }}>
            <Character name="lexi" mood="excited" size={90} still /><Character name="max" mood="welcome" size={120} still /><Character name="grammy" mood="welcome" size={90} still />
          </motion.div>
          <motion.div className="mt-2 rounded-[1.5rem] bg-white p-2 shadow-[0_0_60px_rgba(255,255,255,0.35)]" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 2.2, duration: 0.6 }}>
            <BrandLogo width="min(340px, 78vw)" fallback="lg" priority />
          </motion.div>
          <motion.p className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.9 }}>Your World. Your Words. Your Vibe.</motion.p>
        </div>
        <button onClick={() => setShow(false)} className="absolute right-4 top-4 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/25">Skip intro ✕</button>
      </motion.div>
    </Portal>
  );
}

// ── Music: "TURN ON THE MAGIC!" (never autoplays; respects saved preferences; stops on leaving the page) ────────
export function MagicMusicButton() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    audio.configure(loadLocalPrefs(), { musicAllowed: true, voicesAllowed: true }, false);
    return () => audio.shutdown();
  }, []);
  const toggle = () => {
    audio.unlock();
    if (on) { audio.setPrefs({ musicOn: false }); setOn(false); return; }
    audio.setPrefs({ musicOn: true, sfxOn: true });
    audio.setTheme("dashboard");
    audio.sfx("unlock"); setOn(true);
  };
  return (
    <button onClick={toggle} aria-pressed={on} className={`btn ${on ? "btn-ghost" : "btn-sun"} btn-sm`}>
      {on ? "🔇 Music off" : "🎵 TURN ON THE MAGIC!"}
    </button>
  );
}

// ── Portal transition before sign-up / login (≈0.6 s; click again or reduced motion → instant) ─────────────────
export function PortalLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  const [go, setGo] = useState(false);
  const open = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let new-tab clicks behave normally
    e.preventDefault();
    if (reduced() || go) { router.push(href); return; }
    setGo(true); audio.sfx("unlock");
    setTimeout(() => router.push(href), 650);
  };
  return (
    <>
      <Link href={href} onClick={open} className={className}>{children}</Link>
      {go && (
        <Portal>
          <div className="fixed inset-0 z-[80] grid place-items-center" onClick={() => router.push(href)} aria-hidden>
            <motion.div className="h-24 w-24 rounded-full" style={{ background: "radial-gradient(circle, #fff 0%, #16B9E9 40%, #852DEB 75%, #F52F83 100%)" }}
              initial={{ scale: 0, rotate: 0 }} animate={{ scale: 40, rotate: 180 }} transition={{ duration: 0.7, ease: "easeIn" }} />
          </div>
        </Portal>
      )}
    </>
  );
}

// ── Meet your adventure friends: tap a character for an animated greeting and their special abilities ─────────
const FRIENDS: { who: CharacterName; line: string; abilities: string[] }[] = [
  { who: "max", line: "Hey Explorer! Ready for a brand-new adventure?", abilities: ["Guides your daily adventure", "Celebrates every win", "Opens treasure and missions"] },
  { who: "lexi", line: "Let's discover some amazing words!", abilities: ["5 new words every day", "Pronunciation and meanings", "Word games and revision"] },
  { who: "grammy", line: "I've got some exciting grammar puzzles!", abilities: ["Grammar missions", "Kind writing feedback", "Sentence tricks"] },
  { who: "speaky", line: "Come on! Let's make your English shine!", abilities: ["Speaking practice", "Listen and repeat", "Real-life conversations"] },
  { who: "story", line: "A wonderful story is waiting for you!", abilities: ["Reading adventures", "Story Builder", "Creative writing"] },
];
export function CharacterIntro() {
  const [sel, setSel] = useState<CharacterName | null>(null);
  const pick = (f: (typeof FRIENDS)[number]) => {
    setSel(f.who);
    // Voice only if the visitor has sound on (respects saved preferences); the greeting is always shown as text.
    if (audio.unlocked && audio.prefs.voiceOn) void audio.say(f.who, f.line, { server: true, caption: false });
  };
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {FRIENDS.map((f) => {
        const info = CHARACTER_INFO[f.who]; const on = sel === f.who;
        return (
          <button key={f.who} onClick={() => pick(f)} aria-expanded={on} className={`card flex flex-col items-center p-4 text-center ${on ? "ring-4 ring-vibe-purple/50" : ""}`}>
            <motion.div animate={on ? { y: [0, -14, 0], rotate: [0, -4, 4, 0] } : {}} transition={{ duration: 0.7 }}>
              <Character name={f.who} mood={on ? "celebrating" : "welcome"} size={110} still={!on} />
            </motion.div>
            <b className="mt-2 font-display text-lg" style={{ color: info.color }}>{info.name}</b>
            <span className="text-xs text-vibe-lavender">{info.role}</span>
            <AnimatePresence>
              {on && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 w-full overflow-hidden text-left">
                  <p className="rounded-2xl bg-white p-2 text-sm font-semibold text-vibe-night">“{f.line}”</p>
                  <ul className="mt-2 space-y-0.5 text-xs text-vibe-lavender">{f.abilities.map((a) => <li key={a}>✦ {a}</li>)}</ul>
                </motion.div>
              )}
            </AnimatePresence>
            {!on && <span className="mt-2 text-xs font-bold text-vibe-purple-ink">Tap to say hi 👋</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Interactive kingdom exploration ─────────────────────────────────────────────────────────────────────────
const KINGDOMS: { slug: string; title: string; scene: SceneName; who: CharacterName; text: string; acts: string[] }[] = [
  { slug: "vocabulary-forest", title: "Vocabulary Forest", scene: "forest", who: "lexi", text: "Talking trees and hidden word paths. Five new words every day.", acts: ["Daily Word Quest", "Vocabulary Notebook", "Revision Boost"] },
  { slug: "grammar-galaxy", title: "Grammar Galaxy", scene: "galaxy", who: "grammy", text: "Fly between grammar planets with GRAMMY the wizard.", acts: ["13 grammar missions", "Endless drills", "Captain Muddle boss"] },
  { slug: "storytelling-castle", title: "Storytelling Castle", scene: "castle", who: "story", text: "Magical writing rooms and kind, instant feedback.", acts: ["Creative Writing Studio", "Story Builder", "1,300+ topics"] },
  { slug: "speaking-mountains", title: "Speaking Mountains", scene: "mountains", who: "speaky", text: "Echo caves and real-life conversations with SPEAKY.", acts: ["Speaking Arena", "Listening Lab", "Pronunciation practice"] },
  { slug: "reading-ocean", title: "Reading Ocean", scene: "ocean", who: "story", text: "Dive into illustrated stories with word helpers.", acts: ["Reading Adventures", "Comprehension quizzes", "Collectible story cards"] },
  { slug: "word-wizards-arena", title: "Word Wizards Arena", scene: "arena", who: "max", text: "Games and boss battles powered by the words YOU learned.", acts: ["10 word games", "Boss battles", "Personal bests"] },
];
export function KingdomExplorer({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {KINGDOMS.map((k) => {
        const on = open === k.slug;
        return (
          <div key={k.slug} onMouseEnter={() => setOpen(k.slug)} onMouseLeave={() => setOpen(null)} className={`card group relative overflow-hidden transition ${on ? "-translate-y-1 shadow-glow" : ""}`}>
            <button onClick={() => setOpen(on ? null : k.slug)} aria-expanded={on} className="block w-full text-left">
              <div className="relative h-40 overflow-hidden"><div className={`h-full transition duration-500 ${on ? "scale-110" : ""}`}><Scene name={k.scene} /></div>
                <div className="absolute bottom-1 right-2"><Character name={k.who} mood={on ? "excited" : "welcome"} size={on ? 84 : 64} still={!on} /></div></div>
              <div className="p-4"><b className="font-display text-lg">{k.title}</b><p className="mt-1 text-sm text-vibe-lavender">{k.text}</p></div>
            </button>
            <AnimatePresence>
              {on && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden px-4 pb-4">
                  <ul className="flex flex-wrap gap-1.5">{k.acts.map((a) => <li key={a} className="chip">{a}</li>)}</ul>
                  <Link href={signedIn ? `/world/map/${k.slug}` : "/signup"} className="btn-primary btn-sm mt-3">Explore →</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ── Word Universe: Word of the Day, floating words and a 30-second discovery puzzle ──────────────────────────
const BANDS: [number, string][] = [[1, "Ages 5–6"], [2, "Grades 1–2"], [3, "Grades 3–4"], [4, "Grades 5–7"]];
function WordCard({ w, title }: { w: HomeWord; title: string }) {
  return (
    <div className="card relative overflow-hidden p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-vibe-purple-ink">{title}</p>
      <div className="mt-2 flex items-start gap-4">
        <span className="text-6xl" aria-hidden>{w.emoji}</span>
        <div className="min-w-0">
          <h3 className="font-display text-4xl font-bold uppercase tracking-wide">{w.word}</h3>
          <p className="text-sm text-vibe-lavender">{w.part_of_speech} · {w.phonetic}</p>
        </div>
      </div>
      <p className="mt-3 text-lg font-semibold">{w.meaning}</p>
      <p className="mt-1 text-vibe-lavender">“{w.example}”</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-primary btn-sm" onClick={() => void audio.say("lexi", w.word, { rate: 0.8, caption: false, server: true })}>🔊 Listen</button>
        <button className="btn-ghost btn-sm" onClick={() => void audio.say("lexi", w.word, { rate: 0.55, caption: false, server: true })}>🐢 Slowly</button>
        <button className="btn-ghost btn-sm" onClick={() => void audio.say("lexi", w.example, { caption: false, server: true })}>💬 In a sentence</button>
      </div>
    </div>
  );
}
export function WordUniverse({ initial, signedIn }: { initial: Discover; signedIn: boolean }) {
  const [d, setD] = useState(initial);
  const [focus, setFocus] = useState<HomeWord | null>(null);
  const [guess, setGuess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const change = async (band: number) => {
    if (band === d.band) return;
    setLoading(true);
    try { const r = await fetch(`/api/public/discover?band=${band}`); if (r.ok) { setD(await r.json()); setFocus(null); setGuess(null); } } finally { setLoading(false); }
  };
  const w = focus ?? d.word;
  return (
    <div className={loading ? "opacity-60 transition" : "transition"}>
      {!signedIn && (
        <div className="mb-5 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="Choose a level">
          {BANDS.map(([b, l]) => <button key={b} role="radio" aria-checked={d.band === b} onClick={() => change(b)} className={`btn btn-sm ${d.band === b ? "bg-vibe-cta text-white" : "btn-ghost"}`}>{l}</button>)}
        </div>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          {w && <WordCard w={w} title={focus ? "From the Word Universe" : "✨ Today's magical discovery"} />}
          {/* Floating words: tap one to discover it */}
          <div className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Word Universe">
            {d.cloud.map((c, i) => (
              <motion.button key={c.id} onClick={() => setFocus(c)} animate={{ y: [0, -6, 0] }} transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
                className={`rounded-full border px-4 py-2 font-display font-bold shadow-card transition hover:scale-105 ${focus?.id === c.id ? "border-vibe-purple bg-vibe-purple/15 text-vibe-purple-ink" : "border-line/15 bg-white text-vibe-night"}`}>
                {c.emoji} {c.word}
              </motion.button>
            ))}
          </div>
        </div>
        {d.puzzle && (
          <div className="card p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-vibe-aqua-ink">🔎 Can you discover the hidden word?</p>
            <div className="mt-3 text-center text-7xl" aria-hidden>{d.puzzle.emoji}</div>
            <p className="mt-2 text-center font-semibold">Clue: {d.puzzle.meaning}</p>
            <div className="mt-4 grid gap-2">
              {d.puzzle.options.map((o) => {
                const right = o === d.puzzle!.answer; const chosen = guess === o;
                return (
                  <button key={o} disabled={!!guess} onClick={() => { setGuess(o); audio.sfx(right ? "correct" : "incorrect"); }}
                    className={`rounded-2xl border-2 p-3 text-left font-display text-lg font-bold transition ${guess ? (right ? "border-vibe-mint bg-vibe-mint/15" : chosen ? "border-vibe-coral bg-vibe-coral/15" : "opacity-50") : "border-line/15 hover:bg-glass/[0.06]"}`}>
                    {guess && right ? "✓ " : guess && chosen ? "✗ " : ""}{o}
                  </button>
                );
              })}
            </div>
            {guess && (
              <div className="mt-4" role="status">
                <p className="font-semibold">{guess === d.puzzle.answer ? "🎉 You found it!" : `Nice try! The hidden word is “${d.puzzle.answer}”.`}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button className="btn-ghost btn-sm" onClick={() => void audio.say("lexi", d.puzzle!.answer, { rate: 0.8, caption: false, server: true })}>🔊 Hear it</button>
                  <Link href={signedIn ? "/world/quest" : "/signup"} className="btn-primary btn-sm">{signedIn ? "Today's words →" : "Discover 5 words a day →"}</Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Story of the Day ─────────────────────────────────────────────────────────────────────────────────────────
export function StoryOfDay({ story, signedIn }: { story: NonNullable<Discover["story"]>; signedIn: boolean }) {
  return (
    <div className="card grid overflow-hidden md:grid-cols-[1fr_1.2fr]">
      <div className="relative h-56 md:h-full"><Scene name={story.cover as SceneName} /><span className="absolute left-4 top-4 text-6xl drop-shadow" aria-hidden>{story.emoji}</span></div>
      <div className="p-6">
        <span className="chip">{story.genre} · about {story.minutes} min</span>
        <h3 className="title-md mt-2">{story.title}</h3>
        <p className="mt-2 text-vibe-lavender">{story.teaser}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => void audio.say("story", story.firstPage, { rate: 0.95, caption: false, server: true })}>🎧 Listen to Story</button>
          <Link href={signedIn ? `/world/reading/${story.slug}` : "/signup"} className="btn-primary">{signedIn ? "Read Story 📖" : "Join to read it 📖"}</Link>
        </div>
      </div>
    </div>
  );
}

// ── Daily mystery treasure (uses the existing Surprise Box reward: opens only after today's word quest) ────────
export function MysteryTreasure({ me }: { me: HomeMe | null }) {
  const [peek, setPeek] = useState(false);
  const state = !me ? "visitor" : me.treasureOpened ? "opened" : me.treasureReady ? "ready" : "locked";
  return (
    <div className="card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
      <motion.button onClick={() => setPeek(!peek)} animate={state === "ready" ? { rotate: [0, -6, 6, 0] } : {}} transition={{ repeat: Infinity, duration: 1.8 }} className="shrink-0 text-7xl" aria-label="Mystery treasure chest">
        {state === "opened" ? "📭" : "🎁"}
      </motion.button>
      <div className="min-w-0 flex-1">
        <h3 className="title-md">Something magical is waiting to be discovered!</h3>
        <p className="mt-1 text-vibe-lavender">
          {state === "visitor" && "Every day, a mystery treasure opens when an Explorer finishes their Daily Word Quest. No luck, no tricks: learning unlocks it."}
          {state === "locked" && `Finish today's ${me!.wordsToday} new words to open today's treasure.`}
          {state === "ready" && "Your treasure is ready! Open it on your Adventure page."}
          {state === "opened" && "You opened today's treasure. A new one appears tomorrow!"}
        </p>
        {peek && state === "visitor" && <p className="mt-2 text-sm font-semibold text-vibe-purple-ink">Inside: bonus XP, VIBE COINS and a fun word fact! ✨</p>}
      </div>
      <Link href={!me ? "/signup" : state === "locked" ? "/world/quest" : "/world"} className={state === "ready" ? "btn-sun" : "btn-primary"}>
        {!me ? "Start exploring" : state === "locked" ? "Today's words →" : state === "ready" ? "Open my treasure 🎁" : "My Adventure →"}
      </Link>
    </div>
  );
}

// ── Personal welcome for signed-in children ───────────────────────────────────────────────────────────────────
export function MePanel({ me }: { me: HomeMe }) {
  return (
    <div className="card p-5">
      <p className="font-display text-2xl font-bold">Welcome back, {me.name}! 👋</p>
      <p className="text-vibe-lavender">Your next adventure is waiting.</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-vibe-purple/10 p-2"><b className="block font-display text-xl text-vibe-purple-ink">Lv {me.level}</b><span className="text-xs text-vibe-lavender">{me.levelName}</span></div>
        <div className="rounded-2xl bg-vibe-aqua/10 p-2"><b className="block font-display text-xl text-vibe-aqua-ink">{me.wordsDone ? "✓" : me.wordsToday}</b><span className="text-xs text-vibe-lavender">{me.wordsDone ? "Words done" : "New words"}</span></div>
        <div className="rounded-2xl bg-vibe-mint/10 p-2"><b className="block font-display text-xl text-vibe-mint-ink">{me.missionsDone}/{me.missionsTotal}</b><span className="text-xs text-vibe-lavender">Missions</span></div>
      </div>
      {me.recommended && <p className="mt-3 text-sm">Next: <b>{me.recommended.emoji} {me.recommended.title}</b></p>}
      <Link href={me.recommended?.href ?? "/world"} className="btn-primary mt-4 w-full">Continue Adventure →</Link>
    </div>
  );
}
