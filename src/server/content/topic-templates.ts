/**
 * Dynamic writing-topic generator. Hand-written, age-graded templates × fillers per
 * theme produce a large, reviewed-by-design topic space without AI cost; Claude
 * generates further topics through the reviewed content pipeline.
 *
 * {x} is replaced by a theme filler. Band 1 = Pre-KG–UKG (sentences),
 * 2 = Grades 1–2, 3 = Grades 3–4, 4 = Grades 5–7 (essays).
 */
type T = { x: string[]; b: Record<1 | 2 | 3 | 4, string[]>; words: Record<1 | 2 | 3 | 4, string[]> };

export const TOPIC_TEMPLATES: Record<string, T> = {
  family: {
    x: ["mom", "dad", "grandma", "grandpa", "brother", "sister", "cousin", "aunt", "uncle"],
    b: { 1: ["I love my {x}", "My {x} and me"], 2: ["A fun day with my {x}", "Why my {x} is special"], 3: ["The best lesson my {x} taught me", "A surprise I planned for my {x}"], 4: ["What my {x}'s childhood was like compared to mine", "How my {x} shaped who I am"] },
    words: { 1: ["love", "happy", "hug"], 2: ["helpful", "gentle", "share"], 3: ["generous", "loyal", "delighted"], 4: ["empathy", "perseverance", "grateful"] },
  },
  school: {
    x: ["best friend", "classroom", "school library", "sports day", "lunch break", "teacher", "school trip", "science lab", "annual day"],
    b: { 1: ["My {x}", "What I like about my {x}"], 2: ["A funny moment with my {x}", "My favourite thing about the {x}"], 3: ["The most exciting {x} ever", "If I could change one thing about the {x}"], 4: ["What makes a great {x}? Give reasons", "A letter to my principal about the {x}"] },
    words: { 1: ["friend", "play", "book"], 2: ["giggle", "polite", "share"], 3: ["eager", "remarkable", "cheerful"], 4: ["collaborate", "articulate", "diligent"] },
  },
  animals: {
    x: ["elephant", "tiger", "peacock", "dolphin", "puppy", "parrot", "butterfly", "turtle", "monkey", "owl"],
    b: { 1: ["My favourite animal: the {x}", "The {x} can…"], 2: ["A day in the life of a {x}", "If I had a pet {x}"], 3: ["The {x} who learned to talk", "How we can protect the {x}"], 4: ["Should the {x} live in a zoo? Your opinion", "Write a news report: a {x} rescued in the city"] },
    words: { 1: ["big", "small", "run"], 2: ["curious", "quick", "tiny"], 3: ["enormous", "swift", "rescue"], 4: ["sustainable", "consequence", "empathy"] },
  },
  science: {
    x: ["robot", "magnet", "rainbow", "volcano", "plant", "rocket", "microscope", "battery", "magnifying glass"],
    b: { 1: ["I saw a {x}", "What colour is the {x}?"], 2: ["How a {x} works (in my words)", "My experiment with a {x}"], 3: ["The day my {x} came alive", "Five fun facts about the {x}"], 4: ["How the {x} changed the world", "Design an experiment about a {x}"] },
    words: { 1: ["bright", "big", "look"], 2: ["curious", "explore", "careful"], 3: ["fascinating", "imagine", "peculiar"], 4: ["hypothesis", "innovative", "meticulous"] },
  },
  space: {
    x: ["moon", "Mars", "the stars", "a rocket ride", "an astronaut", "Saturn's rings", "a space station", "a comet", "the Sun"],
    b: { 1: ["I can see {x}", "Hello, {x}!"], 2: ["My trip to {x}", "What I would pack to visit {x}"], 3: ["A mystery on {x}", "A letter from {x} to Earth"], 4: ["Should humans live on {x}? Argue your view", "A diary entry: my first week on {x}"] },
    words: { 1: ["star", "moon", "sun"], 2: ["bright", "sparkle", "journey"], 3: ["mysterious", "glimmer", "adventure"], 4: ["inevitable", "innovative", "contemplate"] },
  },
  travel: {
    x: ["the beach", "the mountains", "a train journey", "Jaipur", "Kerala's backwaters", "a jungle safari", "a desert camp", "an island", "a big city"],
    b: { 1: ["I went to {x}", "At {x} I saw…"], 2: ["My trip to {x}", "Packing my bag for {x}"], 3: ["Lost and found at {x}", "A travel guide to {x} for kids"], 4: ["Why everyone should visit {x}", "Travel then and now: getting to {x}"] },
    words: { 1: ["sun", "fun", "car"], 2: ["journey", "explore", "cozy"], 3: ["adventure", "magnificent", "wander"], 4: ["serene", "vivid", "abundant"] },
  },
  fantasy: {
    x: ["a dragon", "a magic carpet", "a talking tree", "a fairy kingdom", "a wizard's hat", "an invisible cloak", "a unicorn", "a floating castle", "a genie"],
    b: { 1: ["I met {x}", "My friend is {x}"], 2: ["The day I found {x}", "{x} and the lost key"], 3: ["My adventure with {x}", "The secret of {x}"], 4: ["If {x} were real, how would society change?", "A myth about {x} — told in your own words"] },
    words: { 1: ["magic", "happy", "fly"], 2: ["sparkle", "brave", "curious"], 3: ["mysterious", "astonished", "courage"], 4: ["ominous", "jubilant", "vivid"] },
  },
  sports: {
    x: ["cricket", "football", "badminton", "swimming", "chess", "kabaddi", "drawing", "dancing", "cycling", "music"],
    b: { 1: ["I like {x}", "Playing {x}"], 2: ["My first time trying {x}", "Why I love {x}"], 3: ["The big {x} match", "Teach a friend how to start {x}"], 4: ["What {x} teaches us about life", "Should {x} be compulsory in schools?"] },
    words: { 1: ["run", "jump", "happy"], 2: ["quick", "strong", "brave"], 3: ["determined", "eager", "swift"], 4: ["perseverance", "tenacious", "versatile"] },
  },
  festivals: {
    x: ["Diwali", "Holi", "Eid", "Christmas", "Pongal", "Onam", "Durga Puja", "Baisakhi", "my birthday"],
    b: { 1: ["I love {x}", "Colours of {x}"], 2: ["How my family celebrates {x}", "The best food at {x}"], 3: ["A {x} I will never forget", "Explaining {x} to a friend from another country"], 4: ["The meaning behind {x}", "How can we celebrate {x} in an eco-friendly way?"] },
    words: { 1: ["happy", "cake", "sing"], 2: ["festival", "sparkle", "delicious"], 3: ["delighted", "generous", "harvest"], 4: ["sustainable", "jubilant", "vivid"] },
  },
  environment: {
    x: ["trees", "rivers", "plastic", "water", "the ocean", "birds", "electricity", "food waste", "air"],
    b: { 1: ["I can save {x}", "I love {x}"], 2: ["How I can help {x}", "A day without {x}"], 3: ["A superhero who protects {x}", "My plan to save {x} at school"], 4: ["The real cost of wasting {x}", "Persuade your city to protect {x}"] },
    words: { 1: ["tree", "help", "clean"], 2: ["careful", "helpful", "protect"], 3: ["protect", "rescue", "cautious"], 4: ["sustainable", "frugal", "consequence"] },
  },
  everyday: {
    x: ["breakfast", "a rainy morning", "bedtime", "a market visit", "my room", "a bus ride", "cooking with family", "a power cut", "a lazy Sunday"],
    b: { 1: ["{x}", "What I do at {x}"], 2: ["All about {x}", "A funny thing at {x}"], 3: ["The day {x} went wrong", "Describe {x} with all five senses"], 4: ["The hidden adventure in {x}", "What {x} reveals about my family"] },
    words: { 1: ["milk", "happy", "sleep"], 2: ["cozy", "quiet", "delicious"], 3: ["gloomy", "cheerful", "peculiar"], 4: ["vivid", "serene", "pragmatic"] },
  },
  imagination: {
    x: ["could fly", "were invisible", "could talk to animals", "shrank to the size of an ant", "had a time machine", "lived underwater", "were a superhero", "could stop time", "lived in a treehouse"],
    b: { 1: ["If I {x}", "Pretend I {x}"], 2: ["One day, if I {x}…", "My magic day: I {x}"], 3: ["The day I woke up and {x}", "Problems you'd face if you {x}"], 4: ["If everyone {x}, how would the world change?", "The responsibilities that come if you {x}"] },
    words: { 1: ["fly", "magic", "big"], 2: ["imagine", "brave", "curious"], 3: ["astonished", "imagine", "adventure"], 4: ["consequence", "contemplate", "inevitable"] },
  },
  problem: {
    x: ["a lost puppy", "a broken toy", "a fight between friends", "too much homework", "a forgotten lunch box", "a messy room", "a missing library book", "a flat tyre", "a stuck kite"],
    b: { 1: ["Help! {x}", "What to do about {x}"], 2: ["How I solved {x}", "Three ways to fix {x}"], 3: ["A clever plan for {x}", "The story of {x} — and how we fixed it"], 4: ["Step-by-step: solving {x}", "What {x} taught me about teamwork"] },
    words: { 1: ["help", "find", "happy"], 2: ["careful", "helpful", "share"], 3: ["determined", "cautious", "rescue"], 4: ["pragmatic", "collaborate", "resilient"] },
  },
  values: {
    x: ["honesty", "kindness", "sharing", "patience", "courage", "saying sorry", "helping others", "teamwork", "respect"],
    b: { 1: ["I show {x}", "{x} is good"], 2: ["A time I showed {x}", "Why {x} matters"], 3: ["A story about {x}", "How {x} makes school better"], 4: ["Is {x} always easy? Discuss", "A world without {x}"] },
    words: { 1: ["kind", "friend", "smile"], 2: ["polite", "gentle", "share"], 3: ["generous", "loyal", "courage"], 4: ["empathy", "benevolent", "transparent"] },
  },
  inventions: {
    x: ["homework robot", "flying school bus", "talking backpack", "pollution-eating tree", "self-cleaning room", "dream recorder", "weather remote", "language translator hat", "underwater bicycle"],
    b: { 1: ["My {x}", "A {x} for me"], 2: ["I invented a {x}!", "How my {x} helps people"], 3: ["The day my {x} went haywire", "An advertisement for my {x}"], 4: ["Pitch your {x} to investors", "Could a {x} cause problems? Weigh it up"] },
    words: { 1: ["big", "fun", "help"], 2: ["helpful", "quick", "curious"], 3: ["remarkable", "imagine", "fascinating"], 4: ["innovative", "versatile", "hypothesis"] },
  },
  mystery: {
    x: ["missing cookies", "a secret door", "footprints in the garden", "a coded letter", "a ghostly sound", "a vanished painting", "a locked diary", "a strange map", "a glowing box"],
    b: { 1: ["Who took the {x}?", "I found {x}"], 2: ["The case of {x}", "Detective me: {x}"], 3: ["The mystery of {x}", "Clues hidden in {x}"], 4: ["Solve it: the riddle of {x}", "Write a detective report on {x}"] },
    words: { 1: ["look", "find", "box"], 2: ["curious", "whisper", "careful"], 3: ["mysterious", "peculiar", "vanish"], 4: ["ambiguous", "ominous", "meticulous"] },
  },
  history: {
    x: ["the Indus Valley", "ancient Hampi", "the age of dinosaurs", "the first printing press", "Ashoka's empire", "the first trip to the moon", "the invention of the wheel", "a castle in old times", "the Silk Road"],
    b: { 1: ["Long ago: {x}", "Big dinosaurs!"], 2: ["If I visited {x}", "What children did in {x}"], 3: ["A time-travel adventure to {x}", "A diary from {x}"], 4: ["What we learn from {x}", "How {x} still affects our lives today"] },
    words: { 1: ["old", "big", "long"], 2: ["journey", "explore", "curious"], 3: ["ancient", "magnificent", "adventure"], 4: ["contemplate", "consequence", "remarkable"] },
  },
  realworld: {
    x: ["ordering food", "buying vegetables", "asking for directions", "a doctor's visit", "saving pocket money", "a birthday invitation", "a phone call to grandma", "a lost-and-found counter", "a job I'd love"],
    b: { 1: ["At the shop", "Say thank you!"], 2: ["Practise: {x}", "My first time {x}"], 3: ["A guide to {x}", "Write a conversation about {x}"], 4: ["Real-life English: {x}", "A formal letter about {x}"] },
    words: { 1: ["please", "thank", "help"], 2: ["polite", "helpful", "careful"], 3: ["cautious", "eager", "cheerful"], 4: ["articulate", "pragmatic", "frugal"] },
  },
};

