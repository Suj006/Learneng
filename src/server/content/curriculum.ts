/**
 * 365-day curriculum framework for every grade.
 *
 * Each plan day is a structured blend of activity types following a weekly
 * rotation; difficulty rises steadily through the year (1 → 10). Plans point at
 * content POOLS (vocabulary band, grammar topic, writing category, story, game),
 * which the adaptive engine fills per child with unseen content at run time.
 */
export const GRADE_CONFIG = [
  { grade: "PRE_KG", label: "Pre-KG", band: 1, new_words_per_day: 5, daily_missions: 2, sort_order: 0 },
  { grade: "LKG", label: "LKG", band: 1, new_words_per_day: 5, daily_missions: 2, sort_order: 1 },
  { grade: "UKG", label: "UKG", band: 1, new_words_per_day: 5, daily_missions: 2, sort_order: 2 },
  { grade: "G1", label: "Grade 1", band: 2, new_words_per_day: 5, daily_missions: 2, sort_order: 3 },
  { grade: "G2", label: "Grade 2", band: 2, new_words_per_day: 5, daily_missions: 3, sort_order: 4 },
  { grade: "G3", label: "Grade 3", band: 3, new_words_per_day: 5, daily_missions: 3, sort_order: 5 },
  { grade: "G4", label: "Grade 4", band: 3, new_words_per_day: 5, daily_missions: 4, sort_order: 6 },
  { grade: "G5", label: "Grade 5", band: 4, new_words_per_day: 5, daily_missions: 4, sort_order: 7 },
  { grade: "G6", label: "Grade 6", band: 4, new_words_per_day: 5, daily_missions: 5, sort_order: 8 },
  { grade: "G7", label: "Grade 7", band: 4, new_words_per_day: 5, daily_missions: 5, sort_order: 9 },
];

/** 18 writing/theme categories (rotated weekly; the topic engine is not limited to these). */
export const THEMES = [
  { key: "family", title: "Family & Relationships", emoji: "👨‍👩‍👧" },
  { key: "school", title: "Friends & School", emoji: "🏫" },
  { key: "animals", title: "Animals & Nature", emoji: "🦁" },
  { key: "science", title: "Science & Technology", emoji: "🔬" },
  { key: "space", title: "Space & Planets", emoji: "🪐" },
  { key: "travel", title: "Travel & Adventure", emoji: "🧳" },
  { key: "fantasy", title: "Fantasy & Magical Worlds", emoji: "🧚" },
  { key: "sports", title: "Sports & Hobbies", emoji: "🏏" },
  { key: "festivals", title: "Festivals & Celebrations", emoji: "🪔" },
  { key: "environment", title: "Environment & Sustainability", emoji: "🌍" },
  { key: "everyday", title: "Everyday Experiences", emoji: "🏠" },
  { key: "imagination", title: "Imagination & Creativity", emoji: "💭" },
  { key: "problem", title: "Problem-Solving", emoji: "🧩" },
  { key: "values", title: "Social Values", emoji: "🤝" },
  { key: "inventions", title: "Future Inventions", emoji: "🚀" },
  { key: "mystery", title: "Mystery & Detectives", emoji: "🕵️" },
  { key: "history", title: "Historical Adventures", emoji: "🏛️" },
  { key: "realworld", title: "Real-World Situations", emoji: "🛒" },
];

/** Grammar sequence per band (later bands revisit earlier topics at higher difficulty). */
export const GRAMMAR_SEQUENCE: Record<number, string[]> = {
  1: ["nouns", "verbs", "adjectives", "pronouns"],
  2: ["nouns", "pronouns", "verbs", "adjectives", "articles", "prepositions", "punctuation", "sentence-construction"],
  3: ["articles", "prepositions", "punctuation", "sentence-construction", "adverbs", "conjunctions", "tenses", "subject-verb-agreement", "adjectives", "pronouns"],
  4: ["tenses", "subject-verb-agreement", "conjunctions", "adverbs", "active-passive", "direct-indirect", "punctuation", "sentence-construction", "prepositions", "articles"],
};

export const GAME_ROTATION = ["word-match", "picture-vocabulary", "missing-word", "word-race", "spell-master", "sentence-builder", "word-detective", "word-hunter", "treasure-hunt", "boss-battle"];

export type PlanActivity =
  | { type: "vocabulary"; count: number }
  | { type: "listening" } | { type: "spelling" } | { type: "sentence" } | { type: "revision" }
  | { type: "grammar"; topic: string }
  | { type: "writing"; category: string }
  | { type: "reading" } | { type: "speaking" } | { type: "story" }
  | { type: "game"; slug: string }
  | { type: "weekly_assessment" } | { type: "boss_battle" } | { type: "monthly_championship" } | { type: "special"; title: string };

