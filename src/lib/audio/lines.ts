"use client";
/** What the characters say, and when. Used sparingly at meaningful moments, never on every button. */
import { audio, type Speaker } from "./manager";

export const LINES = {
  intro: {
    dashboard: { who: "max" as Speaker, text: "Hey Explorer! Your next big adventure is waiting. Shall we go?" },
    quest: { who: "lexi" as Speaker, text: "Hey Explorer! Ready to discover some super cool new words?" },
    grammar: { who: "grammy" as Speaker, text: "Welcome to Grammar Galaxy! I have some magical grammar tricks for you." },
    speaking: { who: "speaky" as Speaker, text: "Hello, superstar! Let's warm up that amazing voice of yours." },
    writing: { who: "story" as Speaker, text: "Once upon a time... something magical was waiting just around the corner! Let's write it." },
    reading: { who: "story" as Speaker, text: "Pick a story, Explorer. Every page is a new adventure!" },
    arcade: { who: "max" as Speaker, text: "Welcome to the Word Games Arcade! Pick a game and let's play!" },
    rewards: { who: "max" as Speaker, text: "Look at all these treasures! Everything here is earned by learning." },
  },
  // Praise and encouragement by age band (1 = Pre-KG–UKG, 2 = Grades 1–2, 3 = Grades 3–4, 4 = Grades 5–7).
  correctByBand: {
    1: [{ who: "lexi" as Speaker, text: "Yay! You found it!" }, { who: "max" as Speaker, text: "Great job, little explorer!" }, { who: "speaky" as Speaker, text: "Hooray! That's right!" }],
    2: [{ who: "lexi" as Speaker, text: "Fantastic! You discovered a new word!" }, { who: "speaky" as Speaker, text: "Super! You got it!" }, { who: "max" as Speaker, text: "Brilliant, Explorer!" }],
    3: [{ who: "grammy" as Speaker, text: "Brilliant work! You used that word correctly." }, { who: "lexi" as Speaker, text: "Spot on! Your word power is growing." }, { who: "max" as Speaker, text: "Great thinking!" }],
    4: [{ who: "lexi" as Speaker, text: "Excellent work. Your vocabulary is growing." }, { who: "grammy" as Speaker, text: "Precisely right. Nicely reasoned." }, { who: "max" as Speaker, text: "Strong answer. Keep that momentum." }],
  } as Record<number, { who: Speaker; text: string }[]>,
  mistakeByBand: {
    1: [{ who: "lexi" as Speaker, text: "Almost! Let's try together!" }, { who: "speaky" as Speaker, text: "Good try! You're doing great!" }],
    2: [{ who: "grammy" as Speaker, text: "Oops! Let's fix that together. You're getting closer!" }, { who: "lexi" as Speaker, text: "Nearly there! Every try makes your brain stronger." }],
    3: [{ who: "grammy" as Speaker, text: "Good try. Let's look at why that one is different." }, { who: "lexi" as Speaker, text: "Close! Check the explanation and you'll have it." }],
    4: [{ who: "grammy" as Speaker, text: "Interesting attempt. Let's look at what makes the correct answer work." }, { who: "lexi" as Speaker, text: "Not quite. Read the explanation; it's a useful pattern to remember." }],
  } as Record<number, { who: Speaker; text: string }[]>,
  reward: { who: "max" as Speaker, text: "Wow! You just unlocked a magical surprise!" },
  levelUp: { who: "max" as Speaker, text: "Level up! You're getting stronger every day, Explorer!" },
  achievement: { who: "max" as Speaker, text: "A brand new badge! You should be so proud!" },
  mission: { who: "max" as Speaker, text: "Mission complete! Your next adventure is ready." },
};

let rightStreak = 0; let wrongStreak = 0; let n = 0;
/** Answer feedback: always a gentle sound; a character voice only now and then, so it stays special. */
export function cheer(correct: boolean) {
  audio.sfx(correct ? "correct" : "incorrect");
  if (correct) {
    rightStreak++; wrongStreak = 0;
    if (rightStreak % 3 === 0) { const set = LINES.correctByBand[audio.band] ?? LINES.correctByBand[2]; const l = set[n++ % set.length]; void audio.say(l.who, l.text, { server: true }); }
  } else {
    wrongStreak++; rightStreak = 0;
    if (wrongStreak === 1 || wrongStreak % 3 === 0) { const set = LINES.mistakeByBand[audio.band] ?? LINES.mistakeByBand[2]; const l = set[n++ % set.length]; void audio.say(l.who, l.text, { server: true }); }
  }
}

export type IntroKey = keyof typeof LINES.intro;
/** Introduces an area once per day. */
export function introduce(key: IntroKey) {
  const l = LINES.intro[key];
  audio.greetOnce(key, l.who, l.text);
}
