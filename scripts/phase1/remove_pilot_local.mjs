// LOCAL TESTING ONLY. Removes the 40 pilot test cards imported by import_pilot_local.mjs from a LOCAL PGlite database.
// Deletes only content_library rows tagged 'cambridge-pilot-v4-localtest'. If a tester approved/published any of them
// in the local Content Studio, pass --include-published to also remove those words from vocabulary_master (and any
// local test progress on them). Server must be STOPPED.
//   node scripts/phase1/remove_pilot_local.mjs [pglite-dir] [--include-published]
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
const TAG = "cambridge-pilot-v4-localtest";
if (process.env.DATABASE_URL) { console.error("REFUSING: DATABASE_URL is set. Local PGlite only."); process.exit(1); }
const args = process.argv.slice(2); const includePublished = args.includes("--include-published");
const dir = path.resolve(args.find((a) => !a.startsWith("--")) || process.env.PGLITE_DIR || path.join(".data", "pingvibe"));
if (!dir.startsWith(path.resolve(".")) || !fs.existsSync(dir)) { console.error(`REFUSING: no local database at ${dir}.`); process.exit(1); }
const db = new PGlite(dir);
try {
  const words = (await db.query(`select title from content_library where body->>'pilot_tag' = $1`, [TAG])).rows.map((r) => r.title.toLowerCase());
  let vm = 0, cvp = 0;
  await db.transaction(async (tx) => {
    if (includePublished && words.length) {
      const ids = (await tx.query(`select id from vocabulary_master where lower(word) = any($1::text[]) and source = 'ai' and created_at > (select min(created_at) from content_library where body->>'pilot_tag' = $2)`, [words, TAG])).rows.map((r) => r.id);
      if (ids.length) {
        cvp = (await tx.query(`delete from child_vocabulary_progress where word_id = any($1::uuid[])`, [ids])).affectedRows ?? 0;
        vm = (await tx.query(`delete from vocabulary_master where id = any($1::uuid[])`, [ids])).affectedRows ?? 0;
      }
    }
    const cl = (await tx.query(`delete from content_library where body->>'pilot_tag' = $1`, [TAG])).affectedRows ?? 0;
    console.log(JSON.stringify({ database: dir, content_library_rows_removed: cl, vocabulary_master_rows_removed: vm, test_progress_rows_removed: cvp }, null, 1));
  });
} finally { await db.close(); }