export interface PlanSeed { grade: string; day_number: number; week: number; month: number; theme: string; difficulty: number; focus: string; activities: PlanActivity[] }

export function buildPlans(grades = GRADE_CONFIG, days = 365): PlanSeed[] {
  const out: PlanSeed[] = [];
  for (const g of grades) {
    const seq = GRAMMAR_SEQUENCE[g.band];
    let grammarIdx = 0;
    for (let day = 1; day <= days; day++) {
      const week = Math.ceil(day / 7);
      const month = Math.ceil(day / 30.42);
      const dow = (day - 1) % 7; // 0..6 within the learning week
      const theme = THEMES[(week - 1) % THEMES.length];
      const difficulty = Math.min(10, 1 + Math.floor(((day - 1) / days) * 10));
      const game = GAME_ROTATION[(day - 1) % GAME_ROTATION.length];
      const nextGrammar = () => seq[grammarIdx++ % seq.length];
      const words = g.new_words_per_day;
      let activities: PlanActivity[];
      let focus: string;
      switch (dow) {
        case 0: focus = "Words & Listening"; activities = [{ type: "vocabulary", count: words }, { type: "listening" }, { type: "game", slug: game }, { type: "grammar", topic: nextGrammar() }]; break;
        case 1: focus = "Spelling & Reading"; activities = [{ type: "vocabulary", count: words }, { type: "spelling" }, { type: "sentence" }, { type: "reading" }]; break;
        case 2: focus = "Grammar & Speaking"; activities = [{ type: "vocabulary", count: words }, { type: "grammar", topic: nextGrammar() }, { type: "speaking" }, { type: "game", slug: game }]; break;
        case 3: focus = "Creative Writing"; activities = [{ type: "vocabulary", count: words }, { type: "writing", category: theme.key }, { type: "listening" }]; break;
        case 4: focus = "Stories & Play"; activities = [{ type: "vocabulary", count: words }, { type: "reading" }, { type: "story" }, { type: "game", slug: game }]; break;
        case 5: focus = "Revision & Speaking"; activities = [{ type: "vocabulary", count: Math.ceil(words / 2) }, { type: "revision" }, { type: "speaking" }, { type: "special", title: "Weekend Word Tournament" }]; break;
        default: focus = "Weekly Assessment"; activities = [{ type: "weekly_assessment" }, { type: "revision" }, { type: "boss_battle" }];
      }
      if (day % 30 === 0) activities.push({ type: "monthly_championship" });
      out.push({ grade: g.grade, day_number: day, week, month, theme: theme.key, difficulty, focus, activities });
    }
  }
  return out;
}

export const KINGDOMS = [
  { slug: "vocabulary-forest", title: "Vocabulary Forest", emoji: "🌲", art: "forest", description: "Discover 5 new words every day with LEXI.", href: "/world/quest", unlock_level: 1 },
  { slug: "word-wizards-arena", title: "Word Wizards Arena", emoji: "🏟️", art: "arena", description: "Play 10 word games with words you know.", href: "/world/arcade", unlock_level: 1 },
  { slug: "storytelling-castle", title: "Storytelling Castle", emoji: "🏰", art: "castle", description: "Write, imagine and build stories with STORY.", href: "/world/writing", unlock_level: 1 },
  { slug: "reading-ocean", title: "Reading Ocean", emoji: "🌊", art: "ocean", description: "Dive into illustrated stories and quizzes.", href: "/world/reading", unlock_level: 1 },
  { slug: "grammar-galaxy", title: "Grammar Galaxy", emoji: "🪐", art: "galaxy", description: "Grammar missions with GRAMMY the wizard.", href: "/world/grammar", unlock_level: 3 },
  { slug: "speaking-mountains", title: "Speaking Mountains", emoji: "🏔️", art: "mountains", description: "Speak, listen and shine with SPEAKY.", href: "/world/speaking", unlock_level: 5 },
  { slug: "phonics-valley", title: "Phonics & Sound Valley", emoji: "🎶", art: "valley", description: "Letter sounds, blending, rhymes and reading with LEXI.", href: "/world/phonics", unlock_level: 1 },
];

