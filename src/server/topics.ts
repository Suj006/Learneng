import "server-only";
import { one, query } from "./db";
import { skillBand } from "./journey";
import { bandForGrade } from "@/lib/grades";

export interface Topic { id: string; slug: string; title: string; prompt: string; band: number; mode: string; min_words: number; suggested_words: string[]; emoji: string; category: string }

/**
 * Topic engine: picks fresh topics at the child's writing level, avoiding anything
 * shown in the last 60 days, mixing the requested category with variety picks.
 */
export async function pickTopics(childId: string, grade: string, category?: string, n = 6): Promise<Topic[]> {
  const p = await one<{ skill_writing: number }>(`select skill_writing from child_profiles where child_id = $1`, [childId]);
  const band = skillBand(bandForGrade(grade), p?.skill_writing ?? 50);
  const fresh = (cat: string | null, limit: number, exclude: string[]) => query<Topic>(
    `select id, slug, title, prompt, band, mode, min_words, suggested_words, emoji, category from writing_topics t
     where active and band = $2 and ($3::text is null or category = $3) and not (id = any($4::uuid[]))
       and not exists (select 1 from writing_topic_history h where h.child_id = $1 and h.topic_id = t.id and h.shown_on > current_date - 60)
     order by (source = 'seed') desc, random() limit $5`, [childId, band, cat, exclude, limit]);
  let topics: Topic[] = [];
  if (category) topics = await fresh(category, Math.ceil(n / 2), []);
  topics = [...topics, ...(await fresh(null, n - topics.length, topics.map((t) => t.id)))];
  if (topics.length < n) {
    // Every topic at this level was seen recently: allow the oldest-seen ones again.
    topics = [...topics, ...(await query<Topic>(
      `select t.id, t.slug, t.title, t.prompt, t.band, t.mode, t.min_words, t.suggested_words, t.emoji, t.category from writing_topics t
       join writing_topic_history h on h.topic_id = t.id and h.child_id = $1 where t.band = $2 and not (t.id = any($3::uuid[])) order by h.shown_on limit $4`,
      [childId, band, topics.map((t) => t.id), n - topics.length]))];
  }
  if (topics.length) {
    await query(`insert into writing_topic_history (child_id, topic_id) select $1, unnest($2::uuid[]) on conflict (child_id, topic_id) do update set shown_on = current_date`, [childId, topics.map((t) => t.id)]);
  }
  return topics;
}
