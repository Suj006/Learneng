import fs from "node:fs";
import path from "node:path";
import type { Queryable } from "./db";
import { VOCABULARY } from "./content/vocabulary";
import { ACHIEVEMENTS, GAMES, SPEAKING_SCENARIOS, WRITING_TOPICS, XP_CONFIG } from "./content/catalog";
import { BOSSES, BUILDINGS, CARDS, LOCATIONS, MISSIONS, PETS, SHOP_ITEMS, SKILL_NODES } from "./content/game";
import { buildLevels } from "./content/levels";
import { EVENTS, GRADE_CONFIG, KINGDOMS, THEMES, buildPlans } from "./content/curriculum";
import { allTemplateTopics } from "./content/topic-templates";
import { headwordRows } from "./content/headwords";
import { GRAMMAR_TOPICS } from "./content/grammar";
import { STORIES } from "./content/stories";
import { hashPassword } from "./crypto";

/**
 * Applies the idempotent schema, then inserts seed content that is missing.
 * Seeds use ON CONFLICT DO NOTHING so admin edits are never overwritten.
 */
export async function migrate(db: Queryable) {
  const schema = fs.readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8");
  // Split on statement boundaries (schema contains no functions/semicolons in strings).
  for (const stmt of schema.split(/;\s*$/m).map((s) => s.trim()).filter(Boolean)) {
    await db.query(stmt);
  }
  await db.query(`create table if not exists seed_meta (key text primary key, value text not null)`);
  const v = await db.query<{ value: string }>(`select value from seed_meta where key = 'version'`);
  if (v.rows[0]?.value !== SEED_VERSION) {
    await seed(db);
    await db.query(`insert into seed_meta (key, value) values ('version', $1) on conflict (key) do update set value = $1`, [SEED_VERSION]);
  }
  await bootstrapAdmin(db);
}

/** Creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD when none exists. */
async function bootstrapAdmin(db: Queryable) {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const existing = await db.query(`select 1 from admin_users limit 1`);
    if (existing.rows.length === 0) {
      await db.query(`insert into admin_users (email, name, password_hash) values ($1, 'Administrator', $2)`, [
        email.toLowerCase(),
        await hashPassword(password),
      ]);
    }
  }
}

/** Bump when seed content changes; seeding is additive (never overwrites admin edits). */
export const SEED_VERSION = "2026-10-30.6";

const j = (v: unknown) => JSON.stringify(v);

async function chunks<T>(rows: T[], size: number, fn: (part: T[]) => Promise<unknown>) {
  for (let i = 0; i < rows.length; i += size) await fn(rows.slice(i, i + size));
}

