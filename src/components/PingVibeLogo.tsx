import fs from "node:fs";
import path from "node:path";
import { Logo } from "./Logo";

/** Master logo dimensions (3:2). Update if the official file has a different size. */
export const LOGO_WIDTH = 1536;
export const LOGO_HEIGHT = 1024;
export const LOGO_SRC = "/assets/brand/ping-vibe-logo.png";

let present: boolean | null = null;
export function brandLogoPresent() {
  if (present === null) {
    present = fs.existsSync(path.join(process.cwd(), "public", LOGO_SRC));
    if (!present && process.env.NODE_ENV !== "production") console.warn("[brand] public/assets/brand/ping-vibe-logo.png is missing — showing the interim wordmark.");
  }
  return present;
}

/**
 * Official PING VIBE master logo. Rendered exactly as supplied: object-fit contain,
 * original aspect ratio, no filters/crops/recolouring. Size is controlled only by width.
 * Server component (checks the asset exists); pass it as a prop/children into client components.
 */
export function PingVibeLogo({ width = 240, priority = false, className = "", fallback = "md" }: { width?: number | string; priority?: boolean; className?: string; fallback?: "sm" | "md" | "lg" }) {
  if (!brandLogoPresent()) return <Logo size={fallback} tagline={fallback === "lg"} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={LOGO_SRC} alt="PING VIBE — Your World. Your Words. Your Vibe." width={LOGO_WIDTH} height={LOGO_HEIGHT}
      fetchPriority={priority ? "high" : "auto"} loading={priority ? "eager" : "lazy"} decoding="async" draggable={false}
      className={`block h-auto max-w-full select-none ${className}`} style={{ width, aspectRatio: `${LOGO_WIDTH} / ${LOGO_HEIGHT}`, objectFit: "contain" }} />
  );
}

