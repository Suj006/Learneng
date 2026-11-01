/**
 * PING VIBE word registry — durable, append-only record of every generated word card, plus the
 * duplicate check that MUST run before any new word generation.
 *
 * Registry file: content-registry/word-registry.jsonl (one JSON object per line, hash-chained).
 * Card files:    content-registry/batches/<batch_id>/cards.json (written once, never overwritten).
 *
 * The check reads, every time:
 *   1. this registry (all earlier batches),
 *   2. published seed words (src/server/content/vocabulary.ts),
 *   3. the PING VIBE headword queue (src/server/content/headwords.ts),
 *   4. Cambridge candidates (src/server/content/cambridge-candidates.ts) with their reviewed decisions
 *      (v1 triage CSV overridden by the v2 second-pass CSV), and
 *   5. optionally a local portal database (--portal <PGlite dir>; read from a temporary copy), which adds
 *      admin-added words, queue rows and the review queue (content_library).
 *
 * Rules:
 *   - Exact duplicate (same normalised word) → EXCLUDED, unless the candidate declares a genuinely different
 *     sense (distinct_sense: true + sense text) and every existing record of that word has a known, different
 *     sense; then it is ALLOWED as a separate entry and flagged for review.
 *   - Close variants (spacing/hyphen/apostrophe, British/American spelling, singular/plural) and related forms
 *     (shared stem: -ed, -ing, -er, -ly, -ness, …) → FLAGGED for review, not excluded.
 *   - Cambridge Hold → EXCLUDED. Cambridge Revise → FLAGGED (needs fixing and checking before use).
 *   - A candidate's own source record (same Cambridge candidate_id, or the same queued headword it is drawn
 *     from) is its provenance, not a duplicate.
 *
 * Nothing here calls an API, imports into the app or publishes anything.
 *
 * Usage (npx tsx scripts/registry/word-registry.ts …):
 *   check <proposal.json> [--portal .data/pilot-test] [--out report.json] [--strict]
 *   register <batch.json> [--portal .data/pilot-test]      append a generated batch (refuses exact duplicates)
 *   status <entry_id> <in-review|needs-fix|rejected> "<note>"   append a status event (never approves/publishes)
 *   amend <batch_id>[,<batch_id>] "<reason>"               record changes to batch cards files (append-only)
 *   verify                                                 check the hash chain and uniqueness
 *   list                                                   summary by batch / band / status
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { VOCABULARY } from "../../src/server/content/vocabulary";
import { headwordRows } from "../../src/server/content/headwords";
import { CAMBRIDGE_CANDIDATES } from "../../src/server/content/cambridge-candidates";

export const ROOT = "content-registry";
export const REGISTRY = path.join(ROOT, "word-registry.jsonl");
const REVIEW = "deliverables/cambridge-vocabulary-analysis/review";
export const STATUS_DEFAULT = "local-test/in-review";
const ALLOWED_STATUS = new Set(["local-test/in-review", "local-test/needs-fix", "local-test/rejected"]);

// ── Types ──
export interface Source { kind: "cambridge" | "pingvibe-queue" | "published" | "registry" | "new"; candidate_id?: string | null; provenance?: string | null }
export interface WordEntry {
  type: "word"; seq: number; id: string; word: string; norm_word: string; sense: string | null; part_of_speech: string | null;
  band: number; grade_range: string | null; category: string | null; source: Source; batch_id: string;
  review_status: string; approved: false; published: false; local_test: true;
  card_ref: { file: string; index: number; sha256: string } | null; flags: string[]; created_at: string;
  prev_hash: string; hash: string;
}
export interface StatusEvent { type: "status"; seq: number; entry_id: string; review_status: string; note: string; created_at: string; prev_hash: string; hash: string }
export interface BatchEvent { type: "batch"; seq: number; batch_id: string; description: string; cards_file: string; cards_sha256: string; count: number; created_at: string; prev_hash: string; hash: string }
type Line = WordEntry | StatusEvent | BatchEvent;
export interface Candidate { word: string; band: number; sense?: string | null; distinct_sense?: boolean; part_of_speech?: string | null; category?: string | null; grade_range?: string | null; source?: Source }
interface Existing { layer: string; word: string; norm: string; band: number | null; sense: string | null; ref: string; decision?: string }

// ── Normalisation and variant keys ──
export const norm = (w: string) => w.normalize("NFKC").toLowerCase().replace(/[’‘`]/g, "'").replace(/[.!?,;:]+$/g, "").replace(/\s+/g, " ").trim();
const loose = (w: string) => norm(w).replace(/[\s'\-.]/g, "");
const BRAM: [RegExp, string][] = [[/our(s?)$/, "or$1"], [/ise(s|d)?$/, "ize$1"], [/ising$/, "izing"], [/isation(s?)$/, "ization$1"], [/yse(s|d)?$/, "yze$1"],
  [/tre(s?)$/, "ter$1"], [/ogue(s?)$/, "og$1"], [/lled$/, "led"], [/lling$/, "ling"], [/ence$/, "ense"], [/^aero/, "air"]];
const PAIRS: Record<string, string> = { grey: "gray", mum: "mom", mummy: "mommy", tyre: "tire", pyjamas: "pajamas", plough: "plow", cheque: "check", jewellery: "jewelry", programme: "program", aluminium: "aluminum", ladybird: "ladybug", maths: "math", colour: "color", favourite: "favorite" };
export function spellingKey(w: string) {
  let x = loose(w);
  if (PAIRS[x]) x = PAIRS[x];
  for (const [re, rep] of BRAM) x = x.replace(re, rep);
  return x;
}
const singular = (x: string) => x.length > 4 && x.endsWith("ies") ? x.slice(0, -3) + "y" : x.length > 4 && /(ches|shes|sses|xes|zes|oes)$/.test(x) ? x.slice(0, -2) : x.length > 3 && x.endsWith("s") && !x.endsWith("ss") ? x.slice(0, -1) : x;
export const variantKey = (w: string) => singular(spellingKey(w));
const SUFFIX = /(iness|ness|ments?|ful|less|ably|ibly|ally|ly|ings?|ed|ers?|est|ions?|ive|ish|y)$/;
export function stemKey(w: string) {
  let x = variantKey(w);
  if (x.includes(" ") || x.length < 5) return x;
  const s = x.replace(SUFFIX, "");
  x = s.length >= 3 ? s : x;
  return x.replace(/i$/, "y").replace(/[ye]$/, "").replace(/([b-df-hj-np-tv-z])\1$/, "$1");
}
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const senseSlug = (s: string | null | undefined) => (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export const stableId = (word: string, band: number, sense: string | null) => `PVW-${band}-${sha(`${norm(word)}|${senseSlug(sense)}`).slice(0, 12)}`;

// ── Registry I/O ──
export function readRegistry(): Line[] {
  if (!fs.existsSync(REGISTRY)) return [];
  return fs.readFileSync(REGISTRY, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}
const lineHash = (o: Omit<Line, "hash">) => sha(JSON.stringify(o));
function appendLines(lines: Omit<Line, "seq" | "prev_hash" | "hash">[], amendingBatches: string[] = []) {
  const reg = readRegistry();
  const v = verify(reg);
  // An amendment may only excuse the cards-file checksum of the batch it records; every other check still applies.
  v.errors = v.errors.filter((e) => !amendingBatches.some((b) => e === `batch ${b}: cards file changed without a recorded amendment (${path.join(ROOT, "batches", b, "cards.json")})`));
  v.ok = v.errors.length === 0;
  if (!v.ok) throw new Error(`Registry failed verification; nothing appended:\n${v.errors.join("\n")}`);
  let prev = reg.length ? reg[reg.length - 1].hash : "GENESIS";
  let seq = reg.length;
  const out: string[] = [];
  for (const l of lines) {
    const o: any = { ...l, seq: ++seq, prev_hash: prev };
    o.hash = lineHash(o);
    prev = o.hash;
    out.push(JSON.stringify(o));
  }
  fs.mkdirSync(ROOT, { recursive: true });
  fs.appendFileSync(REGISTRY, out.join("\n") + "\n", { flag: "a" });
  return out.length;
}
export function verify(reg = readRegistry()) {
  const errors: string[] = [];
  let prev = "GENESIS";
  const ids = new Set<string>(); const keys = new Set<string>(); const batches = new Set<string>();
  reg.forEach((l, i) => {
    const { hash, ...rest } = l as any;
    if (l.seq !== i + 1) errors.push(`line ${i + 1}: seq ${l.seq} out of order`);
    if (l.prev_hash !== prev) errors.push(`line ${i + 1}: prev_hash does not match the previous line (registry edited or reordered)`);
    if (lineHash(rest) !== hash) errors.push(`line ${i + 1}: content does not match its hash (line was modified)`);
    prev = hash;
    if (l.type === "word") {
      if (ids.has(l.id)) errors.push(`line ${i + 1}: duplicate id ${l.id}`);
      ids.add(l.id);
      const k = `${l.norm_word}|${senseSlug(l.sense)}`;
      if (keys.has(k)) errors.push(`line ${i + 1}: duplicate word+sense ${k}`);
      keys.add(k);
      if (l.approved !== false || l.published !== false) errors.push(`line ${i + 1}: ${l.id} must not be approved or published`);
      if (l.card_ref && !fs.existsSync(l.card_ref.file)) errors.push(`line ${i + 1}: card file missing ${l.card_ref.file}`);
    }
    if (l.type === "batch") { if (batches.has(l.batch_id)) errors.push(`line ${i + 1}: batch ${l.batch_id} registered twice`); batches.add(l.batch_id); }
    if (l.type === "status" && !ids.has(l.entry_id)) errors.push(`line ${i + 1}: status for unknown id ${l.entry_id}`);
  });
  // The expected checksum of each cards file is the registration checksum, superseded only by appended batch_amend lines.
  const latest = new Map<string, { file: string; sha: string }>();
  reg.forEach((l: any, i) => {
    if (l.type === "batch") latest.set(l.batch_id, { file: l.cards_file, sha: l.cards_sha256 });
    if (l.type === "batch_amend") {
      const cur = latest.get(l.batch_id);
      if (!cur) errors.push(`line ${i + 1}: amendment for unknown batch ${l.batch_id}`);
      else if (cur.sha !== l.previous_sha256) errors.push(`line ${i + 1}: amendment for ${l.batch_id} does not follow the previous checksum`);
      else latest.set(l.batch_id, { file: cur.file, sha: l.cards_sha256 });
    }
  });
  for (const [b, x] of latest) if (fs.existsSync(x.file) && sha(fs.readFileSync(x.file, "utf8")) !== x.sha) errors.push(`batch ${b}: cards file changed without a recorded amendment (${x.file})`);
  return { ok: errors.length === 0, errors, lines: reg.length };
}
export function currentStatus(reg = readRegistry()) {
  const s = new Map<string, string>();
  for (const l of reg) { if (l.type === "word") s.set(l.id, l.review_status); if (l.type === "status") s.set(l.entry_id, l.review_status); }
  return s;
}

// ── Sources ──
function parseCsv(text: string) {
  const rows: string[][] = []; let row: string[] = []; let f = ""; let q = false;
  const t = text.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (q) { if (ch === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch; }
    else if (ch === '"') q = true; else if (ch === ",") { row.push(f); f = ""; } else if (ch === "\n" || ch === "\r") { if (ch === "\r" && t[i + 1] === "\n") i++; row.push(f); rows.push(row); row = []; f = ""; } else f += ch;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  const [h, ...rest] = rows; return rest.filter((r) => r.length > 1).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ""])));
}
/** Reviewed Cambridge decision per candidate: v2 second pass where present, otherwise the v1 triage decision. */
export function cambridgeDecisions() {
  const v1 = parseCsv(fs.readFileSync(`${REVIEW}/PINGVIBE_Cambridge_Candidate_Review_AI_Triage.csv`, "utf8"));
  const v2 = new Map(parseCsv(fs.readFileSync(`${REVIEW}/PINGVIBE_Cambridge_Candidate_Review_v2_SecondPass.csv`, "utf8")).map((r) => [r.candidate_id, r]));
  const out = new Map<string, { decision: string; band: number | null; category: string | null }>();
  for (const r of v1) {
    const s = v2.get(r.candidate_id);
    const decision = s?.v2_decision || r.review_decision;
    const band = decision === "Hold" ? null : Number(s?.v2_final_band || r.suggested_band || r.band) || null;
    out.set(r.candidate_id, { decision, band, category: (s ? s.v2_final_category : r.category_reviewed) || null });
  }
  return out;
}
async function portalWords(dir: string): Promise<Existing[]> {
  const { PGlite } = await import("@electric-sql/pglite");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pv-registry-"));
  fs.cpSync(dir, tmp, { recursive: true });
  const db = new PGlite(tmp);
  try {
    const m = await db.query<any>(`select word, band, meaning, status from vocabulary_master`);
    const c = await db.query<any>(`select word, band, source, status, candidate_id from vocabulary_candidates`);
    const l = await db.query<any>(`select body->>'word' word, band, status, body->>'meaning' meaning from content_library where kind = 'vocabulary'`);
    return [
      ...m.rows.map((r) => ({ layer: `portal:vocabulary_master(${r.status})`, word: r.word, norm: norm(r.word), band: r.band, sense: r.meaning ?? null, ref: `vocabulary_master:${r.word}` })),
      ...c.rows.map((r) => ({ layer: `portal:vocabulary_candidates(${r.source}, ${r.status})`, word: r.word, norm: norm(r.word), band: r.band, sense: null, ref: r.candidate_id ? `candidate:${r.candidate_id}` : `queue:${norm(r.word)}` })),
      ...l.rows.filter((r) => r.word).map((r) => ({ layer: `portal:content_library(${r.status})`, word: r.word, norm: norm(r.word), band: r.band, sense: r.meaning ?? null, ref: `content_library:${norm(r.word)}` })),
    ];
  } finally { await db.close(); fs.rmSync(tmp, { recursive: true, force: true }); }
}
export async function loadExisting(opts: { portal?: string } = {}): Promise<Existing[]> {
  const dec = cambridgeDecisions();
  const ex: Existing[] = [
    ...VOCABULARY.map((v) => ({ layer: "published (seed)", word: v.word, norm: norm(v.word), band: v.band, sense: v.meaning, ref: `published:${norm(v.word)}` })),
    ...headwordRows().map((h) => ({ layer: `pingvibe-queue (${h.category})`, word: h.word, norm: norm(h.word), band: h.band, sense: null, ref: `queue:${norm(h.word)}` })),
    ...CAMBRIDGE_CANDIDATES.map((c) => { const d = dec.get(c.id); return { layer: `cambridge (${d?.decision ?? "unreviewed"})`, word: c.word, norm: norm(c.word), band: d?.band ?? c.band, sense: null, ref: `candidate:${c.id}`, decision: d?.decision }; }),
  ];
  const reg = readRegistry(); const st = currentStatus(reg);
  for (const l of reg) if (l.type === "word") ex.push({ layer: `registry ${l.batch_id} (${st.get(l.id)})`, word: l.word, norm: l.norm_word, band: l.band, sense: l.sense, ref: `registry:${l.id}` });
  if (opts.portal) ex.push(...(await portalWords(opts.portal)));
  return ex;
}

