import { NextResponse } from "next/server";
import { HttpError, parentRoute } from "@/server/api";
import { one, query } from "@/server/db";

/** DPDP right to access: downloadable copy of everything stored about the child. */
export const GET = parentRoute(async (_req, parent, params: { id: string }) => {
  const child = await one(`select id, display_name, username, birth_month, birth_year, grade, status, created_at from children where id = $1 and parent_id = $2`, [params.id, parent.id]);
  if (!child) throw new HttpError(404, "Child not found.");
  const id = params.id;
  const [profile, vocab, sessions, writing, grammar, games, reading, speaking, xp, achievements, rewards, consent] = await Promise.all([
    one(`select * from child_profiles where child_id = $1`, [id]),
    query(`select v.word, p.status, p.correct_count, p.wrong_count, p.first_seen_at from child_vocabulary_progress p join vocabulary_master v on v.id = p.word_id where p.child_id = $1`, [id]),
    query(`select session_date, correct, attempted, completed_at from daily_learning_sessions where child_id = $1 order by session_date`, [id]),
    query(`select w.title, w.content, w.status, w.submitted_at, e.score, e.feedback from writing_submissions w left join writing_evaluations e on e.submission_id = w.id where w.child_id = $1`, [id]),
    query(`select t.title, g.best_score, g.attempts from grammar_progress g join grammar_topics t on t.id = g.topic_id where g.child_id = $1`, [id]),
    query(`select game_slug, score, max_score, created_at from game_sessions where child_id = $1`, [id]),
    query(`select s.title, p.best_score, p.completed_at from story_progress p join reading_stories s on s.id = p.story_id where p.child_id = $1`, [id]),
    query(`select scenario, lines, accuracy, created_at from speaking_sessions where child_id = $1`, [id]),
    query(`select amount, coins, reason, created_at from xp_transactions where child_id = $1 order by created_at`, [id]),
    query(`select slug, unlocked_at from child_achievements where child_id = $1`, [id]),
    query(`select slug, redeemed_at from child_rewards where child_id = $1`, [id]),
    query(`select consent_version, scopes, granted_at, revoked_at from consent_records where child_id = $1`, [id]),
  ]);
  const data = { exported_at: new Date().toISOString(), child, profile, vocabulary: vocab, daily_sessions: sessions, writing, grammar, games, reading, speaking_sessions: speaking, xp_ledger: xp, achievements, rewards, consent, note: "PING VIBE never stores voice recordings or speech transcripts." };
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="pingvibe-${(child as any).username}.json"` },
  });
});
