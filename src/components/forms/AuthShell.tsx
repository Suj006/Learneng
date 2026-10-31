import Link from "next/link";
import { PingVibeLogo } from "@/components/PingVibeLogo";
import { Scene } from "@/components/Scenes";

export function AuthShell({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <main id="main" className="relative min-h-dvh bg-vibe-hero">
      <div className="pv-deco absolute inset-0"><Scene name="islands" /></div>
      <div className="relative mx-auto grid min-h-dvh max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="hidden flex-col items-start gap-6 lg:flex">
          <Link href="/" className="rounded-[2rem] bg-white p-3 shadow-card"><PingVibeLogo width={380} fallback="lg" priority /></Link>
          {aside}
        </div>
        <div className="w-full">
          <Link href="/" className="mb-6 inline-block rounded-3xl bg-white p-2 lg:hidden"><PingVibeLogo width={190} fallback="md" priority /></Link>
          {children}
        </div>
      </div>
    </main>
  );
}
