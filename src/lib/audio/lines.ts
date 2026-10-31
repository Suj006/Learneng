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
  correct: [
    { who: "speaky" as Speaker, text: "Fantastic! You got it!" },
    { who: "lexi" as Speaker, text: "Yes! Super cool!" },
    { who: "max" as Speaker, text: "Brilliant, Explorer!" },
    { who: "grammy" as Speaker, text: "Magical! That's exactly right!" },
  ],
  mistake: [
    { who: "grammy" as Speaker, text: "Oops! Let's fix that together. You're getting closer!" },
    { who: "lexi" as Speaker, text: "Nearly there! Every try makes your brain stronger." },
    { who: "speaky" as Speaker, text: "Good try! Let's have another go." },
  ],
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
    if (rightStreak % 3 === 0) { const l = LINES.correct[n++ % LINES.correct.length]; void audio.say(l.who, l.text, { server: true }); }
  } else {
    wrongStreak++; rightStreak = 0;
    if (wrongStreak === 1 || wrongStreak % 3 === 0) { const l = LINES.mistake[n++ % LINES.mistake.length]; void audio.say(l.who, l.text, { server: true }); }
  }
}

export type IntroKey = keyof typeof LINES.intro;
/** Introduces an area once per day. */
export function introduce(key: IntroKey) {
  const l = LINES.intro[key];
  audio.greetOnce(key, l.who, l.text);
}
