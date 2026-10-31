import Link from "next/link";
import { requireAdmin } from "@/server/session";
import { PingVibeLogo } from "@/components/PingVibeLogo";
import { LogoutButton } from "@/components/parent/LogoutButton";

export const dynamic = "force-dynamic";
const NAV = [["/admin", "Analytics"], ["/admin/content", "Content Studio"], ["/admin/vocabulary", "Vocabulary"], ["/admin/economy", "Rewards & Levels"], ["/admin/events", "Events"], ["/admin/grades", "Grades"]];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const a = await requireAdmin();
  return (
    <div className="min-h-dvh">
      <header className="border-b border-white/5 bg-vibe-midnight-2/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2"><span className="rounded-xl bg-white/95 px-1"><PingVibeLogo width={84} fallback="sm" /></span><span className="chip text-[#FF9A9A]">Admin</span></Link>
          <nav className="flex flex-1 flex-wrap gap-1">{NAV.map(([h, l]) => <Link key={h} href={h} className="rounded-full px-3 py-1.5 text-sm font-semibold text-vibe-lavender hover:bg-white/10 hover:text-white">{l}</Link>)}</nav>
          <span className="text-xs text-vibe-lavender">{a.email}</span><LogoutButton to="/admin/login" />
        </div>
      </header>
      <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
