"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { Character, CHARACTER_INFO, type CharacterName } from "@/components/Character";
import { Scene, type SceneName } from "@/components/Scenes";

const FLOATING = ["enormous", "brave", "sparkle", "curious", "magnificent", "giggle", "adventure", "rainbow", "courage", "imagine"];

const STORY = [
  "Welcome to PING VIBE!",
  "Once upon a time, there was a magical universe filled with powerful words, exciting stories and mysterious adventures.",
  "But the magical worlds need explorers!",
  "Every day, new adventures are waiting. Discover words, solve puzzles, create stories, explore kingdoms and unlock extraordinary rewards.",
  "Are you ready to become a PING VIBE Explorer?",
];

const UNIVERSE: { title: string; scene: SceneName; who: CharacterName; text: string; tag: string }[] = [
  { title: "Daily Word Quest", scene: "forest", who: "lexi", text: "10 brand-new words every day — hear them, say them, use them, master them.", tag: "Vocabulary Forest" },
  { title: "Grammar Galaxy", scene: "galaxy", who: "grammy", text: "Blast off on grammar missions with GRAMMY the wizard.", tag: "14 missions + endless drills" },
  { title: "Creative Writing Studio", scene: "castle", who: "story", text: "Write about 1,300+ topics and get kind, instant feedback.", tag: "Storytelling Castle" },
  { title: "Speaking Arena", scene: "mountains", who: "speaky", text: "Listen, repeat and talk your way through real-life adventures.", tag: "Speaking Mountains" },
  { title: "Reading Adventures", scene: "ocean", who: "story", text: "Dive into illustrated stories with quizzes and word helpers.", tag: "Reading Ocean" },
  { title: "Word Games Arcade", scene: "arena", who: "max", text: "10 games and 6 boss battles powered by the words YOU learned.", tag: "Word Wizards Arena" },
];

const REWARDS = [
  ["⚡", "XP & 250 levels", "From Word Explorer to Grand English Champion."],
  ["🪙", "Vibe Coins", "Earned by learning — spend them on avatar styles and decorations."],
  ["💎", "Magic Crystals", "Rare treasures from boss battles and big milestones."],
  ["🐉", "Magical pets", "Unlock a dragon, unicorn or phoenix by reaching learning goals."],
  ["🃏", "Collectible cards", "Every mastered word becomes a card in your collection book."],
  ["🏰", "Your own world", "Build a treehouse, library and castle as you learn."],
];

const PARENTS = [
  ["📈", "Real progress, not just screen time", "Words introduced vs. truly mastered, skill-by-skill reports and weekly learning stories."],
  ["🛡️", "Safe by design", "No public chat, no child-to-child messaging, no ads, no loot boxes, no public leaderboards."],
  ["🔒", "Privacy first (DPDP-ready)", "Minimal data, verified parental consent, export or delete anytime. Voice never leaves the device."],
  ["🌿", "Healthy habits", "Short sessions, break reminders, daily reward ceilings and forgiving streaks."],
];

