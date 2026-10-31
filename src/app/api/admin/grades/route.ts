import { z } from "zod";
import { adminRoute, body, ok } from "@/server/api";
import { query } from "@/server/db";
import { buildPlans } from "@/server/content/curriculum";
import { registerGrades } from "@/lib/grades";

/** Adds/updates a grade and generates its 365-day plan. */
export const POST = adminRoute(async (req) => {
  const d = await body(req, z.object({ grade: z.string().regex(/^[A-Z0-9_]{2,12}$/), label: z.string().min(2).max(30), band: z.number().int().min(1).max(4), new_words_per_day: z.number().int().min(0).max(30), daily_missions: z.number().int().min(1).max(8).default(3), sort_order: z.number().int().min(0).max(100), active: z.boolean() }));
  await query(`insert into grade_config (grade, label, band, new_words_per_day, sort_order, active, daily_missions, lx5_applied) values ($1,$2,$3,$4,$5,$6,$7,true)
    on conflict (grade) do update set label=$2, band=$3, new_words_per_day=$4, sort_order=$5, active=$6, daily_missions=$7`, [d.grade, d.label, d.band, d.new_words_per_day, d.sort_order, d.active, d.daily_missions]);
  registerGrades([{ grade: d.grade, band: d.band, label: d.label }]);
  const plans = buildPlans([{ grade: d.grade, label: d.label, band: d.band, new_words_per_day: d.new_words_per_day, daily_missions: d.daily_missions, sort_order: d.sort_order }]);
  for (let i = 0; i < plans.length; i += 400) {
    await query(`insert into learning_plans (grade, day_number, week, month, theme, difficulty, focus, activities)
      select * from jsonb_to_recordset($1::jsonb) as x(grade text, day_number int, week int, month int, theme text, difficulty smallint, focus text, activities jsonb)
      on conflict (grade, day_number) do update set activities = excluded.activities, focus = excluded.focus`, [JSON.stringify(plans.slice(i, i + 400))]);
  }
  return ok({ plans: plans.length });
});
