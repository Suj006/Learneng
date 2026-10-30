import { z } from "zod";
import { adminRoute, body, ok } from "@/server/api";
import { query } from "@/server/db";
import { validateContent } from "@/server/content/validate";

/** Manually authored content goes through the same validation gates and lands in the review queue. */
export const POST = adminRoute(async (req) => {
  const d = await body(req, z.object({ kind: z.enum(["vocabulary", "writing_topic", "story", "grammar", "speaking"]), band: z.number().int().min(1).max(4), title: z.string().min(1).max(120), body: z.record(z.string(), z.any()) }));
  const v = await validateContent(d.kind, d.band, d.body);
  await query(`insert into content_library (kind, title, band, body, validation, source, status) values ($1,$2,$3,$4,$5,'manual','pending')`,
    [d.kind, d.title, d.band, JSON.stringify(d.body), JSON.stringify(v)]);
  return ok({ validation: v });
});
