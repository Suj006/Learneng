/** Game-layer catalogue. Every unlock names a real learning metric (see server/metrics.ts). */

type R = { slug: string; title: string; category: string; emoji: string; cost_coins: number; cost_crystals?: number; rarity: string; description: string; min_level?: number; starter?: boolean; art?: string };

const starter = (slug: string, title: string, category: string, emoji: string, art?: string): R =>
  ({ slug, title, category, emoji, cost_coins: 0, rarity: "common", description: "Starter item.", starter: true, art });

export const SHOP_ITEMS: R[] = [
  // Buddies (companion characters)
  { ...starter("buddy-max", "MAX", "buddy", "🎧"), description: "Your first adventure buddy." },
  { slug: "buddy-lexi", title: "LEXI", category: "buddy", emoji: "🤖", cost_coins: 60, rarity: "rare", description: "The Vocabulary Explorer joins your side." },
  { slug: "buddy-speaky", title: "SPEAKY", category: "buddy", emoji: "📡", cost_coins: 120, rarity: "rare", description: "The Speaking Champion becomes your buddy.", min_level: 3 },
  { slug: "buddy-grammy", title: "GRAMMY", category: "buddy", emoji: "🦉", cost_coins: 180, rarity: "epic", description: "The Grammar Wizard follows you everywhere.", min_level: 5 },
  { slug: "buddy-story", title: "STORY", category: "buddy", emoji: "🦊", cost_coins: 240, rarity: "epic", description: "The Storytelling Explorer joins the quest.", min_level: 8 },
  // Hair (inclusive starter set)
  starter("hair-short", "Short Hair", "hair", "💇", "short"), starter("hair-long", "Long Hair", "hair", "💇‍♀️", "long"),
  starter("hair-curly", "Curly Hair", "hair", "🌀", "curly"), starter("hair-braids", "Braids", "hair", "🎀", "braids"),
  starter("hair-bun", "Top Bun", "hair", "🍡", "bun"), starter("hair-afro", "Afro", "hair", "☁️", "afro"),
  starter("hair-patka", "Patka", "hair", "🟠", "patka"), starter("hair-hijab", "Hijab", "hair", "🧕", "hijab"),
  { slug: "hair-ponytail", title: "Swishy Ponytail", category: "hair", emoji: "🎐", cost_coins: 30, rarity: "common", description: "Bounces when you celebrate!", art: "ponytail" },
  { slug: "hair-spiky", title: "Spiky Style", category: "hair", emoji: "⚡", cost_coins: 60, rarity: "rare", description: "Electric adventurer look.", art: "spiky" },
  { slug: "hair-star", title: "Starlight Locks", category: "hair", emoji: "🌟", cost_coins: 0, cost_crystals: 6, rarity: "epic", description: "Hair that shimmers like the night sky.", art: "long", min_level: 10 },
  // Outfits
  starter("outfit-hoodie-purple", "Vibe Hoodie", "outfit", "🟣", "hoodie:#7047FF"), starter("outfit-tshirt-aqua", "Aqua Tee", "outfit", "👕", "tee:#39D5E8"),
  starter("outfit-kurta", "Festive Kurta", "outfit", "🧥", "kurta:#FF6B6B"), starter("outfit-dress-coral", "Coral Dress", "outfit", "👗", "dress:#FF7AC6"),
  { slug: "outfit-explorer", title: "Explorer Vest", category: "outfit", emoji: "🦺", cost_coins: 40, rarity: "common", description: "Pockets for every new word.", art: "vest:#C08A3E" },
  { slug: "outfit-cricket", title: "Cricket Whites", category: "outfit", emoji: "🏏", cost_coins: 90, rarity: "rare", description: "Ready for a word century!", art: "tee:#F4F4F4" },
  { slug: "outfit-wizard", title: "Wizard Robe", category: "outfit", emoji: "🧙", cost_coins: 120, rarity: "rare", description: "Grammar magic, activated.", art: "robe:#4F2BD9", min_level: 4 },
  { slug: "outfit-space", title: "Space Suit", category: "outfit", emoji: "👩‍🚀", cost_coins: 200, rarity: "epic", description: "For missions beyond the moon.", art: "suit:#E8ECF5", min_level: 8 },
  { slug: "outfit-hero", title: "Word Hero Cape Suit", category: "outfit", emoji: "🦸", cost_coins: 0, cost_crystals: 10, rarity: "legendary", description: "For true word champions.", art: "hero:#FF6B6B", min_level: 15 },
  // Shoes
  starter("shoes-sneakers", "Sneakers", "shoes", "👟", "#FFFFFF"), starter("shoes-sandals", "Sandals", "shoes", "🩴", "#C08A3E"),
  { slug: "shoes-boots", title: "Adventure Boots", category: "shoes", emoji: "🥾", cost_coins: 30, rarity: "common", description: "Built for long journeys.", art: "#6B4226" },
  { slug: "shoes-rocket", title: "Rocket Shoes", category: "shoes", emoji: "🚀", cost_coins: 140, rarity: "epic", description: "Whoosh between kingdoms.", art: "#FFD65A", min_level: 6 },
  // Backgrounds
  starter("bg-sky", "Sunny Sky", "background", "🌤️", "linear-gradient(180deg,#8EE3F5,#EAE4FF)"),
  { slug: "bg-forest", title: "Vocabulary Forest", category: "background", emoji: "🌲", cost_coins: 50, rarity: "common", description: "Glowing green trees.", art: "linear-gradient(180deg,#0F5132,#5BE3A8)" },
  { slug: "bg-ocean", title: "Reading Ocean", category: "background", emoji: "🌊", cost_coins: 50, rarity: "common", description: "Calm blue waves.", art: "linear-gradient(180deg,#0B3D91,#39D5E8)" },
  { slug: "bg-galaxy", title: "Grammar Galaxy", category: "background", emoji: "🪐", cost_coins: 100, rarity: "rare", description: "Stars and planets.", art: "linear-gradient(180deg,#17132C,#7047FF)" },
  { slug: "bg-castle", title: "Story Castle", category: "background", emoji: "🏰", cost_coins: 100, rarity: "rare", description: "Towers of tales.", art: "linear-gradient(180deg,#FF9A8B,#FFD65A)" },
  { slug: "bg-aurora", title: "Aurora Lights", category: "background", emoji: "🌌", cost_coins: 0, cost_crystals: 12, rarity: "legendary", description: "Dancing northern lights.", art: "linear-gradient(160deg,#0B1E3F,#39D5E8,#5BE3A8,#7047FF)", min_level: 20 },
  // Expressions
  starter("expr-smile", "Big Smile", "expression", "😊", "smile"), starter("expr-grin", "Happy Grin", "expression", "😁", "grin"),
  { slug: "expr-wink", title: "Wink", category: "expression", emoji: "😉", cost_coins: 20, rarity: "common", description: "A cheeky wink.", art: "wink" },
  { slug: "expr-cool", title: "Cool Calm", category: "expression", emoji: "😎", cost_coins: 60, rarity: "rare", description: "Too cool for mistakes.", art: "cool" },
  { slug: "expr-star", title: "Star Eyes", category: "expression", emoji: "🤩", cost_coins: 0, cost_crystals: 5, rarity: "epic", description: "Amazed by every new word!", art: "star" },
  // Accessories
  { slug: "acc-party-hat", title: "Party Hat", category: "accessory", emoji: "🥳", cost_coins: 40, rarity: "common", description: "Every day is a celebration." },
  { slug: "acc-sunglasses", title: "Cool Shades", category: "accessory", emoji: "🕶️", cost_coins: 50, rarity: "common", description: "Shiny and sharp." },
  { slug: "acc-crown", title: "Golden Crown", category: "accessory", emoji: "👑", cost_coins: 80, rarity: "rare", description: "For true word royalty." },
  { slug: "acc-wizard-hat", title: "Wizard Hat", category: "accessory", emoji: "🧙", cost_coins: 100, rarity: "rare", description: "Cast word spells in style.", min_level: 3 },
  { slug: "acc-headphones", title: "Cat-Ear Headphones", category: "accessory", emoji: "🎧", cost_coins: 70, rarity: "rare", description: "Just like MAX!" },
  // Magic objects
  { slug: "obj-wand", title: "Word Wand", category: "magic_object", emoji: "🪄", cost_coins: 60, rarity: "common", description: "Points at words to make them glow." },
  { slug: "obj-book", title: "Glowing Spellbook", category: "magic_object", emoji: "📖", cost_coins: 90, rarity: "rare", description: "Holds every word you master." },
  { slug: "obj-orb", title: "Crystal Orb", category: "magic_object", emoji: "🔮", cost_coins: 0, cost_crystals: 4, rarity: "epic", description: "Sees tomorrow's adventure." },
  // Dashboard themes
  { ...starter("theme-midnight", "Midnight Galaxy", "theme", "🌌"), description: "The classic PING VIBE sky." },
  { slug: "theme-forest", title: "Enchanted Forest", category: "theme", emoji: "🌲", cost_coins: 90, rarity: "common", description: "Glowing green magic." },
  { slug: "theme-ocean", title: "Reading Ocean", category: "theme", emoji: "🌊", cost_coins: 90, rarity: "common", description: "Deep blue calm.", min_level: 2 },
  { slug: "theme-sunset", title: "Sunset Islands", category: "theme", emoji: "🌅", cost_coins: 110, rarity: "rare", description: "Warm floating-island glow.", min_level: 3 },
  // Kingdom decorations
  { slug: "deco-lanterns", title: "Floating Lanterns", category: "decoration", emoji: "🏮", cost_coins: 60, rarity: "common", description: "Light up your world." },
  { slug: "deco-fountain", title: "Word Fountain", category: "decoration", emoji: "⛲", cost_coins: 120, rarity: "rare", description: "Sprays sparkling letters." },
  { slug: "deco-balloon", title: "Sky Balloon", category: "decoration", emoji: "🎈", cost_coins: 80, rarity: "common", description: "Floats above your treehouse." },
  { slug: "deco-statue", title: "Champion Statue", category: "decoration", emoji: "🗽", cost_coins: 0, cost_crystals: 8, rarity: "epic", description: "Celebrates your hard work." },
  // Celebration animations
  starter("anim-confetti", "Confetti Burst", "animation", "🎊", "confetti"),
  { slug: "anim-stars", title: "Shooting Stars", category: "animation", emoji: "🌠", cost_coins: 60, rarity: "rare", description: "Stars streak across the screen.", art: "stars" },
  { slug: "anim-hearts", title: "Heart Shower", category: "animation", emoji: "💖", cost_coins: 40, rarity: "common", description: "Hearts float up when you win.", art: "hearts" },
  { slug: "anim-fireworks", title: "Word Fireworks", category: "animation", emoji: "🎆", cost_coins: 0, cost_crystals: 6, rarity: "epic", description: "Fireworks spell 'WOW!'", art: "fireworks" },
  // Story collections
  { slug: "stories-space", title: "Space Tales Collection", category: "stories", emoji: "🪐", cost_coins: 120, rarity: "rare", description: "Unlocks the bonus story 'The Moon Library'.", min_level: 2 },
];

