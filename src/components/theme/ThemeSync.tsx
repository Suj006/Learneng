"use client";
import { useEffect } from "react";
import { applyAppearance } from "@/lib/theme/client";

/** Keeps the whole page (and this device's cookie) in step with the child's saved appearance, e.g. on a new device. */
export function ThemeSync({ theme, motion }: { theme: string; motion: "full" | "calm" | "off" }) {
  useEffect(() => { applyAppearance({ theme, motion }, { animate: false, save: false }); }, [theme, motion]);
  return null;
}
