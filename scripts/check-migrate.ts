import { PGlite } from "@electric-sql/pglite";
import { migrate } from "../src/server/migrate";
(async () => {
  const db = await PGlite.create("memory://");
  const q = { query: (s: string, p?: unknown[]) => db.query(s, p as any[]) as any };
  await migrate(q); await migrate(q); // twice: idempotency
  for (const t of ["missions", "pets", "collectible_cards", "kingdom_locations", "world_buildings", "skill_nodes", "boss_battles", "learning_plans", "learning_levels", "grade_config", "vocabulary_candidates", "kingdoms", "events", "vocabulary_master", "writing_topics", "grammar_topics", "reading_stories", "rewards", "games", "learning_levels", "achievements", "xp_config"]) {
    const r = await db.query<{ n: number }>(`select count(*)::int n from ${t}`);
    console.log(t, r.rows[0].n);
  }
  const bad = await db.query(`select word, example from vocabulary_master where position(lower(left(word, greatest(3, length(word)-2))) in lower(example)) = 0`);
  console.log("examples missing word:", bad.rows);
})();
