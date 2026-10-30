/** Seed catalogue for gamification (all editable later by admins). */

// Levels are generated in ./levels.ts (250+ levels, database-driven).

/** key → label, xp, coins, how many times per day it can pay out. */
export const XP_CONFIG = [
  { key: "daily_word_quest", label: "Daily Word Quest", xp: 100, coins: 20, daily_cap: 1 },
  { key: "writing_mission", label: "Writing Mission", xp: 150, coins: 30, daily_cap: 2 },
  { key: "grammar_challenge", label: "Grammar Challenge", xp: 75, coins: 15, daily_cap: 4 },
  { key: "speaking_challenge", label: "Speaking Challenge", xp: 75, coins: 15, daily_cap: 3 },
  { key: "reading_adventure", label: "Reading Adventure", xp: 80, coins: 15, daily_cap: 3 },
  { key: "word_game", label: "Word Game", xp: 40, coins: 8, daily_cap: 6 },
  { key: "story_builder", label: "Story Builder", xp: 120, coins: 25, daily_cap: 2 },
  { key: "daily_bonus", label: "Daily Surprise Bonus", xp: 50, coins: 10, daily_cap: 1 },
  { key: "mission_of_day", label: "English Mission of the Day", xp: 30, coins: 5, daily_cap: 1 },
  { key: "welcome", label: "Welcome to PING VIBE", xp: 50, coins: 20, daily_cap: 1 },
  { key: "achievement", label: "Achievement Unlocked", xp: 25, coins: 10, daily_cap: 20 },
  { key: "listening", label: "Listening Lab", xp: 40, coins: 8, daily_cap: 3 },
  { key: "revision", label: "Revision Boost", xp: 50, coins: 10, daily_cap: 3 },
  { key: "weekly_quest", label: "Weekly Vocabulary Quest", xp: 150, coins: 40, daily_cap: 1 },
  { key: "monthly_championship", label: "Monthly English Championship", xp: 300, coins: 80, daily_cap: 1 },
  { key: "boss_battle", label: "Mixed-Skill Boss Battle", xp: 120, coins: 30, daily_cap: 2 },
  { key: "special_challenge", label: "Special Challenge", xp: 100, coins: 25, daily_cap: 2 },
];

export const ACHIEVEMENTS = [
  { slug: "first-10-words", title: "First 10 Words", description: "Discover your first 10 words.", emoji: "🌱" },
  { slug: "100-words-discovered", title: "100 Words Discovered", description: "Discover 100 words.", emoji: "🗝️" },
  { slug: "100-words-mastered", title: "100 Words Mastered", description: "Master 100 words.", emoji: "👑" },
  { slug: "grammar-genius", title: "Grammar Genius", description: "Score 80%+ in 5 grammar missions.", emoji: "🧙" },
  { slug: "writing-star", title: "Writing Star", description: "Score 80+ on a writing mission.", emoji: "✍️" },
  { slug: "speaking-champion", title: "Speaking Champion", description: "Complete 10 speaking challenges.", emoji: "🎤" },
  { slug: "seven-day-streak", title: "Seven-Day Streak", description: "Learn 7 days in a row.", emoji: "🔥" },
  { slug: "story-creator", title: "Story Creator", description: "Create 3 stories in Story Builder.", emoji: "📜" },
  { slug: "perfect-quiz", title: "Perfect Quiz", description: "Get every answer right in a Daily Word Quest.", emoji: "💯" },
  { slug: "monthly-champion", title: "Monthly Champion", description: "Learn on 20 days in one month.", emoji: "🏆" },
  { slug: "bookworm", title: "Bookworm", description: "Finish 3 Reading Adventures.", emoji: "🐛" },
  { slug: "explorer-30", title: "30-Day English Explorer", description: "Complete 30 Daily Word Quests.", emoji: "🎓" },
];

// Shop items (avatar parts, buddies, themes, decorations…) live in ./game.ts.

export const GAMES = [
  { slug: "word-match", title: "Word Match", tagline: "Pair words with their meanings", emoji: "🃏", min_words: 4 },
  { slug: "spell-master", title: "Spell Master", tagline: "Hear it. Spell it. Master it.", emoji: "🔤", min_words: 3 },
  { slug: "missing-word", title: "Missing Word", tagline: "Fill the gap in the sentence", emoji: "🧩", min_words: 4 },
  { slug: "picture-vocabulary", title: "Picture Vocabulary", tagline: "Which word matches the picture?", emoji: "🖼️", min_words: 4 },
  { slug: "word-race", title: "Word Race", tagline: "Beat the clock — 60 seconds!", emoji: "🏎️", min_words: 4 },
  { slug: "sentence-builder", title: "Sentence Builder", tagline: "Put the words in the right order", emoji: "🧱", min_words: 3 },
  { slug: "word-detective", title: "Word Detective", tagline: "Crack the mystery word from clues", emoji: "🕵️", min_words: 3 },
  { slug: "word-hunter", title: "Word Hunter", tagline: "Find hidden words in the grid", emoji: "🔎", min_words: 4 },
  { slug: "treasure-hunt", title: "Word Treasure Hunt", tagline: "Answer to open treasure chests", emoji: "💎", min_words: 4 },
  { slug: "boss-battle", title: "Vocabulary Boss Battle", tagline: "Defeat the Gloom Giant with word power", emoji: "👾", min_words: 6 },
];

