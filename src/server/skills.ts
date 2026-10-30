import "server-only";
import { one, query } from "./db";

/**
 * Records evidence from ordinary gameplay (server-validated answers only) and
 * quietly refreshes the child's skill proficiency. Children never see this as a test.
 */
export async function recordEvidence(childId: string, skill: string, correct: number, attempts: number) {
  if (attempts <= 0) return;
  await query(
    `insert into skill_evidence (child_id, skill, correct, attempts) values ($1,$2,$3,$4)
     on conflict (child_id, skill) do update set correct = skill_evidence.correct + $3, attempts = skill_evidence.attempts + $4, updated_at = now()`,
    [childId, skill, Math.max(0, correct), attempts]);
  await refreshProficiency(childId);
}

/** Eight independent skill areas and the gameplay evidence that informs each. */
export const AREAS = [
  { key: "vocabulary", title: "Vocabulary", who: "lexi", column: "skill_vocabulary", evidence: ["meaning", "picture", "usage", "fill_blank", "synonyms", "opposites", "advanced"] },
  { key: "grammar", title: "Grammar", who: "grammy", column: "skill_grammar", evidence: ["grammar_parts", "grammar_articles", "grammar_sentences", "grammar_tenses", "grammar_advanced"] },
  { key: "spelling", title: "Spelling", who: "lexi", column: null, evidence: ["spelling", "spelling_advanced", "writing_spelling"] },
  { key: "writing", title: "Writing", who: "story", column: "skill_writing", evidence: ["writing_sentences", "writing_creativity", "writing_vocabulary", "writing_paragraph", "story_builder"] },
  { key: "reading", title: "Reading", who: "story", column: "skill_reading", evidence: ["reading", "reading_glossary"] },
  { key: "speaking", title: "Speaking", who: "speaky", column: "skill_speaking", evidence: ["pronunciation", "speaking_lines", "conversation"] },
  { key: "listening", title: "Listening", who: "speaky", column: null, evidence: ["listening", "listening_sentences"] },
  { key: "comprehension", title: "Comprehension", who: "grammy", column: null, evidence: ["comprehension", "inference"] },
] as const;

/** Evidence needed before an estimate is trusted enough to change difficulty (no jumps after 1–2 answers). */
export const MIN_EVIDENCE = 15;
const PRIOR = 0.6, PRIOR_WEIGHT = 15;

/** Smoothed estimate: starts at a neutral prior and moves only as evidence accumulates. */
export function estimate(correct: number, attempts: number) {
  return Math.round(((correct + PRIOR * PRIOR_WEIGHT) / (attempts + PRIOR_WEIGHT)) * 100);
}

export async function refreshProficiency(childId: string) {
  const ev = await query<{ skill: string; correct: number; attempts: number }>(`select skill, correct, attempts from skill_evidence where child_id = $1`, [childId]);
  const sets: string[] = [];
  const vals: unknown[] = [childId];
  for (const a of AREAS) {
    if (!a.column) continue;
    const rows = ev.filter((e) => (a.evidence as readonly string[]).includes(e.skill));
    const n = rows.reduce((s, r) => s + r.attempts, 0);
    if (n < MIN_EVIDENCE) continue;
    vals.push(estimate(rows.reduce((s, r) => s + r.correct, 0), n));
    sets.push(`${a.column} = $${vals.length}`);
  }
  if (sets.length) await query(`update child_profiles set ${sets.join(", ")}, updated_at = now() where child_id = $1`, vals);
}

/** Quest/revision challenge type → skill evidence keys. */
export function evidenceForAnswer(type: string, band: number): string[] {
  const map: Record<string, string[]> = {
    meaning: ["meaning"], picture: ["picture"], spelling: ["spelling"], fill_blank: ["fill_blank"], usage: ["usage"],
  };
  const keys = [...(map[type] ?? [])];
  if (band >= 3 && (type === "meaning" || type === "usage" || type === "fill_blank")) keys.push("advanced");
  if (band >= 3 && type === "spelling") keys.push("spelling_advanced");
  return keys;
}

export const GRAMMAR_EVIDENCE: Record<string, string> = {
  nouns: "grammar_parts", pronouns: "grammar_parts", verbs: "grammar_parts", adjectives: "grammar_parts", adverbs: "grammar_parts", conjunctions: "grammar_parts",
  articles: "grammar_articles", prepositions: "grammar_articles", punctuation: "grammar_sentences", "sentence-construction": "grammar_sentences",
  tenses: "grammar_tenses", "subject-verb-agreement": "grammar_tenses", "active-passive": "grammar_advanced", "direct-indirect": "grammar_advanced",
  // generated drills
  opposites: "opposites", synonyms: "synonyms", sentence: "fill_blank",
};

/** Internal challenge level per skill (used for adaptation and in parent observations). */
export const DIFFICULTY = ["Beginner", "Easy", "Intermediate", "Advanced", "Expert"] as const;
export const difficultyLabel = (score: number): (typeof DIFFICULTY)[number] =>
  score < 30 ? "Beginner" : score < 50 ? "Easy" : score < 70 ? "Intermediate" : score < 85 ? "Advanced" : "Expert";
/** What a CHILD sees: always encouraging, never a ranking or a deficit label. */
export const GROWTH: Record<(typeof DIFFICULTY)[number], string> = {
  Beginner: "🌱 Sprouting", Easy: "🌿 Growing", Intermediate: "🌳 Progressing well", Advanced: "⭐ Strong", Expert: "🌟 Shining",
};

export async function skillProfile(childId: string) {
  const ev = await query<{ skill: string; correct: number; attempts: number }>(`select skill, correct, attempts from skill_evidence where child_id = $1`, [childId]);
  return AREAS.map((a) => {
    const rows = ev.filter((e) => (a.evidence as readonly string[]).includes(e.skill));
    const attempts = rows.reduce((s, r) => s + r.attempts, 0);
    const score = estimate(rows.reduce((s, r) => s + r.correct, 0), attempts);
    const level = difficultyLabel(score);
    const confident = attempts >= MIN_EVIDENCE;
    return { key: a.key, title: a.title, who: a.who, score, attempts, confident, level, growth: confident ? GROWTH[level] : "✨ Discovering", ev: confident ? score : null };
  });
}

export async function skillTree(childId: string, band: number) {
  const [nodes, ev] = await Promise.all([
    query<{ slug: string; branch: string; title: string; description: string; evidence: string; min_attempts: number; min_accuracy: number; prereq: string | null; band_min: number }>(
      `select slug, branch, title, description, evidence, min_attempts, min_accuracy, prereq, band_min from skill_nodes order by branch, sort_order`),
    query<{ skill: string; correct: number; attempts: number }>(`select skill, correct, attempts from skill_evidence where child_id = $1`, [childId]),
  ]);
  const byKey = new Map(ev.map((e) => [e.skill, e]));
  const status = new Map<string, "mastered" | "developing" | "locked">();
  const out = [];
  for (const n of nodes) {
    const e = byKey.get(n.evidence);
    const attempts = e?.attempts ?? 0;
    const accuracy = attempts ? Math.round(((e?.correct ?? 0) / attempts) * 100) : 0;
    const prereqOk = !n.prereq || status.get(n.prereq) === "mastered";
    const mastered = prereqOk && band >= n.band_min && attempts >= n.min_attempts && accuracy >= n.min_accuracy;
    const st = mastered ? "mastered" : prereqOk && band >= n.band_min ? "developing" : "locked";
    status.set(n.slug, st);
    out.push({ ...n, attempts, accuracy, status: st, progress: Math.min(100, Math.round((attempts / n.min_attempts) * 100)) });
  }
  return out;
}
