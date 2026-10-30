import { childRoute, ok } from "@/server/api";
import { query } from "@/server/db";
import { todayKey } from "@/server/time";
import { buildRevisionQuestions, type Word } from "@/server/vocab";

export const GET = childRoute(async (req, child) => {
  const ids = req.nextUrl.searchParams.get("words")?.split(",").filter((x) => /^[0-9a-f-]{36}$/.test(x)).slice(0, 12) ?? [];
  const words = await query<Word & { status: string }>(
    ids.length
      ? `select v.*, p.status from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id where p.child_id = $1 and p.word_id = any($3::uuid[]) and $2::date is not null`
      : `select v.*, p.status from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id
         where p.child_id = $1 order by (p.due_on <= $2::date) desc, p.due_on, p.wrong_count desc, random() limit 10`,
    ids.length ? [child.id, todayKey(), ids] : [child.id, todayKey()]);
  return ok({ words, questions: await buildRevisionQuestions(words) });
});
