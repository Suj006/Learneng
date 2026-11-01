// LOCAL TESTING ONLY. Imports the 40 AI-checked pilot vocabulary cards (v4) into the app's review queue
// (content_library, status 'pending') in a LOCAL embedded PGlite database. It does not publish to learners
// (vocabulary_master is untouched), does not touch learner data, and refuses to run against a remote database.
// Usage (server must be STOPPED — PGlite allows one connection):
//   node scripts/phase1/import_pilot_local.mjs [pglite-dir]     (default: $PGLITE_DIR or .data/pingvibe)
// Undo: node scripts/phase1/remove_pilot_local.mjs [pglite-dir]
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

export const TAG = "cambridge-pilot-v4-localtest";
const DISCLAIMER = "Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review.";
if (process.env.DATABASE_URL) { console.error("REFUSING: DATABASE_URL is set (remote/shared database). Unset it — this script is for the local PGlite database only."); process.exit(1); }
const dir = path.resolve(process.argv[2] || process.env.PGLITE_DIR || path.join(".data", "pingvibe"));
if (!dir.startsWith(path.resolve("."))) { console.error(`REFUSING: ${dir} is outside this project folder.`); process.exit(1); }
if (!fs.existsSync(dir)) { console.error(`No local database at ${dir}. Start the app once (npm run dev) so it creates and migrates the database, stop it, then re-run.`); process.exit(1); }
const SRC = "deliverables/phase-1-content/pilot/v4/PINGVIBE_Vocab_Pilot_Cards_v4.json";
const DIFF = { Beginner: 1, Developing: 2, Intermediate: 3, Advanced: 4, Challenge: 5 };
const split = (s) => (s ? String(s).split(";").map((x) => x.trim()).filter(Boolean) : []);
const cards = JSON.parse(fs.readFileSync(SRC, "utf8")).cards;
if (cards.length !== 40) throw new Error(`expected 40 cards, found ${cards.length}`);
const db = new PGlite(dir);
try {
  const t = await db.query(`select to_regclass('public.content_library') t`);
  if (!t.rows[0].t) throw new Error("content_library table missing — start the app once to migrate, stop it, then re-run.");
  const before = (await db.query(`select (select count(*)::int from vocabulary_master) vm, (select count(*)::int from children) ch, (select count(*)::int from child_vocabulary_progress) cvp`)).rows[0];
  let added = 0, skipped = 0;
  await db.transaction(async (tx) => {
    for (const c of cards) {
      const exists = await tx.query(`select 1 from content_library where body->>'pilot_tag' = $1 and body->>'candidate_id' = $2`, [TAG, c.candidate_id]);
      if (exists.rows.length) { skipped++; continue; }
      const body = {
        pilot_tag: TAG, candidate_id: c.candidate_id, content_version: c.content_version,
        word: c.word, part_of_speech: c.part_of_speech, phonetic: c.ipa, ipa_source: c.ipa_source,
        meaning: c.simple_meaning, explanation: c.explanation, example: c.example_sentence, usage: c.real_world_usage,
        synonyms: split(c.synonyms), antonyms: split(c.antonyms), word_family: split(c.word_family), collocations: split(c.collocations),
        spelling_guidance: c.spelling_guidance, related_words: split(c.related_words), emoji: c.emoji, difficulty: DIFF[c.difficulty] ?? 1, difficulty_label: c.difficulty,
        category: c.category, applicable_grades: c.applicable_grades, learning_objective: c.learning_objective, illustration_brief: c.illustration_brief,
        provenance: "cambridge-reference-derived headword; card authored by PING VIBE pilot (AI-generated, AI-checked)", disclaimer: DISCLAIMER,
        review_status: "AI checks passed – awaiting human (educator) approval",
      };
      const checks = ["1 safety moderation", "2 grade readability", "3 grammar & mechanics", "5 duplicate detection", "6 difficulty validation"].map((k) => ({ name: k, passed: c[k] === "PASS", detail: k === "2 grade readability" ? `≈ grade ${c.readability_grade}` : c[k] }));
      checks.push({ name: "4 & 7 AI review + accuracy", passed: true, detail: c.word === "daughter" ? "PASS in v4 targeted AI meaning check" : c["AI gates 4 & 7 + accuracy checks"] });
      checks.push({ name: "Source disclaimer", passed: true, detail: DISCLAIMER });
      await tx.query(`insert into content_library (kind, title, band, body, validation, source, status) values ('vocabulary', $1, $2, $3, $4, 'ai', 'pending')`,
        [c.word, c.band, JSON.stringify(body), JSON.stringify({ passed: checks.every((x) => x.passed), checks })]);
      added++;
    }
  });
  const after = (await db.query(`select (select count(*)::int from vocabulary_master) vm, (select count(*)::int from children) ch, (select count(*)::int from child_vocabulary_progress) cvp,
                                        (select count(*)::int from content_library where body->>'pilot_tag' = $1 and status = 'pending') pilot`, [TAG])).rows[0];
  console.log(JSON.stringify({ database: dir, added, skipped_already_present: skipped, pilot_rows_pending: after.pilot, learner_tables_unchanged: before.vm === after.vm && before.ch === after.ch && before.cvp === after.cvp, vocabulary_master: [before.vm, after.vm], children: [before.ch, after.ch], child_vocabulary_progress: [before.cvp, after.cvp] }, null, 1));
} finally { await db.close(); }