export async function seed(db: Queryable) {
  await db.query(
    `insert into grade_config (grade, label, band, new_words_per_day, sort_order)
     select * from jsonb_to_recordset($1::jsonb) as x(grade text, label text, band smallint, new_words_per_day smallint, sort_order smallint)
     on conflict (grade) do nothing`,
    [j(GRADE_CONFIG)],
  );
  const { levels, rewards: levelRewards } = buildLevels();
  await db.query(
    `insert into learning_levels (id, name, tier, tier_name, min_xp, min_words_mastered, milestone, reward_coins, reward_slugs, special_mission, description)
     select id, name, tier, tier_name, min_xp, min_words_mastered, milestone, reward_coins, array(select jsonb_array_elements_text(reward_slugs)), special_mission, description
     from jsonb_to_recordset($1::jsonb) as x(id int, name text, tier smallint, tier_name text, min_xp int, min_words_mastered int, milestone smallint,
          reward_coins int, reward_slugs jsonb, special_mission text, description text)
     on conflict (id) do nothing`,
    [j(levels)],
  );
  await db.query(
    `insert into rewards (slug, title, category, emoji, cost_coins, description, min_level, level_exclusive)
     select * from jsonb_to_recordset($1::jsonb) as x(slug text, title text, category text, emoji text, cost_coins int, description text, min_level int, level_exclusive boolean)
     on conflict (slug) do nothing`,
    [j(levelRewards)],
  );
  await chunks(buildPlans(), 500, (part) => db.query(
    `insert into learning_plans (grade, day_number, week, month, theme, difficulty, focus, activities)
     select * from jsonb_to_recordset($1::jsonb) as x(grade text, day_number int, week int, month int, theme text, difficulty smallint, focus text, activities jsonb)
     on conflict (grade, day_number) do nothing`,
    [j(part)],
  ));
  await db.query(
    `insert into kingdoms (slug, title, emoji, art, description, href, unlock_level, sort_order)
     select slug, title, emoji, art, description, href, unlock_level, ord::smallint
     from jsonb_to_recordset($1::jsonb) as x(slug text, title text, emoji text, art text, description text, href text, unlock_level int, ord int)
     on conflict (slug) do nothing`,
    [j(KINGDOMS.map((k, i) => ({ ...k, ord: i })))],
  );
  await db.query(
    `insert into events (slug, title, emoji, kind, month, day, window_days, description, words, writing_prompt)
     select slug, title, emoji, kind, month, day, window_days, description, array(select jsonb_array_elements_text(words)), writing_prompt
     from jsonb_to_recordset($1::jsonb) as x(slug text, title text, emoji text, kind text, month smallint, day smallint, window_days smallint, description text, words jsonb, writing_prompt text)
     on conflict (slug) do nothing`,
    [j(EVENTS)],
  );
  await db.query(
    `insert into speaking_scenarios (slug, title, emoji, lines)
     select slug, title, emoji, array(select jsonb_array_elements_text(lines)) from jsonb_to_recordset($1::jsonb) as x(slug text, title text, emoji text, lines jsonb)
     on conflict (slug) do nothing`,
    [j(SPEAKING_SCENARIOS)],
  );
  await db.query(
    `insert into kingdom_locations (slug, kingdom, title, emoji, kind, x, y, unlock_metric, unlock_target, unlock_label, href, reward_crystals, reward_coins, sort_order)
     select slug, kingdom, title, emoji, kind, x, y, unlock_metric, unlock_target, unlock_label, href, reward_crystals, reward_coins, ord::smallint
     from jsonb_to_recordset($1::jsonb) as x(slug text, kingdom text, title text, emoji text, kind text, x smallint, y smallint, unlock_metric text, unlock_target int, unlock_label text, href text, reward_crystals int, reward_coins int, ord int)
     on conflict (slug) do nothing`,
    [j(LOCATIONS.map((l, i) => ({ ...l, ord: i })))],
  );
  await db.query(
    `insert into world_buildings (slug, title, emoji, description, unlock_metric, unlock_target, unlock_label, href, x, y, sort_order)
     select slug, title, emoji, description, unlock_metric, unlock_target, unlock_label, href, x, y, ord::smallint
     from jsonb_to_recordset($1::jsonb) as x(slug text, title text, emoji text, description text, unlock_metric text, unlock_target int, unlock_label text, href text, x smallint, y smallint, ord int)
     on conflict (slug) do nothing`,
    [j(BUILDINGS.map((b, i) => ({ ...b, ord: i })))],
  );
  await db.query(
    `insert into skill_nodes (slug, branch, title, description, evidence, min_attempts, min_accuracy, prereq, band_min, sort_order)
     select slug, branch, title, description, evidence, min_attempts, min_accuracy, prereq, band_min, ord::smallint
     from jsonb_to_recordset($1::jsonb) as x(slug text, branch text, title text, description text, evidence text, min_attempts int, min_accuracy smallint, prereq text, band_min smallint, ord int)
     on conflict (slug) do nothing`,
    [j(SKILL_NODES.map((n, i) => ({ ...n, ord: i })))],
  );
  await db.query(
    `insert into boss_battles (slug, kingdom, title, villain, emoji, story, rounds, unlock_level, card_slug, sort_order)
     select slug, kingdom, title, villain, emoji, story, rounds, unlock_level, card_slug, ord::smallint
     from jsonb_to_recordset($1::jsonb) as x(slug text, kingdom text, title text, villain text, emoji text, story text, rounds jsonb, unlock_level int, card_slug text, ord int)
     on conflict (slug) do nothing`,
    [j(BOSSES.map((b, i) => ({ ...b, ord: i })))],
  );
  const emojiFor = (cat: string) => THEMES.find((t) => t.key === cat)?.emoji ?? "✏️";
  for (const band of [1, 2, 3, 4] as const) {
    await chunks(allTemplateTopics(band, emojiFor), 400, (part) => db.query(
      `insert into writing_topics (slug, title, prompt, band, mode, min_words, suggested_words, emoji, category, source)
       select slug, title, prompt, band, mode, min_words, array(select jsonb_array_elements_text(suggested_words)), emoji, category, 'template'
       from jsonb_to_recordset($1::jsonb) as x(slug text, title text, prompt text, band smallint, mode text, min_words int, suggested_words jsonb, emoji text, category text)
       on conflict (slug) do nothing`,
      [j(part)],
    ));
  }
  await chunks(headwordRows(), 500, (part) => db.query(
    `insert into vocabulary_candidates (word, band, category)
     select x.word, x.band, x.category from jsonb_to_recordset($1::jsonb) as x(word text, band smallint, category text)
     where not exists (select 1 from vocabulary_master v where lower(v.word) = x.word)
     on conflict (word) do nothing`,
    [j(part)],
  ));
  await db.query(
    `insert into xp_config (key, label, xp, coins, daily_cap)
     select * from jsonb_to_recordset($1::jsonb) as x(key text, label text, xp int, coins int, daily_cap int)
     on conflict (key) do nothing`,
    [j(XP_CONFIG)],
  );
  await db.query(
    `insert into achievements (slug, title, description, emoji, sort_order)
     select slug, title, description, emoji, ord::smallint
     from jsonb_to_recordset($1::jsonb) as x(slug text, title text, description text, emoji text, ord int)
     on conflict (slug) do nothing`,
    [j(ACHIEVEMENTS.map((a, i) => ({ ...a, ord: i })))],
  );
  await db.query(
    `insert into rewards (slug, title, category, emoji, cost_coins, cost_crystals, rarity, description, min_level, starter, art)
     select slug, title, category, emoji, cost_coins, coalesce(cost_crystals,0), rarity, description, coalesce(min_level,1), coalesce(starter,false), art
     from jsonb_to_recordset($1::jsonb) as x(slug text, title text, category text, emoji text, cost_coins int, cost_crystals int, rarity text, description text, min_level int, starter boolean, art text)
     on conflict (slug) do nothing`,
    [j(SHOP_ITEMS)],
  );
  await db.query(
    `insert into xp_config (key, label, xp, coins, crystals, daily_cap) values ('mission','Mission reward',0,0,0,100), ('boss','Boss battle',0,0,0,20), ('treasure','Kingdom treasure',0,0,0,50)
     on conflict (key) do nothing`,
  );
  await db.query(`insert into app_settings (key, value) values ('daily_xp_ceiling', '1500'::jsonb), ('session_minutes', '{"1":15,"2":20,"3":25,"4":30}'::jsonb) on conflict (key) do nothing`);
  await db.query(
    `insert into pets (slug, name, emoji, personality, hint_style, unlock_metric, unlock_target, unlock_label, rarity, sort_order)
     select slug, name, emoji, personality, hint_style, unlock_metric, unlock_target, unlock_label, rarity, ord::smallint
     from jsonb_to_recordset($1::jsonb) as x(slug text, name text, emoji text, personality text, hint_style text, unlock_metric text, unlock_target int, unlock_label text, rarity text, ord int)
     on conflict (slug) do nothing`,
    [j(PETS.map((p, i) => ({ ...p, ord: i })))],
  );
  await db.query(
    `insert into collectible_cards (slug, kind, title, emoji, rarity, fact, lesson, sort_order)
     select slug, kind, title, emoji, rarity, fact, lesson, ord::smallint
     from jsonb_to_recordset($1::jsonb) as x(slug text, kind text, title text, emoji text, rarity text, fact text, lesson text, ord int)
     on conflict (slug) do nothing`,
    [j([...CARDS, ...EVENTS.map((e) => ({ slug: `event-${e.slug}`, kind: "event", title: e.title, emoji: e.emoji, rarity: "rare", fact: e.description, lesson: `Event words: ${e.words.join(", ")}.` }))].map((c, i) => ({ ...c, ord: i })))],
  );
  const eventMissions = EVENTS.map((e) => ({ slug: `ev-${e.slug}`, scope: "event", character: "max", title: e.title, description: `${e.description} Complete the special event challenge.`, metric: "special_passed", target: 1, href: "/world/challenge/special", xp: 100, coins: 30, crystals: 2, band_min: 1, band_max: 4, event_slug: e.slug }));
  await db.query(
    `insert into missions (slug, scope, character, title, description, metric, target, href, xp, coins, crystals, band_min, band_max, event_slug)
     select slug, scope, character, title, description, metric, target, href, xp, coins, crystals, band_min, band_max, event_slug
     from jsonb_to_recordset($1::jsonb) as x(slug text, scope text, character text, title text, description text, metric text, target int, href text, xp int, coins int, crystals int, band_min smallint, band_max smallint, event_slug text)
     on conflict (slug) do nothing`,
    [j([...MISSIONS.map((m) => ({ ...m, event_slug: null })), ...eventMissions])],
  );
  await db.query(
    `insert into games (slug, title, tagline, emoji, min_words, sort_order)
     select slug, title, tagline, emoji, min_words, ord::smallint
     from jsonb_to_recordset($1::jsonb) as x(slug text, title text, tagline text, emoji text, min_words int, ord int)
     on conflict (slug) do nothing`,
    [j(GAMES.map((g, i) => ({ ...g, ord: i })))],
  );
  await db.query(
    `insert into vocabulary_master (word, band, part_of_speech, phonetic, meaning, explanation, example, usage, synonyms, antonyms, emoji, difficulty)
     select word, band, part_of_speech, phonetic, meaning, explanation, example, usage,
            array(select jsonb_array_elements_text(synonyms)), array(select jsonb_array_elements_text(antonyms)), emoji, difficulty
     from jsonb_to_recordset($1::jsonb) as x(word text, band smallint, part_of_speech text, phonetic text, meaning text, explanation text,
          example text, usage text, synonyms jsonb, antonyms jsonb, emoji text, difficulty smallint)
     on conflict (lower(word)) do nothing`,
    [j(VOCABULARY)],
  );
  await db.query(
    `insert into writing_topics (slug, title, prompt, band, mode, min_words, suggested_words, emoji, category)
     select slug, title, prompt, band, mode, min_words, array(select jsonb_array_elements_text(suggested_words)), emoji, category
     from jsonb_to_recordset($1::jsonb) as x(slug text, title text, prompt text, band smallint, mode text, min_words int, suggested_words jsonb, emoji text, category text)
     on conflict (slug) do nothing`,
    [j(WRITING_TOPICS)],
  );
  await db.query(
    `insert into grammar_topics (slug, title, emoji, band_min, sort_order, explanation, examples, exercises)
     select slug, title, emoji, band_min, ord::smallint, explanation, examples, exercises
     from jsonb_to_recordset($1::jsonb) as x(slug text, title text, emoji text, band_min smallint, ord int, explanation text, examples jsonb, exercises jsonb)
     on conflict (slug) do nothing`,
    [j(GRAMMAR_TOPICS.map((t, i) => ({ ...t, ord: i })))],
  );
  await db.query(
    `insert into reading_stories (slug, title, genre, band, emoji, cover, pages, glossary, questions, reward)
     select slug, title, genre, band, emoji, cover, pages, glossary, questions, reward
     from jsonb_to_recordset($1::jsonb) as x(slug text, title text, genre text, band smallint, emoji text, cover text, pages jsonb, glossary jsonb, questions jsonb, reward text)
     on conflict (slug) do nothing`,
    [j(STORIES)],
  );

}
