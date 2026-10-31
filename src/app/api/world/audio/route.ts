import { z } from "zod";
import { body, childRoute, ok } from "@/server/api";
import { query } from "@/server/db";

const vol = z.number().min(0).max(1);
/** Saves the child's sound preferences so they follow the child to other devices. */
export const POST = childRoute(async (req, child) => {
  const p = await body(req, z.object({ master: vol, music: vol, sfx: vol, voice: vol, musicOn: z.boolean(), sfxOn: z.boolean(), voiceOn: z.boolean(), captions: z.boolean() }).strict());
  await query(`update child_profiles set audio_prefs = $2 where child_id = $1`, [child.id, JSON.stringify(p)]);
  return ok();
});
