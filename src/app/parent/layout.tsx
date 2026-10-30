import Link from "next/link";
import { requireParent } from "@/server/session";
import { PingVibeLogo } from "@/components/PingVibeLogo";
import { LogoutButton } from "@/components/parent/LogoutButton";

export const dynamic = "force-dynamic";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const p = await requireParent();
  return (
    <div className="min-h-dvh bg-[radial-gradient(900px_400px_at_80%_-10%,rgba(112,71,255,0.25),transparent_60%)]">
      <header className="border-b border-white/5 bg-vibe-midnight/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/parent" className="flex items-center gap-3"><span className="rounded-xl bg-white/95 px-1"><PingVibeLogo width={84} fallback="sm" /></span><span className="chip">Parent</span></Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/parent" className="btn-ghost btn-sm">Dashboard</Link>
            <Link href="/parent/settings" className="btn-ghost btn-sm">Settings</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="mb-4 text-xs text-vibe-lavender/60">Signed in as {p.email}</p>
        {children}
      </main>
    </div>
  );
}