// ── The check ──
export interface CheckResult { word: string; band: number; result: "clear" | "flag" | "exclude"; exact: string[]; variants: string[]; related: string[]; notes: string[] }
export function check(cands: Candidate[], existing: Existing[]): CheckResult[] {
  const byNorm = new Map<string, Existing[]>(); const byVar = new Map<string, Existing[]>(); const byStem = new Map<string, Existing[]>();
  const put = (m: Map<string, Existing[]>, k: string, e: Existing) => { if (!m.has(k)) m.set(k, []); m.get(k)!.push(e); };
  for (const e of existing) { put(byNorm, e.norm, e); put(byVar, variantKey(e.word), e); put(byStem, stemKey(e.word), e); }
  const seen = new Map<string, Candidate>();
  return cands.map((c) => {
    const n = norm(c.word);
    const own = (e: Existing) => (c.source?.candidate_id && e.ref === `candidate:${c.source.candidate_id}`) || (c.source?.kind === "pingvibe-queue" && e.ref === `queue:${n}`);
    const fmt = (e: Existing) => `${e.word} — ${e.layer}${e.band ? `, band ${e.band}` : ""}`;
    const r: CheckResult = { word: c.word, band: c.band, result: "clear", exact: [], variants: [], related: [], notes: [] };
    const self = existing.filter((e) => e.norm === n && own(e));
    for (const e of self) {
      if (e.decision === "Hold") { r.result = "exclude"; r.notes.push("Cambridge Hold item — excluded"); }
      if (e.decision === "Revise") { r.notes.push("Cambridge Revise item — fix and check before use"); }
    }
    const exact = (byNorm.get(n) ?? []).filter((e) => !own(e));
    if (exact.some((e) => e.decision === "Hold")) { r.result = "exclude"; r.notes.push("matches a Cambridge Hold item — excluded"); }
    if (exact.length) {
      const senses = exact.map((e) => e.sense);
      const distinct = c.distinct_sense && c.sense && senses.every((s) => s && senseSlug(s) !== senseSlug(c.sense));
      if (distinct) { r.notes.push(`same word, declared different sense ("${c.sense}") — allowed as a separate entry; confirm in review`); r.exact = exact.map(fmt); if (r.result === "clear") r.result = "flag"; }
      else { r.result = "exclude"; r.exact = exact.map(fmt); }
    }
    const prior = seen.get(n);
    if (prior && !(c.distinct_sense && c.sense && senseSlug(prior.sense) !== senseSlug(c.sense))) { r.result = "exclude"; r.exact.push(`${prior.word} — earlier in this same proposal`); }
    seen.set(n, c);
    if (r.result !== "exclude") {
      r.variants = [...new Set((byVar.get(variantKey(c.word)) ?? []).filter((e) => e.norm !== n && !own(e)).map(fmt))];
      r.related = [...new Set((byStem.get(stemKey(c.word)) ?? []).filter((e) => e.norm !== n && !own(e) && variantKey(e.word) !== variantKey(c.word)).map(fmt))];
      if ((r.variants.length || r.related.length || r.notes.length) && r.result === "clear") r.result = "flag";
      // Later proposal items are also checked against earlier ones in the same proposal.
      const mine: Existing = { layer: "earlier in this same proposal", word: c.word, norm: n, band: c.band, sense: c.sense ?? null, ref: `proposal:${n}` };
      put(byVar, variantKey(c.word), mine); put(byStem, stemKey(c.word), mine);
    }
    return r;
  });
}

