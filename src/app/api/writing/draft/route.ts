import { z } from "zod";
import { body, childRoute, HttpError, ok } from "@/server/api";
import { one } from "@/server/db";

const countWords = (t: string) => (t.match(/[A-Za-z']+/g) ?? []).length;

export const POST = childRoute(async (req, child) => {
  const d = await body(req, z.object({
    submissionId: z.string().uuid().optional(),
    topicId: z.string().uuid().optional(),
    kind: z.enum(["topic", "story_builder"]),
    title: z.string().trim().min(1).max(120),
    content: z.string().max(6000, "That's a very long piece! Please keep it under 6000 characters."),
    meta: z.record(z.string(), z.string().max(120)).optional(),
  }));
  if (d.submissionId) {
    const row = await one<{ id: string }>(
      `update writing_submissions set content = $3, word_count = $4, updated_at = now()
       where id = $1 and child_id = $2 and status = 'draft' returning id`,
      [d.submissionId, child.id, d.content, countWords(d.content)]);
    if (!row) throw new HttpError(404, "Draft not found.");
    return ok({ submissionId: row.id });
  }
  const row = await one<{ id: string }>(
    `insert into writing_submissions (child_id, topic_id, kind, title, content, word_count, prompt_meta) values ($1,$2,$3,$4,$5,$6,$7) returning id`,
    [child.id, d.topicId ?? null, d.kind, d.title, d.content, countWords(d.content), JSON.stringify(d.meta ?? {})]);
  return ok({ submissionId: row!.id });
});
