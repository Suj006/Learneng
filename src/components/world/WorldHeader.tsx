"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, type AvatarArt, type AvatarLook } from "@/components/Avatar";
import { BrandLogo } from "@/components/BrandLogo";
import { Progress } from "@/components/ui";
import { api } from "@/lib/client";

export interface HeaderData {
  name: string; levelId: number; levelName: string; tierName: string; xp: number; pct: number; nextXp: number | null; coins: number; crystals: number;
  learningDays: number; rhythm: number; unread: number; avatar: AvatarLook; art: AvatarArt; pet: string | null;
  notifications: { id: string; title: string; body: string; read_at: string | null; created_at: string }[];
}

const NAV = [
  { href: "/world", label: "Adventure", icon: "✨" },
  { href: "/world/map", label: "Map", icon: "🗺️" },
  { href: "/world/my-world", label: "My World", icon: "🏡" },
  { href: "/world/missions", label: "Missions", icon: "🎯" },
  { href: "/world/me", label: "Me", icon: "🧑‍🚀" },
];

export function WorldHeader({ d }: { d: HeaderData }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(d.unread);
  const path = usePathname();
  const router = useRouter();
  async function openBell() {
    setOpen(!open);
    if (unread) { setUnread(0); await api("/api/notifications", { body: {} }).catch(() => {}); }
  }
  async function logout() {
    await api("/api/auth/logout", { body: {} }).catch(() => {});
    window.location.assign("/login");
  }
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/5 bg-vibe-midnight/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/world" className="hidden shrink-0 rounded-xl bg-white px-1 md:block" aria-label="PING VIBE — Daily Adventure"><BrandLogo width={96} fallback="sm" /></Link>
          <Link href="/world/avatar" className="shrink-0" aria-label="My avatar"><Avatar look={d.avatar} art={d.art} size={44} pet={null} /></Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2"><span className="truncate font-display font-bold">{d.name}</span><span className="chip px-2 py-0.5 text-[11px]">Lv {d.levelId}</span></div>
            <div className="flex items-center gap-2"><Progress value={d.pct} className="h-2 max-w-[180px]" label="XP to next level" /><span className="hidden text-[11px] text-vibe-lavender/80 sm:inline">{d.xp.toLocaleString()} XP</span></div>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-bold sm:gap-2">
            <span className="chip bg-vibe-sun/15 text-vibe-sun" title="Vibe Coins">🪙 {d.coins}</span>
            <span className="chip hidden bg-vibe-aqua/15 text-vibe-aqua sm:inline-flex" title="Magic Crystals">💎 {d.crystals}</span>
            <span className="chip hidden bg-vibe-coral/15 text-vibe-coral sm:inline-flex" title="Learning rhythm (rest days don't break it)">🔥 {d.rhythm}</span>
            <button onClick={openBell} className="relative rounded-full p-2 hover:bg-white/10" aria-label={`Notifications${unread ? `, ${unread} new` : ""}`}>
              🔔{unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-vibe-coral px-1 text-[10px]">{unread}</span>}
            </button>
          </div>
          <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((n) => <Link key={n.href} href={n.href} className={`rounded-full px-3 py-2 text-sm font-bold ${path === n.href ? "bg-white/10 text-white" : "text-vibe-lavender hover:text-white"}`}>{n.icon} {n.label}</Link>)}
          </nav>
        </div>
        {open && (
          <div className="absolute right-4 top-full mt-2 w-[min(92vw,380px)] rounded-3xl border border-white/10 bg-vibe-midnight-2 p-3 shadow-card">
            <div className="flex items-center justify-between px-2 pb-2"><b className="font-display">Notifications</b><button onClick={logout} className="text-xs text-vibe-lavender underline">Log out</button></div>
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {d.notifications.length === 0 && <li className="p-3 text-sm text-vibe-lavender">Nothing yet — go on an adventure!</li>}
              {d.notifications.map((n) => <li key={n.id} className="rounded-2xl bg-white/5 p-3 text-sm"><div className="font-bold">{n.title}</div><div className="text-vibe-lavender/80">{n.body}</div></li>)}
            </ul>
          </div>
        )}
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-vibe-midnight/95 backdrop-blur lg:hidden" aria-label="Main">
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${path === n.href ? "text-white" : "text-vibe-lavender/70"}`}>
              <span className="text-xl">{n.icon}</span>{n.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
