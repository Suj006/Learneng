"use client";
import { useEffect, useState } from "react";

/** True only after hydration — use for browser-only capabilities (speech APIs, randomness) to avoid SSR mismatches. */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}