export const PETS = [
  { slug: "hoot-owl", name: "Hoot", emoji: "🦉", personality: "Wise and sleepy, loves long words.", hint_style: "Hoot hoot! Try sounding it out slowly.", unlock_metric: "words_discovered", unlock_target: 5, unlock_label: "Discover 5 words", rarity: "common" },
  { slug: "mango-panda", name: "Mango", emoji: "🐼", personality: "Cuddly reading buddy who adores stories.", hint_style: "Mango says: read the sentence again — the clue is hiding there!", unlock_metric: "quests_completed", unlock_target: 3, unlock_label: "Complete 3 Daily Word Quests", rarity: "common" },
  { slug: "bolt-robot", name: "Bolt", emoji: "🤖", personality: "Beeping game-lover who counts everything.", hint_style: "Beep! Check the first letter, then the last!", unlock_metric: "games_played", unlock_target: 10, unlock_label: "Play 10 word games", rarity: "common" },
  { slug: "zippy-fox", name: "Zippy", emoji: "🦊", personality: "Clever storyteller with a fluffy tail.", hint_style: "Zippy whispers: who, where, what happened?", unlock_metric: "writing_done", unlock_target: 3, unlock_label: "Finish 3 writing missions", rarity: "rare" },
  { slug: "melody-bird", name: "Melody", emoji: "🐦", personality: "A magical bird that sings every sound.", hint_style: "Tweet! Clap the syllables with me!", unlock_metric: "speaking_done", unlock_target: 5, unlock_label: "Complete 5 speaking challenges", rarity: "rare" },
  { slug: "luna-unicorn", name: "Luna", emoji: "🦄", personality: "Dreamy and kind, sparkles when you read.", hint_style: "Luna glows: picture the story in your mind!", unlock_metric: "reading_done", unlock_target: 5, unlock_label: "Finish 5 Reading Adventures", rarity: "epic" },
  { slug: "ember-dragon", name: "Ember", emoji: "🐉", personality: "A brave little dragon who guards mastered words.", hint_style: "Ember puffs: you've seen this word before — remember it!", unlock_metric: "words_mastered", unlock_target: 50, unlock_label: "Master 50 words", rarity: "epic" },
  { slug: "nova-phoenix", name: "Nova", emoji: "🔥", personality: "A legendary phoenix who never gives up.", hint_style: "Nova says: mistakes help you rise higher!", unlock_metric: "bosses_defeated", unlock_target: 3, unlock_label: "Defeat 3 boss battles", rarity: "legendary" },
  { slug: "comet-dolphin", name: "Comet", emoji: "🐬", personality: "Playful explorer of every kingdom.", hint_style: "Comet splashes: try the opposite word!", unlock_metric: "level", unlock_target: 50, unlock_label: "Reach Level 50", rarity: "legendary" },
];
export const PET_STAGES = [{ min: 0, name: "Baby" }, { min: 20, name: "Young" }, { min: 60, name: "Grown" }, { min: 150, name: "Legendary" }];

