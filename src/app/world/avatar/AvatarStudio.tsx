"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Avatar, SKIN, type AvatarLook } from "@/components/Avatar";
import { ErrorNote, RARITY } from "@/components/ui";
import { api } from "@/lib/client";

type Item = { slug: string; title: string; category: string; emoji: string; rarity: string; art: string | null; owned: boolean; cost_coins: number; cost_crystals: number; min_level: number; level_exclusive: boolean };
type Full = AvatarLook & { celebration: string };
const TABS: { key: string; label: string; field: keyof Full; optional?: boolean }[] = [
  { key: "hair", label: "Hair", field: "hair" }, { key: "outfit", label: "Clothes", field: "outfit" }, { key: "shoes", label: "Shoes", field: "shoes" },
  { key: "expression", label: "Expression", field: "expression" }, { key: "accessory", label: "Accessories", field: "accessory", optional: true },
  { key: "magic_object", label: "Magic objects", field: "magic_object", optional: true }, { key: "background", label: "Background", field: "background" }, { key: "animation", label: "Celebration", field: "celebration" },
];

export function AvatarStudio({ initial, items, hairColors, pet }: { initial: Full; items: Item[]; hairColors: string[]; pet: string | null }) {
  const router = useRouter();
  const [look, setLook] = useState<Full>(initial);
  const [tab, setTab] = useState("hair");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const art = useMemo(() => Object.fromEntries(items.map((i) => [i.slug, { art: i.art, emoji: i.emoji }])), [items]);
  const t = TABS.find((x) => x.key === tab)!;
  const list = items.filter((i) => i.category === tab || (tab === "accessory" && i.category === "costume"));
  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="card flex min-w-0 flex-col items-center gap-4 p-4 sm:p-6 lg:sticky lg:top-24 lg:self-start">
        <Avatar look={look} art={art} size={220} pet={pet} />
        <div><div className="label text-center">Skin tone</div><div className="flex flex-wrap justify-center gap-2">{Object.entries(SKIN).map(([k, c]) => <button key={k} aria-label={`Skin tone ${k}`} onClick={() => setLook({ ...look, skin: k })} className={`h-9 w-9 rounded-full border-4 ${look.skin === k ? "border-vibe-aqua" : "border-transparent"}`} style={{ background: c }} />)}</div></div>
        <div><div className="label text-center">Hair colour</div><div className="flex flex-wrap justify-center gap-2">{hairColors.map((c) => <button key={c} aria-label={`Hair colour ${c}`} onClick={() => setLook({ ...look, hair_color: c })} className={`h-8 w-8 rounded-full border-4 ${look.hair_color === c ? "border-vibe-aqua" : "border-transparent"}`} style={{ background: c }} />)}</div></div>
        <button className="btn-primary w-full" onClick={async () => { setErr(null); try { await api("/api/avatar", { body: look }); setMsg("Saved! Looking awesome ✨"); router.refresh(); } catch (e) { setErr((e as Error).message); } }}>Save my look</button>
        {msg && <p className="text-sm text-vibe-mint">{msg}</p>}<ErrorNote error={err} />
      </div>
      <div className="min-w-0">
        <div className="row-scroll">{TABS.map((x) => <button key={x.key} onClick={() => setTab(x.key)} className={`btn btn-sm shrink-0 ${tab === x.key ? "bg-vibe-cta text-white" : "btn-ghost"}`}>{x.label}</button>)}</div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 xl:grid-cols-4">
          {t.optional && <button onClick={() => setLook({ ...look, [t.field]: null })} className={`card p-4 text-center ${!look[t.field] ? "ring-2 ring-vibe-aqua" : ""}`}><div className="text-4xl">🚫</div><div className="mt-1 text-sm font-bold">None</div></button>}
          {list.map((i) => {
            const on = look[t.field] === i.slug;
            return (
              <button key={i.slug} disabled={!i.owned} onClick={() => setLook({ ...look, [t.field]: i.slug })}
                className={`card min-w-0 break-words border-2 p-3 text-center transition sm:p-4 ${RARITY[i.rarity].ring} ${on ? "ring-2 ring-vibe-aqua" : ""} ${i.owned ? "hover:-translate-y-0.5" : "opacity-50"}`}>
                <div className="text-4xl">{i.emoji}</div><div className="mt-1 text-sm font-bold">{i.title}</div>
                <div className={`text-[11px] ${RARITY[i.rarity].text}`}>{RARITY[i.rarity].label}</div>
                {!i.owned && <div className="mt-1 text-[11px]">{i.level_exclusive ? `🔒 Level ${i.min_level} reward` : `🔒 ${i.cost_coins ? `🪙${i.cost_coins}` : ""}${i.cost_crystals ? ` 💎${i.cost_crystals}` : ""}${i.min_level > 1 ? ` · Lv ${i.min_level}` : ""}`}</div>}
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-vibe-lavender">Locked items can be unlocked in the <Link href="/world/rewards" className="text-vibe-aqua underline">Reward Shop</Link> with coins and crystals you earn by learning.</p>
      </div>
    </div>
  );
}