/** Guard for generation scripts: throws if any requested word is an exact duplicate or a Hold item. */
export async function registryGuard(cands: Candidate[], opts: { portal?: string } = {}) {
  const res = check(cands, await loadExisting(opts));
  const bad = res.filter((r) => r.result === "exclude");
  if (bad.length) throw new Error(`Registry check failed — ${bad.length} excluded word(s): ${bad.map((b) => `${b.word} [${[...b.exact, ...b.notes].join("; ")}]`).join(" | ")}`);
  return res;
}

// ── Registering a generated batch ──
interface BatchSpec { batch_id: string; description: string; cards_source: string; created_at?: string; entries: (Candidate & { card_index: number; sense: string })[] }
async function register(specFile: string, portal?: string) {
  const spec: BatchSpec = JSON.parse(fs.readFileSync(specFile, "utf8"));
  if (!/^B\d{4}-[a-z0-9-]+$/.test(spec.batch_id)) throw new Error("batch_id must look like B0002-short-name");
  const reg = readRegistry();
  if (reg.some((l) => l.type === "batch" && l.batch_id === spec.batch_id)) throw new Error(`Batch ${spec.batch_id} is already registered (append-only: use a new batch id).`);
  const dir = path.join(ROOT, "batches", spec.batch_id);
  const cardsFile = path.join(dir, "cards.json");
  if (fs.existsSync(cardsFile)) throw new Error(`${cardsFile} already exists; earlier batches are never overwritten.`);
  const res = check(spec.entries, await loadExisting({ portal }));
  const bad = res.filter((r) => r.result === "exclude");
  if (bad.length) throw new Error(`Refusing to register: exact duplicates or Hold items:\n${bad.map((b) => ` - ${b.word}: ${[...b.exact, ...b.notes].join("; ")}`).join("\n")}`);
  fs.mkdirSync(dir, { recursive: true });
  const cardsText = fs.readFileSync(spec.cards_source, "utf8");
  fs.writeFileSync(cardsFile, cardsText, { flag: "wx" });
  const cardsSha = sha(cardsText);
  const at = spec.created_at ?? new Date().toISOString();
  const lines: any[] = [{ type: "batch", batch_id: spec.batch_id, description: spec.description, cards_file: cardsFile, cards_sha256: cardsSha, count: spec.entries.length, created_at: at }];
  spec.entries.forEach((e, i) => {
    const r = res[i];
    lines.push({
      type: "word", id: stableId(e.word, e.band, e.sense), word: e.word, norm_word: norm(e.word), sense: e.sense, part_of_speech: e.part_of_speech ?? null,
      band: e.band, grade_range: e.grade_range ?? null, category: e.category ?? null, source: e.source ?? { kind: "new" }, batch_id: spec.batch_id,
      review_status: STATUS_DEFAULT, approved: false, published: false, local_test: true,
      card_ref: { file: cardsFile, index: e.card_index, sha256: cardsSha },
      flags: [...r.notes, ...r.variants.map((v) => `close variant: ${v}`), ...r.related.map((v) => `related form: ${v}`)], created_at: at,
    });
  });
  const n = appendLines(lines);
  console.log(`Registered ${spec.batch_id}: ${spec.entries.length} words (${n} registry lines appended). Cards stored at ${cardsFile}.`);
  const flagged = res.filter((r) => r.result === "flag");
  if (flagged.length) console.log(`${flagged.length} entries carry review flags.`);
}

