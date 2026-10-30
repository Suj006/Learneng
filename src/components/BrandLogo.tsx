"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";

const SRC = "/assets/brand/ping-vibe-logo.png";
const W = 1536, H = 1024;

/** Whether the master logo file exists on the server (decided once in the root layout). */
const BrandAssetContext = createContext(true);
export function BrandAssetProvider({ present, children }: { present: boolean; children: React.ReactNode }) {
  return <BrandAssetContext.Provider value={present}>{children}</BrandAssetContext.Provider>;
}

/**
 * Client-side rendering of the official master logo (exact file, contain, original ratio).
 * If the asset is unavailable it falls back to the interim wordmark instead of a broken image.
 */
export function BrandLogo({ width = 200, className = "", fallback = "md", priority = false }: { width?: number | string; className?: string; fallback?: "sm" | "md" | "lg"; priority?: boolean }) {
  const present = useContext(BrandAssetContext);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // A load error that happens before hydration never reaches onError — detect it after mount.
  useEffect(() => { const img = ref.current; if (img?.complete && img.naturalWidth === 0) setFailed(true); }, []);
  if (!present || failed) return <Logo size={fallback} tagline={fallback === "lg"} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={SRC} alt="PING VIBE — Your World. Your Words. Your Vibe." width={W} height={H} onError={() => setFailed(true)}
      loading={priority ? "eager" : "lazy"} decoding="async" draggable={false}
      className={`block h-auto max-w-full select-none ${className}`} style={{ width, aspectRatio: `${W} / ${H}`, objectFit: "contain" }} />
  );
}
