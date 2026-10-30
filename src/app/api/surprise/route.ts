import { childRoute, HttpError, ok } from "@/server/api";
import { one } from "@/server/db";
import { todayKey } from "@/server/time";
import { awardXp } from "@/server/gamification";

const FACTS = [
  "The word 'alphabet' comes from the first two Greek letters: alpha and beta!",
  "'Set' is one of the English words with the most meanings — over 400!",
  "The longest English word without a vowel is 'rhythms'.",
  "'Pyjamas', 'shampoo' and 'bungalow' came into English from Indian languages!",
  "A sentence that uses every letter of the alphabet is called a pangram: 'The quick brown fox jumps over the lazy dog.'",
  "The dot over the letter 'i' is called a tittle!",
  "'Jungle' comes from the Sanskrit word 'jangala'.",
  "Shakespeare invented many words we still use, like 'bedroom' and 'lonely'.",
];

/** Daily Surprise Box: unlocked by finishing today's quest. Fixed, transparent reward — no random prizes. */
export const POST = childRoute(async (_req, child) => {
  const today = todayKey();
  const done = await one(`select 1 from daily_learning_sessions where child_id = $1 and session_date = $2::date and completed_at is not null`, [child.id, today]);
  if (!done) throw new HttpError(400, "Complete today's Daily Word Quest to open the Surprise Box!");
  const award = await awardXp(child.id, "daily_bonus", `surprise:${child.id}:${today}`);
  const day = Math.floor(new Date(today).getTime() / 86400000);
  return ok({ award, fact: FACTS[day % FACTS.length] });
});
