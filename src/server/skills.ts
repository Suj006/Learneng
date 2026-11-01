import "server-only";
import { one, query } from "./db";

/**
 * Records evidence from ordinary gameplay (server-validated answers only) and
 * quietly refreshes the child's skill proficiency. Children never see this as a test.
 */
export async function recordEvidence(childId: string, skill: string, correct: number, attempts: number, meta: { source?: string; contentId?: string; difficulty?: string } = {}) {
  if (attempts <= 0) return;
  const c = Math.max(0, Math.min(correct, attempts));
  await query(
    `insert into skill_evidence (child_id, skill, correct, attempts) values ($1,$2,$3,$4)
     on conflict (child_id, skill) do update set correct = skill_evidence.correct + $3, attempts = skill_evidence.attempts + $4, updated_at = now()`,
    [childId, skill, c, attempts]);
  // Unified learning history: one timestamped row per evidence event (trends, last activity, recent accuracy).
  await query(`insert into learning_events (child_id, skill, area, correct, attempts, source, content_id, difficulty) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [childId, skill, areaOf(skill), c, attempts, meta.source ?? null, meta.contentId ?? null, meta.difficulty ?? null]);
  await refreshProficiency(childId);
}

/** Which of the 11 skill areas a micro-skill evidence key belongs to (first match). */
export function areaOf(skill: string): string | null {
  return AREAS.find((a) => (a.evidence as readonly string[]).includes(skill))?.key ?? null;
}

/** Eleven independent skill areas and the gameplay evidence that informs each. */
export const AREAS = [
  { key: "vocabulary", title: "Vocabulary", who: "lexi", column: "skill_vocabulary", evidence: ["meaning", "picture", "usage", "fill_blank", "synonyms", "opposites", "advanced"] },
  { key: "grammar", title: "Grammar", who: "grammy", column: "skill_grammar", evidence: ["grammar_parts", "grammar_articles", "grammar_sentences", "grammar_tenses", "grammar_advanced"] },
  { key: "spelling", title: "Spelling", who: "lexi", column: null, evidence: ["spelling", "spelling_advanced", "writing_spelling"] },
  { key: "writing", title: "Writing", who: "story", column: "skill_writing", evidence: ["writing_sentences", "writing_creativity", "writing_vocabulary", "writing_paragraph", "story_builder"] },
  { key: "reading", title: "Reading", who: "story", column: "skill_reading", evidence: ["reading", "reading_glossary"] },
  { key: "speaking", title: "Speaking", who: "speaky", column: "skill_speaking", evidence: ["speaking_lines", "conversation"] },
  { key: "pronunciation", title: "Pronunciation", who: "speaky", column: null, evidence: ["pronunciation"] },
  { key: "phonics", title: "Phonics", who: "lexi", column: null, evidence: ["listen_spell", "phonics"] },
  { key: "listening", title: "Listening", who: "speaky", column: null, evidence: ["listening", "listening_sentences"] },
  { key: "comprehension", title: "Comprehension", who: "grammy", column: null, evidence: ["comprehension", "inference"] },
  { key: "real_world", title: "Real-world English", who: "max", column: null, evidence: ["real_world"] },
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
  // "Listen and spell" is sound-to-letter work: it also informs phonics.
  if (type === "spelling") keys.push("listen_spell");
  return keys;
}

export const GRAMMAR_EVIDENCE: Record<string, string> = {
  nouns: "grammar_parts", pronouns: "grammar_parts", verbs: "grammar_parts", adjectives: "grammar_parts", adverbs: "grammar_parts", conjunctions: "grammar_parts",
  articles: "grammar_articles", prepositions: "grammar_articles", punctuation: "grammar_sentences", "sentence-construction": "grammar_sentences",
  tenses: "grammar_tenses", "subject-verb-agreement": "grammar_tenses", "active-passive": "grammar_advanced", "direct-indirect": "grammar_advanced",
  // generated drills
  opposites: "opposites", synonyms: "synonyms", sentence: "fill_blank",
};

/** Five adaptive difficulty levels (used for adaptation and in parent observations). */
export const DIFFICULTY = ["Beginner", "Developing", "Intermediate", "Advanced", "Challenge"] as const;
export type Difficulty = (typeof DIFFICULTY)[number];
export const difficultyLabel = (score: number): Difficulty =>
  score < 30 ? "Beginner" : score < 50 ? "Developing" : score < 70 ? "Intermediate" : score < 85 ? "Advanced" : "Challenge";
/** What a CHILD sees: always encouraging, never a ranking or a deficit label. */
export const GROWTH: Record<Difficulty, string> = {
  Beginner: "🌱 Sprouting", Developing: "🌿 Growing", Intermediate: "🌳 Progressing well", Advanced: "⭐ Strong", Challenge: "🌟 Shining",
};

/** Confidence in an estimate, from the amount of evidence (never a conclusion from one or two answers). */
export const confidenceOf = (attempts: number): "insufficient" | "low" | "medium" | "high" =>
  attempts < MIN_EVIDENCE ? "insufficient" : attempts < 40 ? "low" : attempts < 100 ? "medium" : "high";

/**
 * Trend: compares the last 14 days with everything before, only when both windows have enough evidence.
 * A difference under 8 points is "steady" (normal day-to-day variation).
 */
export function trendOf(recent: { c: number; n: number }, before: { c: number; n: number }): "improving" | "steady" | "needs_practice" | "unknown" {
  if (recent.n < 8 || before.n < MIN_EVIDENCE) return "unknown";
  const d = (recent.c / recent.n - before.c / before.n) * 100;
  return d >= 8 ? "improving" : d <= -8 ? "needs_practice" : "steady";
}

/**
 * Skill intelligence for all 11 areas: estimate, confidence, attempts, accuracy, recent vs historical accuracy,
 * difficulty level, trend and last activity. Built from the aggregate evidence plus the timestamped learning history.
 */
export async function skillIntelligence(childId: string) {
  const [profile, ev] = await Promise.all([
    skillProfile(childId),
    query<{ area: string; recent_c: number; recent_n: number; old_c: number; old_n: number; last_at: string | null }>(
      `select area,
              coalesce(sum(correct) filter (where created_at > now() - interval '14 days'),0)::int recent_c,
              coalesce(sum(attempts) filter (where created_at > now() - interval '14 days'),0)::int recent_n,
              coalesce(sum(correct) filter (where created_at <= now() - interval '14 days'),0)::int old_c,
              coalesce(sum(attempts) filter (where created_at <= now() - interval '14 days'),0)::int old_n,
              to_char(max(created_at),'YYYY-MM-DD') last_at
         from learning_events where child_id = $1 and area is not null group by area`, [childId]),
  ]);
  const ev0 = await query<{ skill: string; correct: number; attempts: number }>(`select skill, correct, attempts from skill_evidence where child_id = $1`, [childId]);
  return profile.map((p) => {
    const e = ev.find((x) => x.area === p.key);
    const area = AREAS.find((a) => a.key === p.key)!;
    const rows = ev0.filter((r) => (area.evidence as readonly string[]).includes(r.skill));
    const correct = rows.reduce((s, r) => s + r.correct, 0);
    // Evidence recorded before the learning history existed counts as "historical".
    const histN = p.attempts - (e?.recent_n ?? 0), histC = correct - (e?.recent_c ?? 0);
    return {
      ...p, correct,
      accuracy: p.attempts ? Math.round((100 * correct) / p.attempts) : null,
      confidence: confidenceOf(p.attempts),
      recentAccuracy: e && e.recent_n >= 5 ? Math.round((100 * e.recent_c) / e.recent_n) : null,
      recentAttempts: e?.recent_n ?? 0,
      trend: trendOf({ c: e?.recent_c ?? 0, n: e?.recent_n ?? 0 }, { c: histC, n: histN }),
      lastActivity: e?.last_at ?? null,
    };
  });
}

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

export type Stage = "locked" | "ready" | "started" | "practising" | "developing" | "mastered";
export const STAGE_LABEL: Record<Stage, string> = { locked: "Locked", ready: "Ready to start", started: "Started", practising: "Practising", developing: "Developing", mastered: "Demonstrated mastery" };
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
    // Growth stage comes ONLY from learning evidence (attempts + accuracy), never from XP or coins.
    const stage: Stage = st === "mastered" ? "mastered" : st === "locked" ? "locked" : attempts === 0 ? "ready"
      : attempts < Math.ceil(n.min_attempts / 2) ? "started" : attempts < n.min_attempts ? "practising" : "developing";
    out.push({ ...n, attempts, accuracy, status: st, stage, progress: Math.min(100, Math.round((attempts / n.min_attempts) * 100)) });
  }
  return out;
}
