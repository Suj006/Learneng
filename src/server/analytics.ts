import "server-only";
import { one, query } from "./db";
import { APP_TZ } from "./time";
import { coverage } from "./content/pipeline";

export async function platformAnalytics() {
  const k = (await one<Record<string, number>>(
    `select
      (select count(*)::int from parents) parents,
      (select count(*)::int from children where status = 'active') learners,
      (select count(distinct child_id)::int from xp_transactions where (created_at at time zone $1)::date = (now() at time zone $1)::date) dau,
      (select count(distinct child_id)::int from xp_transactions where created_at > now() - interval '7 days') wau,
      (select count(distinct child_id)::int from xp_transactions where created_at > now() - interval '30 days') mau,
      (select count(*)::int from daily_learning_sessions where completed_at is not null) quests_completed,
      (select count(*)::int from daily_learning_sessions) quests_started,
      (select round(100.0 * sum(correct) / nullif(sum(attempted),0))::int from daily_learning_sessions where session_date > current_date - 30) quest_accuracy,
      (select count(*)::int from child_vocabulary_progress where status = 'mastered') words_mastered,
      (select count(*)::int from child_vocabulary_progress) words_discovered,
      (select round(avg(score))::int from writing_evaluations) writing_avg,
      (select round(avg(best_score))::int from grammar_progress) grammar_avg,
      (select round(avg(best_score))::int from story_progress) reading_avg,
      (select count(distinct child_id)::int from speaking_sessions where created_at > now() - interval '30 days') speaking_participants,
      (select count(*)::int from child_missions where claimed_at is not null) missions_claimed,
      (select count(*)::int from xp_transactions where source = 'shop') redemptions,
      (select count(*)::int from challenge_attempts where kind = 'boss' and passed) bosses_defeated,
      (select count(*)::int from (select child_id from xp_transactions where created_at between now() - interval '14 days' and now() - interval '7 days' group by child_id
         intersect select child_id from xp_transactions where created_at > now() - interval '7 days' group by child_id) r) returning_learners,
      (select count(distinct child_id)::int from xp_transactions where created_at between now() - interval '14 days' and now() - interval '7 days') prior_week_learners`,
    [APP_TZ]))!;
  const levels = await query<{ tier_name: string; n: number }>(`select l.tier_name, count(*)::int n from child_profiles p join learning_levels l on l.id = p.level_id group by l.tier_name, l.tier order by l.tier`);
  const kingdoms = await query<{ title: string; n: number }>(`select k.title, (select count(*)::int from child_profiles p where p.level_id >= k.unlock_level) n from kingdoms k order by k.sort_order`);
  // Activity health: engagement vs learning outcome; flags formats that look too hard or are abandoned quickly.
  const activities = await query<{ module: string; sessions: number; learners: number; avg_minutes: number; avg_score: number | null; quick_exits: number }>(
    `select module, count(*)::int sessions, count(distinct child_id)::int learners, round(avg(seconds)/60.0, 1)::float avg_minutes,
       round(avg(coalesce((detail->>'score')::numeric, (detail->>'accuracy')::numeric * 100)))::int avg_score,
       count(*) filter (where seconds < 20)::int quick_exits
     from activity_log where created_at > now() - interval '30 days' group by module order by sessions desc`);
  const games = await query<{ game_slug: string; plays: number; avg_pct: number }>(
    `select game_slug, count(*)::int plays, round(avg(100.0 * score / nullif(max_score,0)))::int avg_pct from game_sessions where created_at > now() - interval '30 days' group by game_slug order by plays desc`);
  const writingTrend = await one<{ first_avg: number | null; latest_avg: number | null }>(
    `with ranked as (select w.child_id, e.score, row_number() over (partition by w.child_id order by e.created_at) rn, count(*) over (partition by w.child_id) cnt
       from writing_evaluations e join writing_submissions w on w.id = e.submission_id)
     select round(avg(score) filter (where rn = 1))::int first_avg, round(avg(score) filter (where rn = cnt and cnt > 1))::int latest_avg from ranked`);
  const cov = await coverage();
  const levelCount = (await one<{ n: number }>(`select count(*)::int n from learning_levels`))!.n;
  const minWords = (await one<{ n: number }>(`select min(new_words_per_day)::int n from grade_config where active`))!.n;
  const formats = (await one<{ n: number }>(`select count(*)::int n from games where active`))!.n;
  return {
    kpis: k, levels, kingdoms, activities, games, writingTrend,
    objectives: [
      { name: "Content availability", target: "365+ planned days per grade", actual: `${Math.min(...cov.map((c) => c.plans))} plan days (min across grades); fresh vocabulary runway ${Math.min(...cov.map((c) => c.vocabDays))}–${Math.max(...cov.map((c) => c.vocabDays))} days`, ok: cov.every((c) => c.plans >= 365) },
      { name: "Game progression", target: "250+ levels", actual: `${levelCount} levels`, ok: levelCount >= 250 },
      { name: "Daily content", target: "10 new vocabulary words", actual: `${minWords}+ new words per learning day (configurable)`, ok: minWords >= 10 },
      { name: "Learning variety", target: "Multiple formats per skill", actual: `${formats} game formats, 14 activity types, 7 drill types, 6 boss formats`, ok: true },
      { name: "Personalisation", target: "Independent skill-wise difficulty", actual: "Vocabulary band, grammar/writing/reading/speaking bands and 5-level difficulty labels adapt independently", ok: true },
    ],
  };
}