export const WRITING_TOPICS = [
  // Band 1 (Pre-KG–UKG): sentence-level, picture-led
  { slug: "my-family", category: "family", title: "My Family", band: 1, mode: "sentence", min_words: 5, emoji: "👨‍👩‍👧", prompt: "Who is in your family? Write one or two sentences. Example: 'I love my mom.'", suggested_words: ["mom", "dad", "love", "happy", "sister", "brother"] },
  { slug: "my-favourite-toy", category: "everyday", title: "My Favourite Toy", band: 1, mode: "sentence", min_words: 5, emoji: "🧸", prompt: "What is your favourite toy? What colour is it? Write a short sentence.", suggested_words: ["ball", "big", "small", "red", "play", "happy"] },
  { slug: "my-pet", category: "animals", title: "My Pet", band: 1, mode: "sentence", min_words: 5, emoji: "🐶", prompt: "Do you have a pet, or a pet you wish for? Tell us about it in a sentence.", suggested_words: ["cat", "dog", "fish", "small", "run", "love"] },
  { slug: "my-favourite-colour", category: "imagination", title: "My Favourite Colour", band: 1, mode: "sentence", min_words: 5, emoji: "🎨", prompt: "Which colour do you like best? What things have that colour?", suggested_words: ["red", "blue", "sun", "flower", "like"] },
  // Band 2 (Grades 1–2)
  { slug: "my-best-friend", category: "school", title: "My Best Friend", band: 2, mode: "paragraph", min_words: 25, emoji: "🤝", prompt: "Write about your best friend. What do you like to do together? Why are they special?", suggested_words: ["friend", "share", "giggle", "kind", "helpful", "play"] },
  { slug: "visit-to-the-zoo", category: "animals", title: "A Visit to the Zoo", band: 2, mode: "paragraph", min_words: 25, emoji: "🦒", prompt: "Imagine a day at the zoo. Which animals did you see? What were they doing?", suggested_words: ["enormous", "tiny", "quick", "curious", "explore"] },
  { slug: "my-favourite-cartoon", category: "imagination", title: "My Favourite Cartoon", band: 2, mode: "paragraph", min_words: 25, emoji: "📺", prompt: "Tell us about a cartoon you love. Who is your favourite character, and why?", suggested_words: ["funny", "brave", "giggle", "friend", "adventure"] },
  { slug: "a-rainy-day", category: "everyday", title: "A Rainy Day", band: 2, mode: "paragraph", min_words: 25, emoji: "☔", prompt: "What do you see, hear and do on a rainy day?", suggested_words: ["puddle", "rainbow", "cozy", "splash", "umbrella"] },
  // Band 3 (Grades 3–4)
  { slug: "my-dream-holiday", category: "travel", title: "My Dream Holiday", band: 3, mode: "paragraph", min_words: 60, emoji: "🏝️", prompt: "Where would you go for your dream holiday? What would you see and do there? Who would go with you?", suggested_words: ["adventure", "magnificent", "explore", "delighted", "journey"] },
  { slug: "if-i-could-fly", category: "imagination", title: "If I Could Fly", band: 3, mode: "paragraph", min_words: 60, emoji: "🦅", prompt: "Imagine you woke up one morning and could fly! Where would you go first? What would you see?", suggested_words: ["swift", "imagine", "astonished", "enormous", "glimmer"] },
  { slug: "adventure-in-a-forest", category: "fantasy", title: "An Adventure in a Forest", band: 3, mode: "paragraph", min_words: 60, emoji: "🌲", prompt: "Write a story about an adventure in a magical forest. What mysterious thing did you discover?", suggested_words: ["mysterious", "courage", "ancient", "wander", "rescue"] },
  { slug: "my-favourite-festival", category: "festivals", title: "My Favourite Festival", band: 3, mode: "paragraph", min_words: 60, emoji: "🪔", prompt: "Describe your favourite festival. How do you celebrate it with family and friends?", suggested_words: ["festival", "sparkle", "delighted", "generous", "harvest"] },
  // Band 4 (Grades 5–7)
  { slug: "world-without-mobile-phones", category: "science", title: "The World Without Mobile Phones", band: 4, mode: "essay", min_words: 120, emoji: "📵", prompt: "Imagine a world without mobile phones. What would be better? What would be harder? Give your opinion with reasons.", suggested_words: ["consequence", "inevitable", "pragmatic", "collaborate", "empathy"] },
  { slug: "my-dream-invention", category: "inventions", title: "My Dream Invention", band: 4, mode: "essay", min_words: 120, emoji: "💡", prompt: "Describe an invention you would like to create. What problem does it solve and how does it work?", suggested_words: ["innovative", "sustainable", "hypothesis", "versatile", "meticulous"] },
  { slug: "why-protect-nature", category: "environment", title: "Why Should We Protect Nature?", band: 4, mode: "essay", min_words: 120, emoji: "🌍", prompt: "Write an essay explaining why protecting nature matters. Include examples and what children can do.", suggested_words: ["sustainable", "abundant", "consequence", "resilient", "frugal"] },
  { slug: "homework-every-day", category: "school", title: "Should Children Have Homework Every Day?", band: 4, mode: "essay", min_words: 120, emoji: "📝", prompt: "Do you think children should have homework every day? Give arguments for and against, then your conclusion.", suggested_words: ["diligent", "perseverance", "pragmatic", "reluctant", "articulate"] },
];