/** Recurring events by calendar date (lunar festivals like Diwali/Holi/Eid are added yearly by admins). */
export const EVENTS = [
  { slug: "new-year", title: "New Year Word Wishes", emoji: "🎆", kind: "festival", month: 1, day: 1, window_days: 3, description: "Start the year with wish words!", words: ["resolution", "celebrate", "hopeful"], writing_prompt: "Write three wishes for the new year and explain why each matters to you." },
  { slug: "makar-sankranti", title: "Kite Festival Challenge", emoji: "🪁", kind: "festival", month: 1, day: 14, window_days: 3, description: "Pongal & Makar Sankranti — harvest and kite words!", words: ["harvest", "soar", "thankful"], writing_prompt: "Describe a sky full of kites. What colours and sounds do you notice?" },
  { slug: "republic-day", title: "Republic Day Mission", emoji: "🇮🇳", kind: "festival", month: 1, day: 26, window_days: 2, description: "Words about our country and our constitution.", words: ["unity", "proud", "citizen"], writing_prompt: "What makes you proud of India? Write about it." },
  { slug: "mother-language-day", title: "Language Day Explorer", emoji: "🗣️", kind: "special", month: 2, day: 21, window_days: 2, description: "Celebrate every language you speak!", words: ["language", "translate", "fluent"], writing_prompt: "Which languages do you know? Teach us a word from one of them." },
  { slug: "earth-day", title: "Earth Day Quest", emoji: "🌍", kind: "seasonal", month: 4, day: 22, window_days: 3, description: "Protect our planet with words.", words: ["recycle", "protect", "sustainable"], writing_prompt: "Write a letter to Planet Earth with three promises." },
  { slug: "world-book-day", title: "World Book Day", emoji: "📚", kind: "special", month: 4, day: 23, window_days: 3, description: "A celebration of stories and readers.", words: ["author", "chapter", "imagine"], writing_prompt: "Describe your favourite book character as if they walked into your room." },
  { slug: "summer-adventure", title: "Summer Holiday Adventure", emoji: "🏖️", kind: "seasonal", month: 5, day: 15, window_days: 14, description: "Holiday words, beach stories and mango challenges!", words: ["vacation", "sunscreen", "explore"], writing_prompt: "Plan your perfect summer holiday day from morning to night." },
  { slug: "environment-day", title: "Environment Day", emoji: "🌱", kind: "seasonal", month: 6, day: 5, window_days: 3, description: "Green words for a green planet.", words: ["environment", "pollution", "conserve"], writing_prompt: "How can your school become greener? Share three ideas." },
  { slug: "monsoon-magic", title: "Monsoon Magic", emoji: "🌧️", kind: "seasonal", month: 7, day: 1, window_days: 14, description: "Rainy-day words and puddle stories.", words: ["drizzle", "thunder", "puddle"], writing_prompt: "Describe the first monsoon rain using all five senses." },
  { slug: "independence-day", title: "Independence Day Challenge", emoji: "🇮🇳", kind: "festival", month: 8, day: 15, window_days: 2, description: "Freedom, courage and heroes.", words: ["freedom", "courage", "brave"], writing_prompt: "Write about a freedom fighter you admire and why." },
  { slug: "teachers-day", title: "Teachers' Day Thank-You", emoji: "🍎", kind: "festival", month: 9, day: 5, window_days: 2, description: "Words to thank our teachers.", words: ["grateful", "inspire", "mentor"], writing_prompt: "Write a thank-you note to a teacher who helped you." },
  { slug: "gandhi-jayanti", title: "Gandhi Jayanti — Words of Peace", emoji: "🕊️", kind: "festival", month: 10, day: 2, window_days: 2, description: "Peace, truth and kindness.", words: ["peace", "truth", "honest"], writing_prompt: "What does kindness look like at your school? Give examples." },
  { slug: "childrens-day", title: "Children's Day Carnival", emoji: "🎈", kind: "festival", month: 11, day: 14, window_days: 3, description: "A celebration of YOU, Explorer!", words: ["celebrate", "joyful", "dream"], writing_prompt: "If you were the Prime Minister for one day, what would you do for children?" },
  { slug: "winter-wonder", title: "Winter Wonderland", emoji: "❄️", kind: "seasonal", month: 12, day: 15, window_days: 10, description: "Cosy winter words and holiday stories.", words: ["chilly", "cosy", "frost"], writing_prompt: "Write a story about a magical winter night." },
  { slug: "christmas", title: "Christmas Story Sleigh", emoji: "🎄", kind: "festival", month: 12, day: 25, window_days: 3, description: "Stars, gifts and giving.", words: ["generous", "sparkle", "carol"], writing_prompt: "Describe the best gift you ever gave someone." },
];
