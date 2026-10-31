"use client";
import { MotionConfig } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * Respects the OS "reduce motion" setting for every Framer Motion animation, and the child's own
 * "Animations: off" appearance choice (data-motion on <html>), without changing rendered markup.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [off, setOff] = useState(false);
  useEffect(() => {
    setOff(document.documentElement.getAttribute("data-motion") === "off");
    const on = (e: Event) => setOff((e as CustomEvent).detail === "off");
    window.addEventListener("pv-motion", on);
    return () => window.removeEventListener("pv-motion", on);
  }, []);
  return <MotionConfig reducedMotion={off ? "always" : "user"}>{children}</MotionConfig>;
}
