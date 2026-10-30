import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Scene } from "@/components/Scenes";

export function AuthShell({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <main id="main" className="relative min-h-dvh bg-vibe-hero">
      <div className="absolute inset-0 opacity-25"><Scene name="islands" /></div>
      <div className="relative mx-auto grid min-h-dvh max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="hidden flex-col items-start gap-6 lg:flex">
          <Link href="/"><Logo size="lg" tagline /></Link>
          {aside}
        </div>
        <div className="w-full">
          <Link href="/" className="mb-6 inline-block lg:hidden"><Logo tagline /></Link>
          {children}
        </div>
      </div>
    </main>
  );
}
