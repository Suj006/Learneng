"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import { coinPrice } from "@/lib/economy";
import { Celebration, ErrorNote, InlineSpinner, RarityBadge, RARITY } from "@/components/ui";

type Item = { slug: string; title: string; category: string; emoji: string; rarity: string; description: string; cost_coins: number; cost_crystals: number; min_level: number; level_exclusive: boolean; owned: boolean };
const CATS: [string, string][] = [["all", "All"], ["buddy", "Buddies"], ["outfit", "Costumes"], ["hair", "Hair"], ["expression", "Expressions"], ["shoes", "Shoes"], ["accessory", "Accessories"], ["magic_object", "Magic objects"], ["background", "Backgrounds"], ["theme", "World themes"], ["decoration", "Decorations"], ["animation", "Animations"], ["stories", "Stories"], ["costume", "Level rewards"]];

export function Shop({ items, wallet, equipped }: { items: Item[]; wallet: { coins: number; crystals: number; level: number }; equipped: { buddy: string; theme: string } }) {
  const router = useRouter();
  const [cat, setCat] = useState("all");
  const [err, setErr] = useState<string | null>(null);
  const [got, setGot] = useState<{ item: Item; coins: number; crystals: number } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const catLabel = (c: string) => CATS.find(([k]) => k === c)?.[1] ?? c;
  /** Shown as collected only after the server confirms the purchase. */
  async function redeem(i: Item) {
    if (busy) return;
    setErr(null); setBusy(i.slug);
    try { const r = await api<{ coins: number; crystals: number }>("/api/rewards/redeem", { body: { slug: i.slug } }); setGot({ item: i, coins: r.coins, crystals: r.crystals }); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(null); }
  }
  async function equip(i: Item) {
    if (busy) return;
    setErr(null); setBusy(i.slug);
    try { await api("/api/rewards/equip", { body: { slug: i.slug } }); router.refresh(); }
    catch (e) { setErr((e as Error).message); } finally { setBusy(null); }
  }
  const list = items.filter((i) => cat === "all" || i.category === cat);
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2"><span className="chip bg-vibe-sun/15 text-base text-vibe-sun-ink" title="VIBE COINS = Your reward shopping power">🪙 {wallet.coins} VIBE COINS</span><span className="chip text-base">⭐ Level {wallet.level}</span></div>
      <div className="row-scroll">{CATS.map(([k, l]) => <button key={k} onClick={() => setCat(k)} className={`btn btn-sm shrink-0 ${cat === k ? "bg-vibe-cta text-white" : "btn-ghost"}`}>{l}</button>)}</div>
      <div aria-live="polite"><ErrorNote error={err} /></div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {list.map((i) => {
          const locked = wallet.level < i.min_level;
          const equippable = i.category === "buddy" || i.category === "theme";
          const isOn = equipped.buddy === i.slug || equipped.theme === i.slug;
          return (
            <article key={i.slug} className={`card flex flex-col border-2 p-4 ${RARITY[i.rarity].ring} ${i.rarity === "legendary" ? RARITY.legendary.glow : ""}`}>
              <div className="flex justify-between"><span className="text-4xl">{i.emoji}</span><RarityBadge rarity={i.rarity} /></div>
              <b className="mt-2 font-display">{i.title}</b><p className="mt-1 flex-1 text-xs text-vibe-lavender">{i.description}</p>
              {i.owned ? (
                equippable ? <button disabled={isOn || busy === i.slug} aria-busy={busy === i.slug} className="btn-ghost btn-sm mt-3" onClick={() => equip(i)}>{isOn ? "In use ✅" : busy === i.slug ? <InlineSpinner /> : "Use"}</button> : <span className="chip mt-3 justify-center text-vibe-mint-ink">Owned ✅</span>
              ) : i.level_exclusive ? <span className="chip mt-3 justify-center">🔒 Reach Level {i.min_level}</span>
                : <button disabled={locked || !!busy} aria-busy={busy === i.slug} aria-label={locked ? undefined : `Unlock ${i.title}`} className="btn-sun btn-sm mt-3" onClick={() => redeem(i)}>
                    {locked ? `🔒 Level ${i.min_level}` : busy === i.slug ? <><InlineSpinner /> Unlocking…</> : <>🪙 {coinPrice(i.cost_coins, i.cost_crystals)}</>}
                  </button>}
            </article>
          );
        })}
      </div>
      {got && <Celebration title="Unlocked!" reward={{ emoji: got.item.emoji, title: got.item.title, category: catLabel(got.item.category), cost: { coins: coinPrice(got.item.cost_coins, got.item.cost_crystals) } }}
        balance={{ coins: got.coins }} message={got.item.category === "buddy" || got.item.category === "theme" ? "Tap “Use” to switch it on!" : "Find it in your Avatar Studio or your World."}
        cta={{ href: "/world/avatar", label: "🎨 Avatar Studio" }} onClose={() => { setGot(null); router.refresh(); }} />}
    </div>
  );
}
