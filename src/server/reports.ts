import "server-only";
import { one, query } from "./db";
import { APP_TZ } from "./time";

export interface ChildReport {
  words_introduced: number; words_mastered: number; words_practising: number;
  words_week: number; words_month: number;
  minutes_today: number; minutes_week: number; minutes_month: number;
  writing_avg: number | null; writing_count: number; grammar_done: number; grammar_avg: number | null;
  speaking_count: number; speaking_avg: number | null; reading_done: number; reading_avg: number | null;
  level_id: number; level_name: string; xp_total: number; coins: number; streak: number; longest_streak: number;
  quest_accuracy_week: number | null; quests_week: number; xp_week: number;
  daily: { day: string; minutes: number; xp: number }[];
}

export async function childReport(childId: string): Promise<ChildReport> {
  const r = (await one<any>(
    `select
      (select count(*)::int from child_vocabulary_progress where child_id = $1) words_introduced,
      (select count(*)::int from child_vocabulary_progress where child_id = $1 and status = 'mastered') words_mastered,
      (select count(*)::int from child_vocabulary_progress where child_id = $1 and status = 'practising') words_practising,
      (select count(*)::int from child_vocabulary_progress where child_id = $1 and first_seen_at > now() - interval '7 days') words_week,
      (select count(*)::int from child_vocabulary_progress where child_id = $1 and first_seen_at > now() - interval '30 days') words_month,
      (select coalesce(sum(seconds),0)::int / 60 from activity_log where child_id = $1 and (created_at at time zone $2)::date = (now() at time zone $2)::date) minutes_today,
      (select coalesce(sum(seconds),0)::int / 60 from activity_log where child_id = $1 and created_at > now() - interval '7 days') minutes_week,
      (select coalesce(sum(seconds),0)::int / 60 from activity_log where child_id = $1 and created_at > now() - interval '30 days') minutes_month,
      (select round(avg(e.score))::int from writing_evaluations e join writing_submissions w on w.id = e.submission_id where w.child_id = $1) writing_avg,
      (select count(*)::int from writing_submissions where child_id = $1 and status = 'evaluated') writing_count,
      (select count(*)::int from grammar_progress where child_id = $1 and completed_at is not null) grammar_done,
      (select round(avg(best_score))::int from grammar_progress where child_id = $1) grammar_avg,
      (select count(*)::int from speaking_sessions where child_id = $1) speaking_count,
      (select round(avg(accuracy))::int from speaking_sessions where child_id = $1 and assessed) speaking_avg,
      (select count(*)::int from story_progress where child_id = $1 and completed_at is not null) reading_done,
      (select round(avg(best_score))::int from story_progress where child_id = $1) reading_avg,
      p.level_id, l.name level_name, p.xp_total, p.coins,
      coalesce(s.current_streak,0) streak, coalesce(s.longest_streak,0) longest_streak,
      (select round(100.0 * sum(correct) / nullif(sum(attempted),0))::int from daily_learning_sessions where child_id = $1 and session_date > current_date - 7) quest_accuracy_week,
      (select count(*)::int from daily_learning_sessions where child_id = $1 and completed_at is not null and session_date > current_date - 7) quests_week,
      (select coalesce(sum(amount),0)::int from xp_transactions where child_id = $1 and created_at > now() - interval '7 days') xp_week
     from child_profiles p join learning_levels l on l.id = p.level_id
     left join learning_streaks s on s.child_id = p.child_id
     where p.child_id = $1`,
    [childId, APP_TZ],
  ))!;
  const daily = await query<{ day: string; minutes: number; xp: number }>(
    `with days as (select to_char(d, 'YYYY-MM-DD') as dkey from generate_series((now() at time zone $2)::date - 6, (now() at time zone $2)::date, interval '1 day') d)
     select days.dkey as "day",
       coalesce((select sum(seconds) from activity_log a where a.child_id = $1 and to_char(a.created_at at time zone $2, 'YYYY-MM-DD') = days.dkey),0)::int / 60 as minutes,
       coalesce((select sum(amount) from xp_transactions x where x.child_id = $1 and to_char(x.created_at at time zone $2, 'YYYY-MM-DD') = days.dkey),0)::int as xp
     from days order by days.dkey`,
    [childId, APP_TZ],
  );
  return { ...r, daily };
}