const MODE: Record<number, { mode: "sentence" | "paragraph" | "essay"; min_words: number; lead: string }> = {
  1: { mode: "sentence", min_words: 5, lead: "Write one or two short sentences." },
  2: { mode: "paragraph", min_words: 25, lead: "Write 3–5 sentences." },
  3: { mode: "paragraph", min_words: 60, lead: "Write a paragraph with a beginning, middle and end." },
  4: { mode: "essay", min_words: 120, lead: "Write an essay with an introduction, body and conclusion." },
};

export interface GeneratedTopic { slug: string; title: string; prompt: string; band: number; mode: string; min_words: number; suggested_words: string[]; emoji: string; category: string }

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);

/** Every distinct topic this template space can produce for a band. */
export function allTemplateTopics(band: 1 | 2 | 3 | 4, emojiFor: (cat: string) => string): GeneratedTopic[] {
  const out: GeneratedTopic[] = [];
  const seen = new Set<string>();
  for (const [category, t] of Object.entries(TOPIC_TEMPLATES)) {
    for (const tpl of t.b[band]) {
      const fillers = tpl.includes("{x}") ? t.x : [""];
      for (const x of fillers) {
        const title = cap(tpl.replace("{x}", x));
        const slug = `t${band}-${slugify(title)}`;
        if (seen.has(slug)) continue;
        seen.add(slug);
        const m = MODE[band];
        out.push({
          slug, title, band, category, mode: m.mode, min_words: m.min_words, suggested_words: t.words[band], emoji: emojiFor(category),
          prompt: `${title}. ${m.lead} ${band >= 3 ? "Use details and at least one power word." : "Use a power word if you can!"}`,
        });
      }
    }
  }
  return out;
}