export const CARDS = [
  { slug: "char-lexi", kind: "character", title: "LEXI — Vocabulary Explorer", emoji: "🤖", rarity: "rare", fact: "LEXI collects words from every kingdom in a glowing word-pouch.", lesson: "New words stick when you use them in a sentence today." },
  { slug: "char-grammy", kind: "character", title: "GRAMMY — Grammar Wizard", emoji: "🦉", rarity: "rare", fact: "GRAMMY's wand writes capital letters in the sky.", lesson: "Every sentence needs a subject and a verb." },
  { slug: "char-speaky", kind: "character", title: "SPEAKY — Speaking Champion", emoji: "📡", rarity: "rare", fact: "SPEAKY's antennae pick up every sound you make.", lesson: "Speak slowly and clearly — confidence grows with practice." },
  { slug: "char-story", kind: "character", title: "STORY — Storytelling Explorer", emoji: "🦊", rarity: "rare", fact: "STORY's tail draws maps of imaginary worlds.", lesson: "Good stories have a beginning, a middle and an end." },
  { slug: "char-max", kind: "character", title: "MAX — Adventure Companion", emoji: "🎧", rarity: "rare", fact: "MAX's headphones play the music of every kingdom.", lesson: "A little learning every day builds a big adventure." },
  { slug: "creature-gloomgrab", kind: "creature", title: "Gloomgrab the Word Thief", emoji: "👾", rarity: "epic", fact: "Gloomgrab steals words nobody uses.", lesson: "Use your new words often so they can't be stolen!" },
  { slug: "creature-muddle", kind: "creature", title: "Captain Muddle", emoji: "🛸", rarity: "epic", fact: "Captain Muddle scrambles word order across the galaxy.", lesson: "English sentences usually go Subject → Verb → Object." },
  { slug: "creature-plot-twister", kind: "creature", title: "The Plot Twister", emoji: "🌪️", rarity: "epic", fact: "The Plot Twister mixes up the order of stories.", lesson: "Words like first, next and finally keep a story in order." },
  { slug: "creature-echo-yeti", kind: "creature", title: "Echo the Mountain Yeti", emoji: "🏔️", rarity: "epic", fact: "Echo repeats every sound — but only if it's said clearly.", lesson: "Break long words into syllables to say them clearly." },
  { slug: "creature-riddle-kraken", kind: "creature", title: "The Riddle Kraken", emoji: "🐙", rarity: "epic", fact: "The Kraken hides answers deep inside stories.", lesson: "Look back at the text to find evidence for your answer." },
  { slug: "creature-gloom-giant", kind: "creature", title: "The Gloom Giant", emoji: "🗿", rarity: "legendary", fact: "The Gloom Giant shrinks when children learn together.", lesson: "Mixing skills — words, grammar and reading — makes you strongest." },
];

