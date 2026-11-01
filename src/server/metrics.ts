import "server-only";
import { one } from "./db";
import { APP_TZ } from "./time";

/**
 * Learning metrics for a child since a point in time. Every mission, pet,
 * world building, kingdom location and timeline entry is evaluated against
 * these counts, which come only from recorded learning activity.
 */
export type Metrics = Record<string, number>;
export const METRIC_KEYS = [
  "always", "words_discovered", "words_mastered", "quests_completed", "learning_days", "grammar_missions", "grammar_80",
  "writing_done", "writing_sentences", "stories_built", "reading_done", "speaking_done", "listening_done", "revision_done",
  "games_played", "phonics_units", "bosses_defeated", "mystery_solved", "special_passed", "level", "treasures_claimed", "cards_collected", "pets_unlocked",
] as const;

export async function metrics(childId: string, since: Date | null = null): Promise<Metrics> {
  const s = since ? since.toISOString() : "1970-01-01T00:00:00Z";
  const r = await one<Metrics>(
    `select
      1 as always,
      (select count(*)::int from child_vocabulary_progress where child_id = $1 and first_seen_at >= $2) words_discovered,
      (select count(*)::int from child_vocabulary_progress where child_id = $1 and status = 'mastered' and mastered_at >= $2) words_mastered,
      (select count(*)::int from daily_learning_sessions where child_id = $1 and completed_at >= $2) quests_completed,
      (select count(distinct (created_at at time zone $3)::date)::int from xp_transactions where child_id = $1 and created_at >= $2 and source <> 'achievement') learning_days,
      (select count(*)::int from activity_log where child_id = $1 and module in ('grammar','grammar_drill') and created_at >= $2) grammar_missions,
      (select count(*)::int from grammar_progress where child_id = $1 and best_score >= 80) grammar_80,
      (select count(*)::int from writing_submissions where child_id = $1 and kind = 'topic' and status = 'evaluated' and submitted_at >= $2) writing_done,
      (select coalesce(sum(greatest(1, regexp_count(content, '[.!?]+'))),0)::int from writing_submissions where child_id = $1 and status = 'evaluated' and submitted_at >= $2) writing_sentences,
      (select count(*)::int from writing_submissions where child_id = $1 and kind = 'story_builder' and status = 'evaluated' and submitted_at >= $2) stories_built,
      (select count(*)::int from activity_log where child_id = $1 and module = 'reading' and created_at >= $2) reading_done,
      (select count(*)::int from speaking_sessions where child_id = $1 and created_at >= $2) speaking_done,
      (select count(*)::int from activity_log where child_id = $1 and module = 'listening' and created_at >= $2) listening_done,
      (select count(*)::int from activity_log where child_id = $1 and module = 'revision' and created_at >= $2) revision_done,
      (select count(*)::int from game_sessions where child_id = $1 and created_at >= $2) games_played,
      (select count(*)::int from phonics_progress where child_id = $1 and best_score >= 60) phonics_units,
      (select count(distinct ref)::int from challenge_attempts where child_id = $1 and kind = 'boss' and passed and submitted_at >= $2) bosses_defeated,
      (select coalesce(sum(correct),0)::int from challenge_attempts where child_id = $1 and kind = 'mystery' and submitted_at >= $2) mystery_solved,
      (select count(*)::int from challenge_attempts where child_id = $1 and kind = 'special' and passed and submitted_at >= $2) special_passed,
      (select level_id from child_profiles where child_id = $1) level,
      (select count(*)::int from child_location_claims where child_id = $1) treasures_claimed,
      (select count(*)::int from child_collectibles where child_id = $1) cards_collected,
      (select count(*)::int from child_pets where child_id = $1) pets_unlocked`,
    [childId, s, APP_TZ],
  );
  return r ?? {};
}

/** Period starts in the platform timezone: today, ISO week (Mon), month. */
export function periodStart(scope: "daily" | "weekly" | "monthly", now = new Date()): { since: Date; key: string } {
  const local = new Date(now.toLocaleString("en-US", { timeZone: APP_TZ }));
  const offset = now.getTime() - local.getTime();
  const d = new Date(local);
  d.setHours(0, 0, 0, 0);
  if (scope === "weekly") d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  if (scope === "monthly") d.setDate(1);
  const key = `${scope}:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { since: new Date(d.getTime() + offset), key };
}
