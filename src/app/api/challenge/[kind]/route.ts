import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one } from "@/server/db";
import { createChallenge, submitChallenge, type Kind } from "@/server/challenge";
import { rateLimit } from "@/server/ratelimit";

const KINDS: Kind[] = ["weekly", "monthly", "boss", "special", "mystery", "family", "listening"];

export const GET = childRoute(async (req, child, params: { kind: string }) => {
  if (!KINDS.includes(params.kind as Kind)) throw new HttpError(404, "Unknown challenge.");
  if (!(await rateLimit(`challenge:${child.id}`, 40, 3600))) throw new HttpError(429, "Let's take a little break before the next challenge! 🌿");
  const sp = req.nextUrl.searchParams;
  const p = await one<{ vocab_band: number; level_id: number }>(`select vocab_band, level_id from child_profiles where child_id = $1`, [child.id]);
  const ref = sp.get("ref") ?? undefined;
  if (params.kind === "boss") {
    const b = await one<{ unlock_level: number }>(`select unlock_level from boss_battles where slug = $1`, [ref]);
    if (!b) throw new HttpError(404, "Boss not found.");
    if ((p?.level_id ?? 1) < b.unlock_level) throw new HttpError(403, `Reach Level ${b.unlock_level} to challenge this boss!`);
  }
  const difficulty = (["easy", "normal", "hard"].includes(sp.get("difficulty") ?? "") ? sp.get("difficulty") : "normal") as "easy" | "normal" | "hard";
  try {
    return ok(await createChallenge(child.id, p?.vocab_band ?? 1, params.kind as Kind, { ref, difficulty, familyId: sp.get("family") ?? undefined }));
  } catch (e) {
    throw new HttpError(404, (e as Error).message);
  }
});

export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({ attemptId: z.string().uuid(), answers: z.array(z.string().max(300)).max(40), seconds: z.number().min(0).max(3600) }));
  const r = await submitChallenge(child.id, d.attemptId, d.answers, d.seconds);
  if ("error" in r) throw new HttpError(400, r.error as string);
  return ok(r);
});
