// LOCAL TESTING ONLY. Removes the B0002 test cards staged by import_b0002_local.mjs from the isolated local test database.
// Deletes only content_library rows tagged 'vocab-10day-test-b0002-localtest' (B0001 rows are never touched).
// If a tester approved any B0002 card in the local Content Studio, pass --include-published to also remove those
// words from the local vocabulary_master and any local test progress on them. Server must be STOPPED.
//   node scripts/phase1/remove_b0002_local.mjs .data/pilot-test [--include-published]
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
const TAG = "vocab-10day-test-b0002-localtest";
if (process.env.DATABASE_URL) { console.error("REFUSING: DATABASE_URL is set. Local PGlite only."); process.exit(1); }
const args = process.argv.slice(2); const includePublished = args.includes("--include-published");
const a = args.find((x) => !x.startsWith("--"));
if (!a) { console.error("REFUSING: give the isolated test database folder explicitly, e.g. .data/pilot-test"); process.exit(1); }
const dir = path.resolve(a);
if (!dir.startsWith(path.resolve(".data") + path.sep) || path.basename(dir) === "pingvibe" || !fs.existsSync(dir)) { console.error(`REFUSING: ${dir} is not an isolated local test database in ./.data.`); process.exit(1); }
const db = new PGlite(dir);
try {
  const words = (await db.query(`select lower(title) w from content_library where body->>'pilot_tag' = $1`, [TAG])).rows.map((r) => r.w);
  let vm = 0, cvp = 0, cl = 0;
  await db.transaction(async (tx) => {
    if (includePublished && words.length) {
      const ids = (await tx.query(`select id from vocabulary_master where lower(word) = any($1::text[]) and source = 'ai' and created_at >= (select min(created_at) from content_library where body->>'pilot_tag' = $2)`, [words, TAG])).rows.map((r) => r.id);
      if (ids.length) {
        cvp = (await tx.query(`delete from child_vocabulary_progress where word_id = any($1::uuid[])`, [ids])).affectedRows ?? 0;
        vm = (await tx.query(`delete from vocabulary_master where id = any($1::uuid[])`, [ids])).affectedRows ?? 0;
      }
    }
    cl = (await tx.query(`delete from content_library where body->>'pilot_tag' = $1`, [TAG])).affectedRows ?? 0;
  });
  const b1 = (await db.query(`select count(*)::int n from content_library where body->>'pilot_tag' = 'cambridge-pilot-v4-localtest'`)).rows[0].n;
  console.log(JSON.stringify({ database: dir, b0002_review_rows_removed: cl, vocabulary_master_rows_removed: vm, test_progress_rows_removed: cvp, b0001_rows_untouched: b1 }, null, 1));
} finally { await db.close(); }