const M = (slug: string, scope: string, character: string, title: string, description: string, metric: string, target: number, href: string, xp: number, coins: number, crystals = 0, band_min = 1, band_max = 4) =>
  ({ slug, scope, character, title, description, metric, target, href, xp, coins, crystals, band_min, band_max });

export const MISSIONS = [
  M("d-discover", "daily", "lexi", "Discover new words", "Discover 5 new words in today's Daily Word Quest.", "words_discovered", 5, "/world/quest", 30, 10),
  M("d-master-3", "daily", "lexi", "Master 3 words", "Answer revision questions until 3 words become MASTERED.", "words_mastered", 3, "/world/revision", 40, 10, 0, 2),
  M("d-revise", "daily", "lexi", "Revision Boost", "Finish one Revision Boost.", "revision_done", 1, "/world/revision", 20, 5),
  M("d-grammar", "daily", "grammy", "Grammar spark", "Complete one grammar challenge.", "grammar_missions", 1, "/world/grammar", 25, 8, 0, 2),
  M("d-sentences", "daily", "story", "Five fine sentences", "Write five meaningful sentences in any writing mission.", "writing_sentences", 5, "/world/writing", 30, 10, 0, 2),
  M("d-sentence-1", "daily", "story", "My first sentence", "Write one sentence in the Writing Studio.", "writing_sentences", 1, "/world/writing", 20, 8, 0, 1, 1),
  M("d-reading", "daily", "max", "Story time", "Complete a Reading Adventure.", "reading_done", 1, "/world/reading", 25, 8),
  M("d-speaking", "daily", "speaky", "Say it loud", "Complete one speaking challenge.", "speaking_done", 1, "/world/speaking", 25, 8),
  M("d-listening", "daily", "speaky", "Super ears", "Finish one Listening Lab.", "listening_done", 1, "/world/listening", 20, 6),
  M("d-games", "daily", "max", "Game on", "Play 2 word games.", "games_played", 2, "/world/arcade", 20, 6),
  M("w-words-50", "weekly", "lexi", "Word Collector", "Discover 50 new words this week.", "words_discovered", 50, "/world/quest", 120, 40, 1),
  M("w-master-20", "weekly", "lexi", "Mastery Marathon", "Master 20 words this week.", "words_mastered", 20, "/world/revision", 150, 50, 2, 2),
  M("w-writing-3", "weekly", "story", "Writer's Week", "Complete 3 writing activities.", "writing_done", 3, "/world/writing", 150, 50, 1),
  M("w-grammar-5", "weekly", "grammy", "Grammar Week", "Complete 5 grammar challenges.", "grammar_missions", 5, "/world/grammar", 120, 40, 1, 2),
  M("w-reading-2", "weekly", "max", "Bookworm Week", "Finish 2 Reading Adventures.", "reading_done", 2, "/world/reading", 100, 30, 1),
  M("w-days-4", "weekly", "max", "Explorer Rhythm", "Learn on 4 different days this week.", "learning_days", 4, "/world", 120, 40, 1),
  M("w-boss", "weekly", "max", "Boss Hunter", "Defeat one boss battle.", "bosses_defeated", 1, "/world/map", 120, 40, 2, 2),
  M("m-days-20", "monthly", "max", "Monthly Explorer", "Learn on 20 days this month.", "learning_days", 20, "/world", 400, 120, 5),
  M("m-master-100", "monthly", "lexi", "Hundred Word Hero", "Master 100 words this month.", "words_mastered", 100, "/world/revision", 500, 150, 6, 2),
  M("m-master-40", "monthly", "lexi", "Word Hero", "Master 40 words this month.", "words_mastered", 40, "/world/revision", 400, 120, 5, 1, 1),
  M("m-writing-10", "monthly", "story", "Story Season", "Complete 10 writing challenges.", "writing_done", 10, "/world/writing", 400, 120, 5, 2),
  M("m-boss-3", "monthly", "max", "Kingdom Saviour", "Finish a major kingdom adventure: defeat 3 bosses.", "bosses_defeated", 3, "/world/map", 450, 140, 6, 2),
  M("c-lexi", "character", "lexi", "LEXI's Word Hunt", "Help LEXI: master 10 words this week.", "words_mastered", 10, "/world/revision", 100, 30, 3),
  M("c-grammy", "character", "grammy", "GRAMMY's Spell Lab", "Help GRAMMY: complete 3 grammar challenges this week.", "grammar_missions", 3, "/world/grammar", 100, 30, 3),
  M("c-speaky", "character", "speaky", "SPEAKY's Sound Check", "Help SPEAKY: complete 3 speaking challenges this week.", "speaking_done", 3, "/world/speaking", 100, 30, 3),
  M("c-story", "character", "story", "STORY's Tale Quest", "Help STORY: create 1 story in Story Builder this week.", "stories_built", 1, "/world/story-builder", 100, 30, 3),
  M("c-max", "character", "max", "MAX's Grand Tour", "Help MAX: learn on 3 days this week.", "learning_days", 3, "/world/map", 100, 30, 3),
  M("x-forest-mystery", "mystery", "lexi", "The Vanishing Words", "Something mysterious is happening in Vocabulary Forest… words are vanishing! Solve 3 mystery-word cases using the clues.", "mystery_solved", 3, "/world/challenge/mystery", 150, 40, 4),
];

