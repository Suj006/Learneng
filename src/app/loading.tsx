import { Logo } from "@/components/Logo";

export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4" role="status">
      <div className="animate-float"><Logo size="md" /></div>
      <div className="h-2 w-48 overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-vibe-aqua to-transparent bg-[length:200%_100%]" /></div>
      <span className="text-sm text-vibe-lavender">Opening portals…</span>
    </div>
  );
}
