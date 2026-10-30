import { childRoute, ok } from "@/server/api";
import { buildQuestions, getOrCreateDailySession } from "@/server/vocab";
import { query } from "@/server/db";
import { getJourney } from "@/server/journey";

export const GET = childRoute(async (_req, child) => {
  const journey = await getJourney(child.id, child.grade);
  const { session, newWords, reviewWords } = await getOrCreateDailySession(child.id, journey.newWords);
  const answered = await query<{ word_id: string; challenge_type: string; correct: boolean }>(
    `select word_id, challenge_type, correct from daily_word_challenges where session_id = $1`, [session.id]);
  const questions = await buildQuestions(newWords, reviewWords);
  return ok({
    session: { id: session.id, completed: Boolean(session.completed_at), cardsViewed: session.cards_viewed, correct: session.correct, attempted: session.attempted },
    newWords, reviewWords, questions, assessmentDay: journey.newWords === 0,
    answered: answered.map((a) => ({ key: `${a.word_id}:${a.challenge_type}`, correct: a.correct })),
  });
});