export const CHARACTER_CARD: Record<string, string> = { "c-lexi": "char-lexi", "c-grammy": "char-grammy", "c-speaky": "char-speaky", "c-story": "char-story", "c-max": "char-max" };

const L = (slug: string, kingdom: string, title: string, emoji: string, kind: string, x: number, y: number, unlock_metric: string, unlock_target: number, unlock_label: string, href: string | null, reward_crystals = 0, reward_coins = 0) =>
  ({ slug, kingdom, title, emoji, kind, x, y, unlock_metric, unlock_target, unlock_label, href, reward_crystals, reward_coins });

export const LOCATIONS = [
  L("vf-gate", "vocabulary-forest", "Whispering Gate", "🌿", "mission", 12, 78, "always", 0, "Open", "/world/quest"),
  L("vf-notebook", "vocabulary-forest", "Word Tree Hollow", "🌳", "mission", 34, 55, "words_discovered", 10, "Discover 10 words", "/world/notebook"),
  L("vf-treasure", "vocabulary-forest", "Mushroom Treasure", "🍄", "treasure", 55, 72, "words_discovered", 30, "Discover 30 words", null, 2, 30),
  L("vf-secret", "vocabulary-forest", "Secret Vocabulary Room", "🚪", "secret", 72, 40, "words_mastered", 25, "Master 25 words", "/world/notebook?filter=mastered", 3, 0),
  L("vf-boss", "vocabulary-forest", "Gloomgrab's Lair", "👾", "boss", 86, 18, "words_discovered", 20, "Discover 20 words", "/world/boss/word-thief"),
  L("gg-dock", "grammar-galaxy", "Star Dock", "🚀", "mission", 15, 70, "always", 0, "Open", "/world/grammar"),
  L("gg-drills", "grammar-galaxy", "Drill Asteroids", "☄️", "mission", 38, 40, "grammar_missions", 1, "Finish 1 grammar mission", "/world/grammar#drills"),
  L("gg-treasure", "grammar-galaxy", "Comet Chest", "💫", "treasure", 60, 75, "grammar_80", 3, "Score 80%+ in 3 missions", null, 3, 40),
  L("gg-boss", "grammar-galaxy", "Captain Muddle's Ship", "🛸", "boss", 82, 25, "grammar_missions", 3, "Finish 3 grammar missions", "/world/boss/grammar-boss"),
  L("sc-gate", "storytelling-castle", "Castle Gate", "🏰", "mission", 15, 75, "always", 0, "Open", "/world/writing"),
  L("sc-builder", "storytelling-castle", "Story Forge", "📜", "mission", 40, 45, "writing_done", 1, "Finish 1 writing mission", "/world/story-builder"),
  L("sc-treasure", "storytelling-castle", "Royal Inkwell", "🖋️", "treasure", 62, 70, "writing_done", 5, "Finish 5 writing missions", null, 3, 40),
  L("sc-boss", "storytelling-castle", "Plot Twister's Tower", "🌪️", "boss", 84, 22, "writing_done", 2, "Finish 2 writing missions", "/world/boss/story-challenge"),
  L("sm-base", "speaking-mountains", "Echo Base Camp", "⛺", "mission", 15, 78, "always", 0, "Open", "/world/speaking"),
  L("sm-listening", "speaking-mountains", "Listening Peak", "🎧", "mission", 40, 50, "speaking_done", 1, "Finish 1 speaking challenge", "/world/listening"),
  L("sm-treasure", "speaking-mountains", "Crystal Cave", "💎", "treasure", 63, 66, "speaking_done", 5, "Finish 5 speaking challenges", null, 3, 30),
  L("sm-boss", "speaking-mountains", "Echo Yeti's Summit", "🏔️", "boss", 84, 18, "speaking_done", 2, "Finish 2 speaking challenges", "/world/boss/pronunciation-champion"),
  L("ro-shore", "reading-ocean", "Story Shore", "🏝️", "mission", 14, 74, "always", 0, "Open", "/world/reading"),
  L("ro-reef", "reading-ocean", "Coral Library", "🪸", "mission", 40, 52, "reading_done", 1, "Finish 1 Reading Adventure", "/world/reading"),
  L("ro-treasure", "reading-ocean", "Sunken Chest", "🧰", "treasure", 62, 74, "reading_done", 3, "Finish 3 Reading Adventures", null, 3, 30),
  L("ro-boss", "reading-ocean", "Riddle Kraken's Deep", "🐙", "boss", 84, 30, "reading_done", 2, "Finish 2 Reading Adventures", "/world/boss/reading-mystery"),
  L("wa-entrance", "word-wizards-arena", "Arena Entrance", "🏟️", "mission", 15, 72, "always", 0, "Open", "/world/arcade"),
  L("wa-hall", "word-wizards-arena", "Hall of Games", "🕹️", "mission", 40, 42, "games_played", 3, "Play 3 games", "/world/arcade"),
  L("wa-treasure", "word-wizards-arena", "Champion's Vault", "🏆", "treasure", 62, 70, "games_played", 15, "Play 15 games", null, 3, 40),
  L("wa-boss", "word-wizards-arena", "Gloom Giant's Throne", "🗿", "boss", 84, 22, "bosses_defeated", 2, "Defeat 2 other bosses", "/world/boss/vocabulary-championship"),
];