// ── CLI ──
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
async function main() {
  const [cmd, a1, a2, a3] = process.argv.slice(2);
  if (cmd === "check") {
    const p = JSON.parse(fs.readFileSync(a1, "utf8")); const cands: Candidate[] = p.candidates ?? p;
    const res = check(cands, await loadExisting({ portal: arg("--portal") }));
    const sum = { clear: res.filter((r) => r.result === "clear").length, flag: res.filter((r) => r.result === "flag").length, exclude: res.filter((r) => r.result === "exclude").length };
    for (const r of res) if (r.result !== "clear") console.log(`${r.result.toUpperCase().padEnd(7)} b${r.band} ${r.word}: ${[...r.exact.map((x) => `duplicate of ${x}`), ...r.variants.map((x) => `variant of ${x}`), ...r.related.map((x) => `related to ${x}`), ...r.notes].join("; ")}`);
    console.log(`checked ${res.length}: ${sum.clear} clear, ${sum.flag} flagged for review, ${sum.exclude} excluded`);
    if (arg("--out")) fs.writeFileSync(arg("--out")!, JSON.stringify({ checked_at: new Date().toISOString(), proposal: a1, portal: arg("--portal") ?? null, registry_lines: readRegistry().length, summary: sum, results: res }, null, 1));
    if (process.argv.includes("--strict") && sum.exclude) process.exit(1);
  } else if (cmd === "register") await register(a1, arg("--portal"));
  else if (cmd === "status") {
    if (!ALLOWED_STATUS.has(a2)) throw new Error(`Status must be one of ${[...ALLOWED_STATUS].join(", ")} (this tool never approves or publishes).`);
    if (!readRegistry().some((l) => l.type === "word" && l.id === a1)) throw new Error(`Unknown entry ${a1}`);
    appendLines([{ type: "status", entry_id: a1, review_status: a2, note: a3 ?? "", created_at: new Date().toISOString() } as any]);
    console.log(`Appended status ${a2} for ${a1}.`);
  } else if (cmd === "amend") {
    // Records edits to batch cards files (e.g. a redaction) as new lines; earlier lines stay untouched. a1 may list several batch ids, comma-separated.
    if (!a1 || !a2) throw new Error('usage: amend <batch_id>[,<batch_id>…] "<reason>"');
    const reg = readRegistry(); const lines: any[] = []; const ids = a1.split(",");
    for (const id of ids) {
      const b = reg.find((l) => l.type === "batch" && l.batch_id === id) as BatchEvent | undefined;
      if (!b) throw new Error(`Unknown batch ${id}`);
      let prevSha = b.cards_sha256; for (const l of reg as any[]) if (l.type === "batch_amend" && l.batch_id === id) prevSha = l.cards_sha256;
      const now = sha(fs.readFileSync(b.cards_file, "utf8"));
      if (now !== prevSha) lines.push({ type: "batch_amend", batch_id: id, cards_file: b.cards_file, previous_sha256: prevSha, cards_sha256: now, reason: a2, created_at: new Date().toISOString() });
    }
    if (!lines.length) { console.log("No change to record."); return; }
    appendLines(lines, ids);
    console.log(`Recorded ${lines.length} amendment(s): ${lines.map((l) => l.batch_id).join(", ")}.`);
  } else if (cmd === "verify") {
    const v = verify(); console.log(v.ok ? `Registry OK: ${v.lines} lines, hash chain intact.` : `Registry INVALID:\n${v.errors.join("\n")}`); if (!v.ok) process.exit(1);
  } else if (cmd === "list") {
    const reg = readRegistry(); const st = currentStatus(reg); const c = new Map<string, number>();
    for (const l of reg) if (l.type === "word") { const k = `${l.batch_id} | band ${l.band} | ${st.get(l.id)}`; c.set(k, (c.get(k) ?? 0) + 1); }
    for (const [k, n] of c) console.log(`${k}: ${n}`);
  } else { console.error("usage: check|register|status|verify|list (see file header)"); process.exit(2); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) main().catch((e) => { console.error(e.message); process.exit(1); });
