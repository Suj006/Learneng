"use client";
import { useState } from "react";
import { Logo } from "./Logo";

const SRC = "/assets/brand/ping-vibe-logo.png";
const W = 1536, H = 1024;

/**
 * Client-side rendering of the official master logo (exact file, contain, original ratio).
 * If the asset is unavailable it falls back to the interim wordmark instead of a broken image.
 */
export function BrandLogo({ width = 200, className = "", fallback = "md", priority = false }: { width?: number | string; className?: string; fallback?: "sm" | "md" | "lg"; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <Logo size={fallback} tagline={fallback === "lg"} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={SRC} alt="PING VIBE — Your World. Your Words. Your Vibe." width={W} height={H} onError={() => setFailed(true)}
      loading={priority ? "eager" : "lazy"} decoding="async" draggable={false}
      className={`block h-auto max-w-full select-none ${className}`} style={{ width, aspectRatio: `${W} / ${H}`, objectFit: "contain" }} />
  );
}