/** Story Builder ingredients (Section 14). */
export const STORY_BUILDER = {
  characters: ["a little robot", "a brave princess", "a talking parrot", "a shy dragon", "a curious astronaut", "a clever monkey", "a lost penguin", "a young inventor", "a friendly ghost", "a cricket-playing elephant"],
  locations: ["an enchanted forest", "a floating island", "a secret underwater city", "the top of a snowy mountain", "a busy Mumbai market", "a magical library", "a spaceship to Mars", "an ancient temple", "a candy-coloured castle", "a desert oasis"],
  objects: ["a magic key", "a glowing map", "a singing shell", "a tiny umbrella", "a golden feather", "a broken compass", "a talking book", "a box of stars", "a rainbow crayon", "a mysterious egg"],
  situations: ["something important has gone missing", "a storm is coming", "a friend needs rescuing", "a door appears that wasn't there before", "everyone has forgotten how to laugh", "the moon has fallen asleep", "a race must be won before sunset", "a riddle must be solved"],
};

/** English Mission of the Day — practical activities away from the screen. */
export const DAILY_MISSIONS: Record<number, string[]> = {
  1: ["Say 'Good morning!' to three people today.", "Name five things you can see that are red.", "Say 'please' and 'thank you' at dinner.", "Tell someone about your favourite toy in English.", "Count ten things in your room in English."],
  2: ["Describe your breakfast in two English sentences.", "Ask a family member 'How was your day?'", "Find three things that are 'heavy' and three that are 'light'.", "Read a sign or label aloud in English.", "Use one new word from today in a sentence at home."],
  3: ["Tell a family member a 5-sentence story about your day.", "Write a short thank-you note to someone.", "Find three adjectives on a cereal box or newspaper.", "Use today's hardest word while talking at dinner.", "Describe the weather today using two new words."],
  4: ["Explain a news headline to a family member in your own words.", "Write a 3-line review of a book, film or game.", "Have a 2-minute English-only conversation with someone.", "Find a word you don't know in a newspaper and look it up.", "Write a persuasive note: why should your family try your favourite food?"],
};

export const SPEAKING_SCENARIOS = [
  { slug: "at-school", title: "At School", emoji: "🏫", lines: ["Good morning, teacher!", "May I come in, please?", "Can you help me with this question?", "Thank you for explaining."] },
  { slug: "new-friend", title: "Meeting a New Friend", emoji: "👋", lines: ["Hi! My name is Explorer.", "What is your name?", "Do you want to play with me?", "It was nice to meet you!"] },
  { slug: "restaurant", title: "At a Restaurant", emoji: "🍽️", lines: ["Can I see the menu, please?", "I would like a masala dosa.", "Could I have some water, please?", "The food was delicious. Thank you!"] },
  { slug: "supermarket", title: "At the Supermarket", emoji: "🛒", lines: ["Excuse me, where are the apples?", "How much does this cost?", "I need two packets of milk.", "Can I pay by card, please?"] },
  { slug: "directions", title: "Asking for Directions", emoji: "🧭", lines: ["Excuse me, can you help me?", "Where is the nearest library?", "Should I turn left or right?", "Thank you so much for your help!"] },
  { slug: "hobbies", title: "Talking About Hobbies", emoji: "🎨", lines: ["In my free time, I like to draw.", "I also enjoy playing cricket.", "What do you like to do on weekends?", "Maybe we can play together sometime!"] },
];
