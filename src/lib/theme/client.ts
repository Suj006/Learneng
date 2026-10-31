"use client";
/** Client side of the theme engine: switch instantly (no reload), with a short colour transition, and remember it. */
export type Motion = "full" | "calm" | "off";
const YEAR = 60 * 60 * 24 * 365;

export function applyAppearance(a: { theme?: string | null; motion?: Motion }, opts: { animate?: boolean; save?: boolean; childId?: string } = {}) {
  const d = document.documentElement;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || a.motion === "off";
  if (opts.animate !== false && !reduce && a.theme !== undefined) {
    d.classList.add("theme-switching");
    setTimeout(() => d.classList.remove("theme-switching"), 600);
  }
  if (a.theme !== undefined) {
    if (a.theme) { d.setAttribute("data-theme", a.theme); document.cookie = `pv-theme=${a.theme}; path=/; max-age=${YEAR}; samesite=lax`; }
    else { d.removeAttribute("data-theme"); document.cookie = "pv-theme=; path=/; max-age=0; samesite=lax"; }
    // World pages carry the theme on their wrapper too (server-rendered); keep it in step.
    document.querySelectorAll<HTMLElement>("[data-theme-scope]").forEach((el) => (a.theme ? el.setAttribute("data-theme", a.theme) : el.removeAttribute("data-theme")));
  }
  if (a.motion) {
    d.setAttribute("data-motion", a.motion);
    document.cookie = `pv-motion=${a.motion}; path=/; max-age=${YEAR}; samesite=lax`;
    window.dispatchEvent(new CustomEvent("pv-motion", { detail: a.motion }));
  }
}