export const BUILDINGS = [
  { slug: "home-base", title: "Home Base", emoji: "🏡", description: "Your cosy starting home.", unlock_metric: "always", unlock_target: 0, unlock_label: "Yours from day one", href: "/world/avatar", x: 46, y: 62 },
  { slug: "treehouse", title: "Magical Treehouse", emoji: "🌳", description: "A hideout that grows with your learning days.", unlock_metric: "learning_days", unlock_target: 3, unlock_label: "Learn on 3 days", href: "/world/calendar", x: 18, y: 48 },
  { slug: "word-library", title: "Vocabulary Library", emoji: "📚", description: "Every word you discover lives here.", unlock_metric: "words_discovered", unlock_target: 100, unlock_label: "Discover 100 words", href: "/world/notebook", x: 70, y: 40 },
  { slug: "secret-room", title: "Secret Vocabulary Room", emoji: "🗝️", description: "Only word masters may enter.", unlock_metric: "words_mastered", unlock_target: 25, unlock_label: "Master 25 words", href: "/world/notebook?filter=mastered", x: 84, y: 66 },
  { slug: "grammar-lab", title: "Grammar Laboratory", emoji: "⚗️", description: "Bubbling potions of perfect sentences.", unlock_metric: "grammar_80", unlock_target: 3, unlock_label: "Score 80%+ in 3 grammar missions", href: "/world/grammar", x: 30, y: 24 },
  { slug: "story-castle", title: "Storytelling Castle", emoji: "🏰", description: "Your stories become castle towers.", unlock_metric: "writing_done", unlock_target: 10, unlock_label: "Complete 10 writing missions", href: "/world/writing", x: 58, y: 18 },
  { slug: "speaking-studio", title: "Speaking Studio", emoji: "🎙️", description: "A stage for your voice.", unlock_metric: "speaking_done", unlock_target: 5, unlock_label: "Complete 5 speaking challenges", href: "/world/speaking", x: 12, y: 74 },
  { slug: "treasure-room", title: "Treasure Room", emoji: "💰", description: "Holds treasures from every kingdom.", unlock_metric: "treasures_claimed", unlock_target: 1, unlock_label: "Claim a kingdom treasure", href: "/world/collection", x: 78, y: 82 },
  { slug: "character-garden", title: "Character Garden", emoji: "🌷", description: "Your collectible cards bloom here.", unlock_metric: "cards_collected", unlock_target: 10, unlock_label: "Collect 10 cards", href: "/world/collection", x: 36, y: 82 },
  { slug: "pet-sanctuary", title: "Pet Sanctuary", emoji: "🐾", description: "A happy home for your pets.", unlock_metric: "pets_unlocked", unlock_target: 2, unlock_label: "Unlock 2 pets", href: "/world/pets", x: 60, y: 76 },
  { slug: "sky-ship", title: "Adventure Sky-Ship", emoji: "🛩️", description: "Fly between kingdoms!", unlock_metric: "bosses_defeated", unlock_target: 1, unlock_label: "Defeat a boss", href: "/world/map", x: 88, y: 22 },
];

/** Skill tree. evidence = key recorded by server-validated activities (server/skills.ts). */
const S = (slug: string, branch: string, title: string, description: string, evidence: string, min_attempts: number, min_accuracy: number, prereq: string | null = null, band_min = 1) =>
  ({ slug, branch, title, description, evidence, min_attempts, min_accuracy, prereq, band_min });