/** Areas that need attention, in plain parent-friendly language. */
export function improvementAreas(r: ChildReport): string[] {
  const out: string[] = [];
  if (r.quest_accuracy_week !== null && r.quest_accuracy_week < 60) out.push("Vocabulary recall — accuracy in daily quizzes is below 60% this week. Revising words in the Notebook helps.");
  if (r.writing_avg !== null && r.writing_avg < 60) out.push("Writing — focus on capital letters, full stops and complete sentences.");
  if (r.grammar_avg !== null && r.grammar_avg < 60) out.push("Grammar — revisit Grammar Galaxy missions scored below 60%.");
  if (r.speaking_avg !== null && r.speaking_avg < 60) out.push("Pronunciation — short Listen & Repeat sessions in the Speaking Arena will build confidence.");
  if (r.reading_done === 0) out.push("Reading — no stories finished yet. Try reading one Reading Adventure together.");
  if (r.minutes_week < 30) out.push("Consistency — under 30 minutes this week. 10 minutes a day builds a strong habit.");
  return out;
}

/** Weekly Learning Story — the auto-generated summary shown to parents and in reminder e-mails. */
export function weeklyStory(name: string, r: ChildReport): string {
  const parts = [`${name} discovered ${r.words_week} new word${r.words_week === 1 ? "" : "s"} this week`];
  if (r.words_mastered) parts[0] += ` and has mastered ${r.words_mastered} so far`;
  const extra: string[] = [];
  if (r.quests_week) extra.push(`completed ${r.quests_week} Daily Word Quest${r.quests_week > 1 ? "s" : ""}${r.quest_accuracy_week !== null ? ` with ${r.quest_accuracy_week}% accuracy` : ""}`);
  if (r.writing_count) extra.push(`has an average writing score of ${r.writing_avg}`);
  if (r.streak > 1) extra.push(`is on a ${r.streak}-day learning streak`);
  extra.push(`earned ${r.xp_week} XP and spent about ${r.minutes_week} minutes learning`);
  return `${parts[0]}. ${name} ${extra.join(", ")}. Current level: ${r.level_name} (Level ${r.level_id}).`;
}

/** Annual journey + monthly summaries for the parent dashboard. */
export async function annualJourney(childId: string, grade: string) {
  const j = await one<{ journey_day: number; days_done: number; activities_done: number; activities_total: number; plan_days: number }>(
    `select p.journey_day,
       (select count(*)::int from child_plan_days where child_id = $1 and completed_on is not null) days_done,
       (select coalesce(sum(coalesce(array_length(done,1),0)),0)::int from child_plan_days where child_id = $1) activities_done,
       (select coalesce(sum(jsonb_array_length(activities)),0)::int from learning_plans where grade = $2) activities_total,
       (select count(*)::int from learning_plans where grade = $2) plan_days
     from child_profiles p where p.child_id = $1`, [childId, grade]);
  const months = await query<{ month: string; words: number; mastered: number; days: number; xp: number; minutes: number }>(
    `with m as (select to_char(date_trunc('month', d), 'YYYY-MM') as month from generate_series(date_trunc('month', now()) - interval '5 months', date_trunc('month', now()), interval '1 month') d)
     select m.month,
       (select count(*)::int from child_vocabulary_progress where child_id = $1 and to_char(first_seen_at at time zone $2,'YYYY-MM') = m.month) words,
       (select count(*)::int from child_vocabulary_progress where child_id = $1 and to_char(mastered_at at time zone $2,'YYYY-MM') = m.month) mastered,
       (select count(distinct (created_at at time zone $2)::date)::int from xp_transactions where child_id = $1 and to_char(created_at at time zone $2,'YYYY-MM') = m.month) days,
       (select coalesce(sum(amount),0)::int from xp_transactions where child_id = $1 and to_char(created_at at time zone $2,'YYYY-MM') = m.month) xp,
       (select coalesce(sum(seconds),0)::int / 60 from activity_log where child_id = $1 and to_char(created_at at time zone $2,'YYYY-MM') = m.month) minutes
     from m order by m.month`, [childId, APP_TZ]);
  return { ...j!, months };
}
