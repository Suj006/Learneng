"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { Character } from "@/components/Character";
import { HeroWorld } from "./HeroWorld";
import { CharacterIntro, IntroCinematic, KingdomExplorer, MagicMusicButton, MePanel, MysteryTreasure, PortalLink, StoryOfDay, WordUniverse } from "./HomeParts";
import type { Discover, HomeMe } from "@/server/home";

const REWARDS = [
  ["⚡", "XP & 250 levels", "From Word Explorer to Grand English Champion."],
  ["🪙", "VIBE COINS", "Your reward shopping power — earned by learning, spent on avatar styles, pets and decorations."],
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

const reveal = { initial: { opacity: 0, y: 28 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.2 }, transition: { duration: 0.6 } } as const;

function Section({ id, kicker, title, sub, children, className = "" }: { id?: string; kicker: string; title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.section id={id} {...reveal} className={`mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 ${className}`}>
      <p className="font-display text-sm font-bold uppercase tracking-widest text-vibe-purple-ink">{kicker}</p>
      <h2 className="title-lg mt-1">{title}</h2>
      {sub && <p className="mt-2 max-w-2xl text-vibe-lavender">{sub}</p>}
      <div className="mt-8">{children}</div>
    </motion.section>
  );
}

/**
 * Homepage (Experience 2.0 + 3.0). Order: hero → kingdoms → characters → Word Universe → Story of the Day →
 * daily treasure → play & level up → themes → parents → final call to action. Logged-in children see a personal
 * welcome; everything uses real content and the existing reward engine.
 */
export default function Landing({ me, discover, themes }: { me: HomeMe | null; discover: Discover; themes: { slug: string; name: string; emoji: string; swatches: string[] }[] }) {
  const signedIn = !!me;
  return (
    <main id="main" className="overflow-x-hidden">
      <IntroCinematic />
      {/* NAV */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-line/10 bg-vibe-midnight/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:px-6">
          <Link href="/" aria-label="PING VIBE home" className="shrink-0 rounded-xl bg-white p-0.5"><BrandLogo width={110} fallback="sm" priority /></Link>
          <nav className="flex items-center gap-1.5 sm:gap-2" aria-label="Main">
            <a href="#kingdoms" className="hidden px-2 text-sm font-semibold text-vibe-lavender hover:text-ink lg:inline">Kingdoms</a>
            <a href="#friends" className="hidden px-2 text-sm font-semibold text-vibe-lavender hover:text-ink lg:inline">Friends</a>
            <a href="#words" className="hidden px-2 text-sm font-semibold text-vibe-lavender hover:text-ink lg:inline">Word Universe</a>
            <a href="#parents" className="hidden px-2 text-sm font-semibold text-vibe-lavender hover:text-ink lg:inline">Parents</a>
            <span className="hidden sm:inline-flex"><MagicMusicButton /></span>
            {signedIn ? <Link href="/world" className="btn-primary btn-sm">My Adventure</Link>
              : <><Link href="/login" className="btn-ghost btn-sm">Login</Link><Link href="/signup" className="btn-primary btn-sm hidden sm:inline-flex">Sign up</Link></>}
          </nav>
        </div>
      </header>

      {/* 01 · HERO */}
      <section className="relative min-h-[92dvh] pt-20">
        <HeroWorld />
        {/* Soft fade behind the text so the world never competes with the words (desktop). */}
        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-r from-vibe-midnight via-vibe-midnight/85 to-transparent lg:block" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="chip mb-4 bg-white/80 text-vibe-purple-ink">✨ For Explorers aged 5–13 · Pre-KG to Grade 7</span>
            <div className="w-[min(420px,100%)] rounded-[2rem] bg-white p-2.5 shadow-card"><BrandLogo width="100%" fallback="lg" priority /></div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-gradient sm:text-5xl lg:text-6xl">Your World. Your Words. Your Vibe.</h1>
            <p className="mt-4 max-w-xl text-lg text-vibe-lavender sm:text-xl">Step into a magical world where every word unlocks a new adventure!</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <PortalLink href={signedIn ? "/world" : "/signup"} className="btn-primary px-8 py-4 text-lg">{signedIn ? "CONTINUE YOUR ADVENTURE 🚀" : "START YOUR ADVENTURE 🚀"}</PortalLink>
              <a href="#kingdoms" className="btn-ghost px-8 py-4 text-lg">EXPLORE THE WORLD 🗺️</a>
            </div>
            <div className="mt-4 sm:hidden"><MagicMusicButton /></div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-vibe-lavender">
              <span>📚 5 new words every day</span><span>🏆 250 levels</span><span>🛡️ No ads · No public chat</span>
            </div>
          </motion.div>
          <motion.div className="relative mx-auto w-full max-w-md" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            {me ? <MePanel me={me} /> : (
              <div className="relative flex flex-col items-center">
                <div className="flex items-end justify-center">
                  <Character name="lexi" mood="excited" size={130} className="-mr-4 hidden sm:block" />
                  <Character name="max" mood="welcome" size={230} />
                  <Character name="grammy" mood="welcome" size={120} className="-ml-4 hidden sm:block" />
                </div>
                <div className="glass -mt-1 max-w-sm px-5 py-3 text-center font-display text-lg">“Hey Explorer! Ready for a brand-new adventure?” <span className="text-vibe-aqua-ink">— MAX</span></div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 02 · KINGDOMS */}
      <Section id="kingdoms" kicker="02 · Discover" title="Explore the magical kingdoms" sub="Hover or tap a kingdom to peek inside.">
        <KingdomExplorer signedIn={signedIn} />
      </Section>

      {/* 03 · CHARACTERS */}
      <Section id="friends" kicker="03 · Characters" title="Meet your adventure friends" sub="Tap a friend to say hello and see their special powers.">
        <CharacterIntro />
      </Section>

      {/* 04 · WORD UNIVERSE */}
      <Section id="words" kicker="04 · Word Universe" title="Discover today's magical word" sub={signedIn ? "Words picked for your level." : "Discover. Listen. Learn. Choose a level to see words for every age."}>
        <WordUniverse initial={discover} signedIn={signedIn} />
      </Section>

      {/* 05 · STORY OF THE DAY + DAILY TREASURE */}
      {discover.story && (
        <Section kicker="05 · Story of the day" title="A new adventure awaits inside every story">
          <StoryOfDay story={discover.story} signedIn={signedIn} />
          <div className="mt-6"><MysteryTreasure me={me} /></div>
        </Section>
      )}

      {/* 06 · PLAY & LEVEL UP */}
      <Section kicker="06 · Gamification" title="Play. Discover. Level up." sub="Everything is earned by learning. No real money, no mystery boxes.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REWARDS.map(([e, t, d]) => (
            <div key={t} className="card p-5"><div className="text-4xl">{e}</div><b className="mt-2 block font-display text-lg">{t}</b><p className="mt-1 text-sm text-vibe-lavender">{d}</p></div>
          ))}
        </div>
      </Section>

      {/* 07 · THEMES */}
      <Section kicker="07 · Personalise" title="Make PING VIBE your own" sub="Every Explorer picks their favourite colours. All themes are free.">
        <div className="flex flex-wrap gap-3">
          {themes.map((t) => (
            <div key={t.slug} data-theme={t.slug} className="pv-page flex items-center gap-3 rounded-3xl border border-line/15 px-4 py-3 shadow-card">
              <span className="flex gap-1" aria-hidden>{t.swatches.map((c) => <span key={c} className="h-5 w-5 rounded-full" style={{ background: c }} />)}</span>
              <b className="font-display text-ink">{t.emoji} {t.name}</b>
            </div>
          ))}
        </div>
      </Section>

      {/* 08 · PARENTS */}
      <Section id="parents" kicker="08 · For parents" title="Learning you can trust" sub="Grade-wise plans, real progress tracking and a safe, private space for your child.">
        <div className="grid gap-4 sm:grid-cols-2">
          {PARENTS.map(([e, t, d]) => (
            <div key={t} className="card flex gap-4 p-5"><div className="text-3xl">{e}</div><div><b className="font-display text-lg">{t}</b><p className="mt-1 text-sm text-vibe-lavender">{d}</p></div></div>
          ))}
        </div>
      </Section>

      {/* 09 · FINAL CTA */}
      <motion.section {...reveal} className="relative overflow-hidden px-4 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-center"><Character name="max" mood="celebrating" size={150} /></div>
          <h2 className="title-lg mt-4">Ready for your next big adventure?</h2>
          <p className="mt-2 text-vibe-lavender">Your next adventure starts here. Join PING VIBE and explore a world of words.</p>
          <PortalLink href={signedIn ? "/world" : "/signup"} className="btn-primary mt-6 px-10 py-4 text-lg">{signedIn ? "CONTINUE MY ADVENTURE 🚀" : "JOIN PING VIBE 🚀"}</PortalLink>
        </div>
      </motion.section>

      <footer className="border-t border-line/10 px-4 py-8 text-center text-sm text-vibe-lavender">
        <div className="flex flex-wrap justify-center gap-5"><Link href="/privacy" className="hover:text-ink">Privacy &amp; Parental Consent</Link><Link href="/login" className="hover:text-ink">Login</Link><Link href="/signup" className="hover:text-ink">Sign up</Link></div>
        <p className="mt-3">PING VIBE · Your World. Your Words. Your Vibe.</p>
      </footer>
    </main>
  );
}