export const SKILL_NODES = [
  S("v-recognition", "vocabulary", "Word Recognition", "Match words to pictures.", "picture", 6, 70),
  S("v-meaning", "vocabulary", "Word Meaning", "Know what words mean.", "meaning", 10, 70, "v-recognition"),
  S("v-synonyms", "vocabulary", "Synonyms", "Find word twins.", "synonyms", 6, 70, "v-meaning"),
  S("v-antonyms", "vocabulary", "Antonyms", "Find opposites.", "opposites", 6, 70, "v-meaning"),
  S("v-usage", "vocabulary", "Word Usage", "Use words correctly.", "usage", 6, 70, "v-meaning"),
  S("v-context", "vocabulary", "Contextual Vocabulary", "Pick words that fit a sentence.", "fill_blank", 8, 70, "v-usage"),
  S("v-advanced", "vocabulary", "Advanced Vocabulary", "Master challenging words.", "advanced", 15, 75, "v-context", 2),
  S("g-parts", "grammar", "Parts of Speech", "Nouns, verbs, adjectives and more.", "grammar_parts", 10, 70),
  S("g-articles", "grammar", "Articles & Prepositions", "a, an, the, in, on, under…", "grammar_articles", 8, 70, "g-parts", 2),
  S("g-sentences", "grammar", "Sentence Construction", "Build complete sentences.", "grammar_sentences", 8, 70, "g-parts", 2),
  S("g-tenses", "grammar", "Tenses & Agreement", "Past, present, future; he runs/they run.", "grammar_tenses", 8, 70, "g-sentences", 3),
  S("g-advanced", "grammar", "Voice & Speech", "Active/passive, direct/indirect.", "grammar_advanced", 8, 70, "g-tenses", 4),
  S("w-words", "writing", "Word Formation", "Spell your own words correctly.", "writing_spelling", 20, 60),
  S("w-sentences", "writing", "Sentence Construction", "Write clear sentences.", "writing_sentences", 20, 60, "w-words"),
  S("w-paragraph", "writing", "Paragraph Writing", "Join sentences into paragraphs.", "writing_paragraph", 3, 60, "w-sentences", 2),
  S("w-creative", "writing", "Creative Writing", "Imaginative, original ideas.", "writing_creativity", 30, 70, "w-paragraph", 2),
  S("w-descriptive", "writing", "Descriptive Writing", "Rich, vivid vocabulary.", "writing_vocabulary", 30, 70, "w-paragraph", 2),
  S("w-story", "writing", "Storytelling", "Stories with a beginning, middle and end.", "story_builder", 2, 60, "w-creative", 2),
  S("s-pronunciation", "speaking", "Pronunciation", "Say words clearly.", "pronunciation", 12, 60),
  S("s-sentences", "speaking", "Speaking Sentences", "Say whole sentences fluently.", "speaking_lines", 12, 60, "s-pronunciation"),
  S("s-conversation", "speaking", "Conversation", "Handle real-life conversations.", "conversation", 4, 70, "s-sentences", 2),
  S("r-reading", "reading", "Story Reading", "Read stories from start to end.", "reading", 8, 60),
  S("r-vocab", "reading", "Reading Vocabulary", "Understand story words.", "reading_glossary", 6, 70, "r-reading"),
  S("l-words", "listening", "Listening for Words", "Hear and recognise words.", "listening", 10, 70),
  S("l-sentences", "listening", "Listening for Meaning", "Understand spoken sentences.", "listening_sentences", 8, 70, "l-words", 2),
  S("sp-basic", "spelling", "Spelling Basics", "Spell new words.", "spelling", 8, 70),
  S("sp-advanced", "spelling", "Spelling Pro", "Spell tricky words.", "spelling_advanced", 10, 75, "sp-basic", 2),
  S("c-literal", "comprehension", "Finding Facts", "Answer 'who/what/where' questions.", "comprehension", 10, 70),
  S("c-inference", "comprehension", "Reading Between the Lines", "Infer meaning and lessons.", "inference", 8, 70, "c-literal", 3),
  S("ph-sounds", "phonics", "Letter Sounds", "Hear the sounds inside words.", "listen_spell", 10, 70),
  S("ph-blend", "phonics", "Sound It Out", "Blend sounds to spell words you hear.", "listen_spell", 25, 75, "ph-sounds"),
  S("rw-everyday", "real_world", "Everyday Conversations", "Order food, ask for help, greet people.", "real_world", 4, 70),
  S("rw-confident", "real_world", "Confident in Real Life", "Handle longer, trickier conversations.", "real_world", 15, 75, "rw-everyday", 2),
];
export const SKILL_BRANCHES = [
  { key: "vocabulary", title: "Vocabulary", emoji: "🗝️", character: "lexi" },
  { key: "grammar", title: "Grammar", emoji: "🪐", character: "grammy" },
  { key: "writing", title: "Writing", emoji: "✍️", character: "story" },
  { key: "speaking", title: "Speaking", emoji: "🎤", character: "speaky" },
  { key: "reading", title: "Reading", emoji: "📚", character: "story" },
  { key: "listening", title: "Listening", emoji: "🎧", character: "speaky" },
  { key: "spelling", title: "Spelling", emoji: "🔤", character: "lexi" },
  { key: "comprehension", title: "Comprehension", emoji: "🧠", character: "grammy" },
  { key: "phonics", title: "Phonics", emoji: "👂", character: "lexi" },
  { key: "real_world", title: "Real-World English", emoji: "🌍", character: "max" },
];

