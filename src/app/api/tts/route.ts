import { z } from "zod";
import { body, childRoute, HttpError } from "@/server/api";
import { rateLimit } from "@/server/ratelimit";
import { synthesize, ttsEnabled } from "@/server/tts";

/** Neural voice for character lines (only when AZURE_SPEECH_* is configured). Signed-in Explorers only, rate-limited. */
export const POST = childRoute(async (req, child) => {
  if (!ttsEnabled()) throw new HttpError(404, "Neural voices are not configured.");
  const d = await body(req, z.object({ who: z.enum(["lexi", "grammy", "speaky", "story", "max", "narrator"]), text: z.string().trim().min(1).max(600) }));
  if (!(await rateLimit(`tts:${child.id}`, 150, 3600))) throw new HttpError(429, "Lots of talking today! Voices will be back soon.");
  try {
    const audio = await synthesize(d.who, d.text);
    return new Response(audio, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=86400" } });
  } catch (e) {
    console.error("[tts]", (e as Error).message);
    throw new HttpError(502, "Voice unavailable.");
  }
});
