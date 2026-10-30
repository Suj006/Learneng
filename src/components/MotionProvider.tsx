"use client";
import { MotionConfig } from "framer-motion";

/** Respects the OS "reduce motion" setting for every Framer Motion animation, without changing rendered markup. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
