import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/**
 * AI provider abstraction. Every AI feature goes through this module so the
 * provider/model can change without touching features. Keys stay server-side.
 */
export const AI_MODEL = process.env.AI_MODEL || "claude-opus-5-5";
/**
 * PINGVIBE_ANTHROPIC_API_KEY takes precedence: some hosts (e.g. Claude Code cloud environments)
 * reserve ANTHROPIC_API_KEY for their own sign-in, so the app needs a name of its own there.
 */
export const aiApiKey = () => process.env.PINGVIBE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "";
export const aiEnabled = () => Boolean(aiApiKey());

let client: Anthropic | null = null;
export function claude(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: aiApiKey(), maxRetries: 2, timeout: 60_000 });
  return client;
}

/** Server-side refusal fallback (routes a declined request to a fallback model inside the same call). */
export const FALLBACK = { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const };
