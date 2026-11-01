import "server-only";
import { one, query } from "./db";
import { todayKey } from "./time";

/**
 * Revision overview. Vocabulary keeps its 7-box Leitner schedule (0,1,2,4,7,14,30 days). Grammar uses its own model:
 * a topic scored under 80% is suggested again 3+ days after the last try; a topic over 80% gets a retention check after 21 days.
 * Revision never counts as new words.
 */
export async function revisionPlan(childId: string) {
  const today = todayKey();
  const [v, upcoming, mastered, grammar] = await Promise.all([
    one<{ due: number; overdue: number; retention: number }>(
      `select count(*) filter (where due_on <= $2::date and first_seen_at < $2::date)::int due,
              count(*) filter (where due_on < $2::date)::int overdue,
              count(*) filter (where status = 'mastered' and due_on <= $2::date)::int retention
         from child_vocabulary_progress where child_id = $1`, [childId, today]),
    query<{ day: string; n: number }>(
      `select to_char(due_on,'YYYY-MM-DD') as "day", count(*)::int n from child_vocabulary_progress
        where child_id = $1 and due_on > $2::date and due_on <= $2::date + 7 group by due_on order by due_on`, [childId, today]),
    query<{ word: string; emoji: string; at: string }>(
      `select v.word, v.emoji, to_char(p.mastered_at,'YYYY-MM-DD') at from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id
        where p.child_id = $1 and p.mastered_at > now() - interval '14 days' order by p.mastered_at desc limit 12`, [childId]),
    query<{ slug: string; title: string; emoji: string; best_score: number; why: string }>(
      `select t.slug, t.title, t.emoji, p.best_score,
              case when p.best_score < 80 then 'practise' else 'retention' end why
         from grammar_progress p join grammar_topics t on t.id = p.topic_id
        where p.child_id = $1 and p.completed_at is not null
          and ((p.best_score < 80 and p.completed_at < now() - interval '3 days') or (p.best_score >= 80 and p.completed_at < now() - interval '21 days'))
        order by p.best_score limit 5`, [childId]),
  ]);
  return { due: v?.due ?? 0, overdue: v?.overdue ?? 0, retention: v?.retention ?? 0, upcoming, mastered, grammar };
}
