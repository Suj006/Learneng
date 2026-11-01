// LOCAL TESTING ONLY. Stages the 60 B0002 cards (10-day local-test vocabulary pack) in the app's review queue
// (content_library, status 'pending', tag 'vocab-10day-test-b0002-localtest') in the ISOLATED local test database.
// It does not publish (vocabulary_master is untouched), does not touch learner data, does not import B0001,
// and refuses to run against a remote database, the default dev database, or anything outside ./.data.
// Before writing it checks the cards against the append-only word registry (checksum + in-review status).
// Usage (server must be STOPPED — PGlite allows one connection):
//   node scripts/phase1/import_b0002_local.mjs .data/pilot-test
// Undo: node scripts/phase1/remove_b0002_local.mjs .data/pilot-test [--include-published]
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

export const TAG = "vocab-10day-test-b0002-localtest";
const BATCH = "B0002-vocab-10day-test-localtest";
const CARDS = `content-registry/batches/${BATCH}/cards.json`;
const DISCLAIMER = "Internal research mapping. PING VIBE is not affiliated with or endorsed by Cambridge. Candidates are unpublished and awaiting educational review.";
const DIFF = { Beginner: 1, Developing: 2, Intermediate: 3, Advanced: 4, Challenge: 5 };

if (process.env.DATABASE_URL) { console.error("REFUSING: DATABASE_URL is set (remote/shared database). This script is for the isolated local PGlite test database only."); process.exit(1); }
if (!process.argv[2]) { console.error("REFUSING: give the isolated test database folder explicitly, e.g. .data/pilot-test"); process.exit(1); }
const dir = path.resolve(process.argv[2]);
const dataRoot = path.resolve(".data");
if (!dir.startsWith(dataRoot + path.sep)) { console.error(`REFUSING: ${dir} is not inside ./.data (local test databases only).`); process.exit(1); }
if (path.basename(dir) === "pingvibe") { console.error("REFUSING: .data/pingvibe is the default dev database, not the isolated test database."); process.exit(1); }
if (!fs.existsSync(dir)) { console.error(`No local database at ${dir}.`); process.exit(1); }

// Registry checks: cards file unchanged since registration, 60 entries, all local-test/in-review, not approved/published.
const reg = fs.readFileSync("content-registry/word-registry.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const batchLine = reg.find((l) => l.type === "batch" && l.batch_id === BATCH);
const text = fs.readFileSync(CARDS, "utf8");
let expectedSha = batchLine?.cards_sha256; for (const l of reg) if (l.type === "batch_amend" && l.batch_id === BATCH) expectedSha = l.cards_sha256;
if (!batchLine || crypto.createHash("sha256").update(text).digest("hex") !== expectedSha) { console.error("REFUSING: B0002 cards do not match the registry checksum."); process.exit(1); }
const status = new Map(); for (const l of reg) { if (l.type === "word") status.set(l.id, l); if (l.type === "status" && status.has(l.entry_id)) status.get(l.entry_id).review_status = l.review_status; }
const entries = [...status.values()].filter((e) => e.batch_id === BATCH);
if (entries.length !== 60 || entries.some((e) => e.review_status !== "local-test/in-review" || e.approved || e.published)) { console.error("REFUSING: B0002 registry entries are not all local-test/in-review."); process.exit(1); }
const cards = JSON.parse(text).cards;
if (cards.length !== 60) throw new Error(`expected 60 cards, found ${cards.length}`);
const idOf = new Map(entries.map((e) => [`${e.norm_word}|${e.band}`, e.id]));

const db = new PGlite(dir);
try {
  const before = (await db.query(`select (select count(*)::int from vocabulary_master) vm, (select count(*)::int from children) ch, (select count(*)::int from child_vocabulary_progress) cvp,
    (select count(*)::int from content_library where body->>'pilot_tag' = 'cambridge-pilot-v4-localtest') b0001`)).rows[0];
  const clash = (await db.query(`select word from vocabulary_master where lower(word) = any($1::text[])`, [cards.map((c) => c.word.toLowerCase())])).rows;
  if (clash.length) throw new Error(`REFUSING: already in vocabulary_master: ${clash.map((r) => r.word).join(", ")}`);
  let added = 0, skipped = 0;
  await db.transaction(async (tx) => {
    for (const c of cards) {
      const exists = await tx.query(`select 1 from content_library where body->>'pilot_tag' = $1 and body->>'candidate_id' = $2`, [TAG, c.candidate_id]);
      if (exists.rows.length) { skipped++; continue; }
      const body = {
        pilot_tag: TAG, batch_id: BATCH, registry_id: idOf.get(`${c.word.toLowerCase()}|${c.band}`) ?? null, candidate_id: c.candidate_id, for_grade: c.for_grade,
        word: c.word, sense: c.sense, part_of_speech: c.part_of_speech, phonetic: c.ipa, ipa_source: c.ipa_source,
        meaning: c.simple_meaning, explanation: c.explanation, example: c.example_sentence, usage: c.real_world_usage,
        synonyms: c.synonyms, antonyms: c.antonyms, word_family: c.word_family, collocations: c.collocations, spelling_guidance: c.spelling_guidance, related_words: c.related_words,
        emoji: c.emoji, difficulty: DIFF[c.difficulty] ?? 1, difficulty_label: c.difficulty, category: c.category, applicable_grades: c.applicable_grades,
        learning_objective: c.learning_objective, illustration_brief: c.illustration_brief, provenance: c.provenance, disclaimer: DISCLAIMER,
        review_status: "local-test / in review – AI checks passed, awaiting human approval",
      };
      const checks = [...c.validation.gates.map((g) => ({ name: g.gate, passed: g.passed, detail: g.detail })), ...c.validation.extra_checks.map((x) => ({ name: x.check, passed: x.passed, detail: x.passed ? "PASS" : "FAIL" })),
        { name: "Source disclaimer", passed: true, detail: DISCLAIMER }];
      await tx.query(`insert into content_library (kind, title, band, body, validation, source, status) values ('vocabulary', $1, $2, $3, $4, 'ai', 'pending')`,
        [c.word, c.band, JSON.stringify(body), JSON.stringify({ passed: checks.every((x) => x.passed), checks })]);
      added++;
    }
  });
  const after = (await db.query(`select (select count(*)::int from vocabulary_master) vm, (select count(*)::int from children) ch, (select count(*)::int from child_vocabulary_progress) cvp,
    (select count(*)::int from content_library where body->>'pilot_tag' = 'cambridge-pilot-v4-localtest') b0001,
    (select count(*)::int from content_library where body->>'pilot_tag' = $1 and status = 'pending') b0002`, [TAG])).rows[0];
  console.log(JSON.stringify({ database: dir, added, skipped_already_present: skipped, b0002_rows_pending: after.b0002, b0001_rows: [before.b0001, after.b0001],
    learner_tables_unchanged: before.vm === after.vm && before.ch === after.ch && before.cvp === after.cvp, vocabulary_master: [before.vm, after.vm] }, null, 1));
} finally { await db.close(); }
