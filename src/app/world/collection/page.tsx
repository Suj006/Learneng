import { requireChild } from "@/server/session";
import { collection } from "@/server/world";
import { PageTitle, RarityBadge, RARITY, SpeakButton } from "@/components/ui";

export const metadata = { title: "Collection Book" };

export default async function Collection() {
  const child = await requireChild();
  const c = await collection(child.id);
  const ownedCards = c.cards.filter((k) => k.owned).length;
  return (
    <div className="space-y-10">
      <PageTitle title="🃏 My Collection Book" subtitle="Rarity shows how special a card is — every card is earned by learning, never by luck." back="/world/museum" />
      <section><h2 className="title-md">Vocabulary cards <span className="text-base text-vibe-lavender">({c.vocab.length}/{c.totals?.words} — master a word to collect it)</span></h2>
        {c.vocab.length === 0 && <p className="mt-2 text-vibe-lavender">Master your first word to earn your first card!</p>}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{c.vocab.map((v) => (
          <article key={v.id} className={`card border-2 p-4 ${RARITY[v.rarity].ring} ${RARITY[v.rarity].glow}`}>
            <div className="flex items-center justify-between"><span className="text-4xl">{v.emoji}</span><RarityBadge rarity={v.rarity} /></div>
            <h3 className="mt-2 font-display text-2xl font-bold">{v.word}</h3><p className="text-sm text-vibe-aqua-ink">{v.phonetic}</p>
            <p className="mt-2 text-sm">{v.meaning}</p><p className="mt-1 text-xs italic text-vibe-lavender">“{v.example}”</p>
            <SpeakButton text={v.word} className="mt-3" />
          </article>
        ))}</div>
      </section>
      <section><h2 className="title-md">Grammar & story cards</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.grammar.map((g) => <article key={g.title} className={`card border-2 p-4 ${RARITY.rare.ring}`}><div className="flex justify-between"><span className="text-3xl">{g.emoji}</span><RarityBadge rarity="rare" /></div><h3 className="mt-2 font-display text-lg font-bold">{g.title}</h3><p className="text-sm text-vibe-lavender">{g.explanation}</p></article>)}
          {c.stories.map((s) => <article key={s.title} className={`card border-2 p-4 ${RARITY.rare.ring}`}><div className="flex justify-between"><span className="text-3xl">{s.emoji}</span><RarityBadge rarity="rare" /></div><h3 className="mt-2 font-display text-lg font-bold">{s.title}</h3><p className="text-sm text-vibe-lavender">{s.genre} story — read & completed</p></article>)}
          {!c.grammar.length && !c.stories.length && <p className="text-vibe-lavender">Score 80%+ in a grammar mission or finish a Reading Adventure to collect these.</p>}
        </div>
      </section>
      <section><h2 className="title-md">Character, creature & event cards ({ownedCards}/{c.cards.length})</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{c.cards.map((k) => (
          <article key={k.slug} className={`card border-2 p-4 ${k.owned ? `${RARITY[k.rarity].ring} ${RARITY[k.rarity].glow}` : "border-dashed border-line/20"}`}>
            <div className="flex justify-between"><span className={`text-4xl ${k.owned ? "" : "opacity-50 grayscale"}`}>{k.owned ? k.emoji : "❔"}</span><RarityBadge rarity={k.rarity} /></div>
            <h3 className="mt-2 font-display font-bold">{k.owned ? k.title : "Undiscovered card"}</h3>
            <p className="mt-1 text-xs text-vibe-lavender">{k.owned ? k.fact : k.kind === "character" ? "Complete this character's mission." : k.kind === "creature" ? "Defeat this boss." : "Join this special event."}</p>
            {k.owned && <p className="mt-2 rounded-xl bg-glass/5 p-2 text-xs">📘 {k.lesson}</p>}
          </article>
        ))}</div>
      </section>
    </div>
  );
}
