"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Character, CHARACTER_INFO, type CharacterName } from "@/components/Character";
import { Scene, type SceneName } from "@/components/Scenes";
import { Burst } from "@/components/ui";
import { BrandLogo } from "@/components/BrandLogo";
import { api } from "@/lib/client";
import { audio } from "@/lib/audio/manager";
import { applyAppearance } from "@/lib/theme/client";

const CAST: { who: CharacterName; line: string }[] = [
  { who: "lexi", line: "I'm LEXI! Every day I bring you 10 magical new words." },
  { who: "grammy", line: "I'm GRAMMY, the Grammar Wizard. Together we'll make sentences sparkle!" },
  { who: "speaky", line: "I'm SPEAKY! Let's make your voice strong and confident." },
  { who: "story", line: "I'm STORY! We'll read amazing tales and write your very own." },
];

/** Play-based onboarding: character welcome → meet the buddies → kingdom tour → first adventure. */
export function Welcome({ name, kingdoms, themes }: { name: string; kingdoms: { slug: string; title: string; emoji: string; art: string; description: string }[]; themes: { slug: string; name: string; emoji: string; swatches: string[] }[] }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [cast, setCast] = useState(0);
  const [busy, setBusy] = useState(false);
  // Each buddy speaks in their own voice. The text is always on screen, so no caption is needed.
  // Lines containing the child's name use the on-device voice only (never sent to a voice service).
  const say = (t: string, who: CharacterName = "max", server = true) => void audio.say(who, t, { server, caption: false });
  useEffect(() => { audio.greetOnce("welcome", "max", `Hey ${name}! Welcome to PING VIBE! Your magical adventure starts right here!`, { server: false }); }, [name]);
  useEffect(() => {
    if (step === 1) say(CAST[cast].line, CAST[cast].who);
    if (step === 2) say("Six magical kingdoms are waiting! Learn, play and explore to unlock secret places and treasures.");
    if (step === 3) say("Pick your favourite colours! You can change them any time.", "story");
    if (step === 4) say("Let's discover your first ten magical words!", "lexi");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, cast]);
  async function start() {
    setBusy(true);
    try { const r = await api<{ redirect: string }>("/api/welcome", { body: {} }); router.push(r.redirect); router.refresh(); } catch { setBusy(false); }
  }
  const next = () => setStep((s) => s + 1);
  const [look, setLook] = useState<string | null>(null);
  const pickLook = (slug: string) => { setLook(slug); applyAppearance({ theme: slug }); api("/api/world/appearance", { body: { theme: slug } }).catch(() => {}); };
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center text-center">
      <div className="absolute inset-0 -z-10 opacity-30"><Scene name="islands" /></div>
      <div className="mb-6 flex gap-2" aria-hidden>{[0, 1, 2, 3, 4].map((i) => <span key={i} className={`h-2 w-8 rounded-full ${i <= step ? "bg-vibe-sun" : "bg-glass/15"}`} />)}</div>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center">
            <Burst />
            <div className="mb-2 rounded-[2rem] bg-white p-3 shadow-card"><BrandLogo width="min(360px, 80vw)" priority /></div>
            <Character name="max" mood="excited" size={170} />
            <h1 className="title-lg mt-4">Hey {name}! Welcome to PING VIBE!</h1>
            <p className="mt-3 max-w-xl text-xl text-vibe-lavender">Your magical adventure starts right here! I'm MAX, your adventure buddy.</p>
            <div className="mt-6 flex gap-3"><button className="btn-ghost" onClick={() => say(`Hey ${name}! Welcome to PING VIBE! Your magical adventure starts right here!`, "max", false)}>🔊 Hear MAX</button><button className="btn-primary text-lg" onClick={next}>Hi MAX! 👋</button></div>
          </motion.div>
        )}
        {step === 1 && (
          <motion.div key={`s1-${cast}`} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} className="flex flex-col items-center">
            <p className="font-display text-sm uppercase tracking-widest text-vibe-aqua-ink">Meet your buddies · {cast + 1}/{CAST.length}</p>
            <Character name={CAST[cast].who} mood={(["excited", "welcome", "celebrating", "explaining"] as const)[cast]} size={200} className="mt-2" />
            <h2 className="title-lg mt-2" style={{ color: CHARACTER_INFO[CAST[cast].who].color }}>{CHARACTER_INFO[CAST[cast].who].name}</h2>
            <p className="mt-2 max-w-lg text-xl">{CAST[cast].line}</p>
            <div className="mt-6 flex gap-3"><button className="btn-ghost" onClick={() => say(CAST[cast].line, CAST[cast].who)}>🔊 Listen</button>
              <button className="btn-primary text-lg" onClick={() => (cast + 1 < CAST.length ? setCast(cast + 1) : next())}>{cast + 1 < CAST.length ? "Next buddy →" : "Show me the worlds! 🌍"}</button></div>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full">
            <h2 className="title-lg">Six magical kingdoms are waiting!</h2>
            <p className="mt-2 text-vibe-lavender">Learn, play and explore to unlock secret places, treasures and boss battles.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
              {kingdoms.map((k, i) => (
                <motion.div key={k.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }} className="card relative h-36 overflow-hidden text-left">
                  <Scene name={k.art as SceneName} /><div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-vibe-midnight via-vibe-midnight/85 to-transparent" />
                  <div className="absolute bottom-0 p-3"><b className="font-display">{k.emoji} {k.title}</b><p className="text-[11px] text-vibe-lavender">{k.description}</p></div>
                </motion.div>
              ))}
            </div>
            <button className="btn-primary mt-8 text-lg" onClick={next}>Let's go! →</button>
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="s-look" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full">
            <h2 className="title-lg">Make PING VIBE your own!</h2>
            <p className="mt-2 text-vibe-lavender">Choose your favourite adventure colours. You can change them any time in My PING VIBE Look.</p>
            <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5" role="radiogroup" aria-label="Colour theme">
              {themes.map((t) => (
                <button key={t.slug} role="radio" aria-checked={look === t.slug} onClick={() => pickLook(t.slug)}
                  className={`card flex flex-col items-center gap-2 p-3 transition ${look === t.slug ? "ring-4 ring-vibe-purple/60" : "hover:-translate-y-0.5"}`}>
                  <span className="flex gap-1" aria-hidden>{t.swatches.map((c) => <span key={c} className="h-5 w-5 rounded-full" style={{ background: c }} />)}</span>
                  <span className="font-display text-sm font-bold">{t.emoji} {t.name}</span>
                  {look === t.slug && <span className="text-xs font-bold text-vibe-mint-ink">✓ Chosen</span>}
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-center gap-3"><button className="btn-ghost" onClick={next}>Skip</button><button className="btn-primary text-lg" onClick={next}>Looks great! →</button></div>
          </motion.div>
        )}
        {step === 4 && (
          <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
            <div className="flex items-end"><Character name="lexi" mood="excited" size={160} /><Character name="max" mood="celebrating" size={180} /></div>
            <h2 className="title-lg mt-4">Let's discover your first 10 magical words!</h2>
            <p className="mt-2 text-lg text-vibe-lavender">You'll get a welcome gift too 🎁</p>
            <button className="btn-sun mt-6 px-10 py-4 text-xl" onClick={start} disabled={busy}>{busy ? "Opening the portal…" : "Start my first adventure ✨"}</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
