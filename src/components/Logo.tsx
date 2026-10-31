export function Logo({ size = "md", tagline = false, badge = false }: { size?: "sm" | "md" | "lg"; tagline?: boolean; badge?: boolean }) {
  const text = size === "lg" ? "text-5xl sm:text-7xl" : size === "sm" ? "text-xl" : "text-2xl";
  return (
    <span className={`inline-flex flex-col leading-none ${badge ? "rounded-xl bg-vibe-midnight px-3 py-2" : ""}`}>
      <span className={`font-display font-bold tracking-tight ${text}`}>
        <span className="text-ink">PING</span>
        <span className="mx-1 inline-block h-[0.55em] w-[0.55em] rounded-full bg-vibe-cta align-middle shadow-glow" aria-hidden />
        <span className="text-gradient">VIBE</span>
      </span>
      {tagline && <span className="mt-2 text-xs font-semibold tracking-wide text-vibe-lavender sm:text-sm">Your World. Your Words. Your Vibe.</span>}
    </span>
  );
}
