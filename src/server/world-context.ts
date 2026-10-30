import "server-only";
import { one, query } from "./db";
import { getStreak, levelProgress } from "./gamification";
import { getAvatar } from "./avatar";
import { bandForGrade } from "@/lib/grades";
import { APP_TZ } from "./time";
import type { ChildCtx } from "./session";

export async function worldContext(child: ChildCtx) {
  const [level, streak, avatar, profile, notifications, totalDays, art, months] = await Promise.all([
    levelProgress(child.id),
    getStreak(child.id),
    getAvatar(child.id),
    one<{ buddy: string; theme: string; active_pet: string | null; crystals: number; vocab_band: number }>(`select buddy, theme, active_pet, crystals, vocab_band from child_profiles where child_id = $1`, [child.id]),
    query<{ id: string; title: string; body: string; kind: string; read_at: string | null; created_at: string }>(
      `select id, title, body, kind, read_at, created_at from notifications where child_id = $1 order by created_at desc limit 15`, [child.id]),
    one<{ n: number }>(`select count(distinct (created_at at time zone $2)::date)::int n from xp_transactions where child_id = $1 and source <> 'achievement'`, [child.id, APP_TZ]),
    query<{ slug: string; art: string | null; emoji: string }>(`select slug, art, emoji from rewards where category in ('hair','outfit','shoes','background','expression','accessory','costume','magic_object','animation')`),
    one<{ n: number }>(
      `select count(*)::int n from (select date_trunc('month', created_at at time zone $2) m from xp_transactions where child_id = $1 and source <> 'achievement'
        group by 1 having count(distinct (created_at at time zone $2)::date) >= 10) x`, [child.id, APP_TZ]),
  ]);
  const pet = profile?.active_pet ? await one<{ emoji: string; name: string; nickname: string | null; hint_style: string }>(
    `select p.emoji, p.name, c.nickname, p.hint_style from pets p join child_pets c on c.pet_slug = p.slug and c.child_id = $1 where p.slug = $2`, [child.id, profile.active_pet]) : null;
  return {
    child: { id: child.id, name: child.display_name, username: child.username, grade: child.grade, band: bandForGrade(child.grade) },
    level: level!, streak, avatar, art: Object.fromEntries(art.map((a) => [a.slug, { art: a.art, emoji: a.emoji }])),
    buddy: (profile?.buddy ?? "max") as "max" | "lexi" | "speaky" | "grammy" | "story",
    theme: profile?.theme ?? "theme-midnight", crystals: profile?.crystals ?? 0, pet,
    notifications, unread: notifications.filter((n) => !n.read_at).length, learningDays: totalDays?.n ?? 0,
    // Monthly character evolution: one stage per month with 10+ learning days (max 3).
    evolution: Math.min(3, months?.n ?? 0),
  };
}
export type WorldCtx = Awaited<ReturnType<typeof worldContext>>;