/** Round types are scored server-side by server/challenge.ts. */
export const BOSSES = [
  { slug: "word-thief", kingdom: "vocabulary-forest", title: "The Word Thief", villain: "Gloomgrab", emoji: "👾", card_slug: "creature-gloomgrab", unlock_level: 1,
    story: "Gloomgrab has stolen the magical words of Vocabulary Forest! Win six rounds to restore them.",
    rounds: [{ type: "meaning", title: "Identify meanings" }, { type: "spelling", title: "Correct spelling" }, { type: "fill_blank", title: "Complete sentences" }, { type: "synonym", title: "Identify synonyms" }, { type: "order", title: "Construct sentences" }, { type: "mixed", title: "Final mixed challenge" }] },
  { slug: "grammar-boss", kingdom: "grammar-galaxy", title: "Grammar Boss", villain: "Captain Muddle", emoji: "🛸", card_slug: "creature-muddle", unlock_level: 4,
    story: "Captain Muddle scrambled the galaxy's sentences. Fix the grammar to save the stars!",
    rounds: [{ type: "grammar", title: "Grammar blasters" }, { type: "order", title: "Unscramble sentences" }, { type: "grammar", title: "Fix the mistakes" }, { type: "mixed", title: "Final showdown" }] },
  { slug: "story-challenge", kingdom: "storytelling-castle", title: "Story Creator Challenge", villain: "The Plot Twister", emoji: "🌪️", card_slug: "creature-plot-twister", unlock_level: 4,
    story: "The Plot Twister jumbled every story in the castle. Rebuild them, sentence by sentence!",
    rounds: [{ type: "order", title: "Rebuild the sentences" }, { type: "fill_blank", title: "Find the missing word" }, { type: "meaning", title: "Story words" }, { type: "grammar", title: "Punctuation power" }] },
  { slug: "pronunciation-champion", kingdom: "speaking-mountains", title: "Pronunciation Champion", villain: "Echo the Yeti", emoji: "🏔️", card_slug: "creature-echo-yeti", unlock_level: 6,
    story: "Echo only lets clear speakers pass the summit. Show you know how words sound!",
    rounds: [{ type: "phonetic", title: "How do you say it?" }, { type: "listen", title: "Sharp ears" }, { type: "spelling", title: "Echo spelling" }] },
  { slug: "reading-mystery", kingdom: "reading-ocean", title: "Reading Mystery Challenge", villain: "The Riddle Kraken", emoji: "🐙", card_slug: "creature-riddle-kraken", unlock_level: 2,
    story: "The Riddle Kraken hid answers deep inside stories. Read carefully to find them!",
    rounds: [{ type: "reading", title: "Story clues" }, { type: "meaning", title: "Deep-sea words" }, { type: "reading", title: "Final riddle" }] },
  { slug: "vocabulary-championship", kingdom: "word-wizards-arena", title: "Vocabulary Championship", villain: "The Gloom Giant", emoji: "🗿", card_slug: "creature-gloom-giant", unlock_level: 8,
    story: "The Gloom Giant challenges the best Explorers. Use every skill you have!",
    rounds: [{ type: "meaning", title: "Meaning duel" }, { type: "antonym", title: "Opposite attack" }, { type: "grammar", title: "Grammar guard" }, { type: "spelling", title: "Spelling storm" }, { type: "mixed", title: "Giant finale" }] },
];

/** Character interaction states and lines (used throughout the UI). */
export const DIALOGUE = {
  lexi: { welcome: ["Hi Explorer! Ready to discover new words?"], excited: ["Wow! You discovered a fantastic new word!"], thinking: ["Hmm… let's look at the clues together."], explaining: ["Here's what this word means…"], celebrating: ["Word power UNLOCKED! 🎉"], encouraging: ["Nearly! Every try makes your brain stronger."], surprised: ["Whoa — you already knew that one?!"], hint: ["Psst… look at the first letter!"] },
  grammy: { welcome: ["Welcome to Grammar Galaxy, young wizard!"], excited: ["Spellbinding sentence!"], thinking: ["Let me check that sentence with my wand…"], explaining: ["Here's the grammar magic behind it."], celebrating: ["Ten points to you, grammar wizard!"], encouraging: ["Oops! Let's fix that sentence together."], surprised: ["My hat! That was perfect!"], hint: ["Remember: who is doing the action?"] },
  speaky: { welcome: ["Let's warm up that amazing voice!"], excited: ["I heard every sound perfectly!"], thinking: ["Listening carefully…"], explaining: ["Say it slowly, one beat at a time."], celebrating: ["Voice champion!"], encouraging: ["You're getting better! Let's try once more."], surprised: ["Wow, you sounded like a news reader!"], hint: ["Clap the syllables first."] },
  story: { welcome: ["Every great story starts with one word."], excited: ["What a twist!"], thinking: ["That's an interesting beginning. What happens next?"], explaining: ["A story needs a beginning, a middle and an end."], celebrating: ["Your story deserves a castle tower!"], encouraging: ["Let's add one more detail — what did it look like?"], surprised: ["I did NOT expect that ending!"], hint: ["Who? Where? What went wrong?"] },
  max: { welcome: ["Hey Explorer! A brand-new adventure is waiting for you!"], excited: ["Let's GO!"], thinking: ["Planning your next quest…"], explaining: ["Here's today's mission map."], celebrating: ["Mission completed! Your next adventure is ready."], encouraging: ["Take your time — I'm right here with you."], surprised: ["A hidden treasure appeared!"], hint: ["Try the mission with the glowing star first."] },
} as const;