export default function Landing() {
  return (
    <main id="main" className="overflow-x-hidden">
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-line/5 bg-vibe-midnight/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" aria-label="PING VIBE home" className="rounded-xl bg-white p-0.5"><BrandLogo width={120} fallback="sm" priority /></Link>
          <nav className="flex items-center gap-2">
            <a href="#universe" className="hidden px-3 text-sm font-semibold text-vibe-lavender hover:text-ink md:inline">Universe</a>
            <a href="#buddies" className="hidden px-3 text-sm font-semibold text-vibe-lavender hover:text-ink md:inline">Buddies</a>
            <a href="#parents" className="hidden px-3 text-sm font-semibold text-vibe-lavender hover:text-ink md:inline">Parents</a>
            <Link href="/login" className="btn-ghost btn-sm">LOGIN</Link>
            <Link href="/signup" className="btn-primary btn-sm hidden sm:inline-flex">START</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[100dvh] bg-vibe-hero pt-24">
        <div className="absolute inset-0 opacity-40"><Scene name="islands" /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-vibe-midnight/30 via-vibe-midnight/40 to-vibe-midnight" />
        {FLOATING.map((w, i) => (
          <motion.span key={w} className="pointer-events-none absolute hidden select-none rounded-full border border-line/10 bg-glass/5 px-3 py-1 font-display text-sm text-vibe-lavender backdrop-blur sm:block"
            style={{ left: `${(i * 97) % 92}%`, top: `${18 + ((i * 53) % 65)}%` }}
            animate={{ y: [0, -18, 0], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 6 + (i % 4), repeat: Infinity, delay: i * 0.5 }}>
            {w}
          </motion.span>
        ))}
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:pt-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="chip mb-5 bg-glass/10 text-vibe-sun-ink">✨ For Explorers aged 5–13 · Pre-KG to Grade 7</span>
            <div className="rounded-[2rem] bg-white p-3 shadow-card sm:p-4"><BrandLogo width="min(560px, 100%)" fallback="lg" priority /></div>
            <h1 className="sr-only">PING VIBE — Your World. Your Words. Your Vibe.</h1>
            <p className="mt-5 max-w-xl text-lg text-vibe-lavender">Step into a world where every word unlocks a new adventure. Discover, play, learn and become an English champion!</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="btn-primary px-8 py-4 text-lg">START YOUR ADVENTURE 🚀</Link>
              <Link href="/login" className="btn-ghost px-8 py-4 text-lg">LOGIN</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-vibe-lavender">
              <span>🗓️ 365-day plan for every grade</span><span>🏆 250 levels</span><span>🛡️ No ads · No public chat</span>
            </div>
          </motion.div>
          <motion.div className="relative mx-auto" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="absolute -inset-10 rounded-full bg-vibe-purple/30 blur-3xl" />
            <div className="relative flex items-end justify-center">
              <Character name="lexi" mood="excited" size={150} className="-mr-6 hidden sm:block" />
              <Character name="max" mood="welcome" size={260} />
              <Character name="speaky" mood="welcome" size={140} className="-ml-6 hidden sm:block" />
            </div>
            <div className="glass mx-auto -mt-2 max-w-sm px-5 py-3 text-center font-display text-lg">“Hey Explorer! Ready for today's adventure?” <span className="text-vibe-aqua-ink">— MAX</span></div>
          </motion.div>
        </div>
      </section>

      {/* STORY */}
      <section className="relative mx-auto max-w-4xl px-4 py-24 text-center sm:px-6" aria-label="The PING VIBE story">
        {STORY.map((line, i) => (
          <motion.p key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.6 }}
            className={i === 0 || i === STORY.length - 1 ? "title-lg my-8 text-gradient" : "my-6 text-xl leading-relaxed text-vibe-lavender sm:text-2xl"}>
            {line}
          </motion.p>
        ))}
        <Link href="/signup" className="btn-sun mt-4 text-lg">Yes! I'm ready ✨</Link>
      </section>

      {/* UNIVERSE (Netflix-style row) */}
      <section id="universe" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="title-lg">Explore Your Learning Universe</h2>
          <p className="mt-2 text-vibe-lavender">Six magical kingdoms. Hundreds of missions. A new adventure every day.</p>
        </div>
        <div className="row-scroll mt-8 px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-vibe-sun sm:px-6 lg:mx-auto lg:max-w-7xl" tabIndex={0} role="region" aria-label="Learning kingdoms (scroll sideways)">
          {UNIVERSE.map((u, i) => (
            <motion.article key={u.title} whileHover={{ y: -6 }} initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="card group relative w-[78vw] max-w-[340px] shrink-0 snap-start overflow-hidden">
              <div className="relative h-44"><Scene name={u.scene} /><div className="absolute inset-0 bg-gradient-to-t from-vibe-midnight via-transparent" />
                <div className="absolute bottom-0 right-2"><Character name={u.who} mood="welcome" size={86} still /></div></div>
              <div className="p-5">
                <span className="chip">{u.tag}</span>
                <h3 className="title-md mt-2">{u.title}</h3>
                <p className="mt-2 text-sm text-vibe-lavender">{u.text}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* DAILY WORD QUEST spotlight */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="chip text-vibe-aqua-ink">Daily Word Quest</span>
          <h2 className="title-lg mt-3">10 new words a day. Truly mastered, not just seen.</h2>
          <p className="mt-4 text-vibe-lavender">Each word comes alive with pronunciation, a kid-friendly meaning, examples and real-life use. Words move from <b className="text-ink">Discovered</b> to <b className="text-ink">Practising</b> to <b className="text-vibe-sun-ink">Mastered</b> only when your child shows they know them on different days — powered by spaced repetition.</p>
        </div>
        <div className="card relative overflow-hidden p-6">
          <div className="flex items-center justify-between"><span className="chip">Word 3 of 10</span><span className="chip text-vibe-sun-ink">Grade 3–4</span></div>
          <div className="mt-6 flex items-center gap-5">
            <div className="text-7xl">🐘</div>
            <div><div className="font-display text-4xl font-bold">ENORMOUS</div><div className="text-vibe-aqua-ink">ih-NOR-muhs · adjective</div></div>
          </div>
          <p className="mt-4 text-lg"><b>Meaning:</b> Extremely big.</p>
          <p className="mt-1 text-vibe-lavender">“The elephant is enormous!”</p>
          <div className="mt-4 flex flex-wrap gap-2"><span className="chip">≈ huge, gigantic</span><span className="chip">≠ tiny</span></div>
          <div className="absolute -bottom-4 -right-4"><Character name="lexi" mood="explaining" size={110} still /></div>
        </div>
      </section>

      {/* BUDDIES */}
      <section id="buddies" className="bg-vibe-midnight-2/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="title-lg text-center">Meet Your Adventure Buddies</h2>
          <p className="mt-2 text-center text-vibe-lavender">Original characters who welcome, explain, hint, celebrate — and cheer you on after every mistake.</p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {(Object.keys(CHARACTER_INFO) as CharacterName[]).map((c, i) => (
              <motion.div key={c} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card flex flex-col items-center p-5 text-center">
                <Character name={c} mood={(["welcome", "excited", "celebrating", "explaining", "hint"] as const)[i]} size={130} />
                <h3 className="title-md mt-2" style={{ color: CHARACTER_INFO[c].color }}>{CHARACTER_INFO[c].name}</h3>
                <div className="text-xs font-bold uppercase tracking-wider text-vibe-lavender">{CHARACTER_INFO[c].role}</div>
                <p className="mt-3 text-sm text-vibe-lavender">{CHARACTER_INFO[c].bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* REWARDS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="title-lg">Unlock Rewards and Achievements</h2>
        <p className="mt-2 text-vibe-lavender">Every reward is earned by learning. No purchases. No random loot boxes. Ever.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REWARDS.map(([e, t, d]) => (
            <div key={t} className="card flex gap-4 p-5"><div className="text-4xl">{e}</div><div><h3 className="font-display text-lg font-bold">{t}</h3><p className="text-sm text-vibe-lavender">{d}</p></div></div>
          ))}
        </div>
      </section>

      {/* PARENTS */}
      <section id="parents" className="bg-gradient-to-b from-transparent to-vibe-midnight-2/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="title-lg">Parents love the progress. Kids love the adventure.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {PARENTS.map(([e, t, d]) => (
              <div key={t} className="glass p-6"><div className="text-3xl">{e}</div><h3 className="mt-2 font-display text-xl font-bold">{t}</h3><p className="mt-1 text-vibe-lavender">{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-24 text-center">
        <div className="absolute inset-0 bg-vibe-hero" />
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mx-auto w-fit rounded-[2rem] bg-white p-3 shadow-card"><BrandLogo width="min(320px, 80vw)" /></div>
          <h2 className="title-xl mt-6">ENTER. EXPLORE. LEARN. LEVEL UP!</h2>
          <p className="mt-4 text-lg text-vibe-lavender">Registration takes one minute: your child's first name, your e-mail, month & year of birth and grade.</p>
          <Link href="/signup" className="btn-primary mt-8 px-10 py-4 text-lg">START YOUR ADVENTURE</Link>
        </div>
      </section>

      <footer className="border-t border-line/5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-vibe-lavender sm:flex-row sm:px-6">
          <div className="rounded-2xl bg-white p-2"><BrandLogo width={150} fallback="sm" /></div>
          <div className="flex gap-5"><Link href="/privacy" className="hover:text-ink">Privacy & Parental Consent</Link><Link href="/login?as=parent" className="hover:text-ink">Parent login</Link></div>
          <span>© {new Date().getFullYear()} PING VIBE</span>
        </div>
      </footer>
    </main>
  );
}
