/** Reading Adventures library (original stories). */
export interface StorySeed {
  slug: string; title: string; genre: string; band: number; emoji: string; cover: string;
  pages: { text: string; scene: string }[];
  glossary: { word: string; meaning: string }[];
  questions: { q: string; options: string[]; answer: number }[];
  reward?: string; // reward slug needed to unlock (bonus collections)
}

export const STORIES: StorySeed[] = [
  {
    slug: "pip-the-little-star", title: "Pip the Little Star", genre: "Fantasy", band: 1, emoji: "⭐", cover: "galaxy",
    pages: [
      { scene: "🌙⭐", text: "Pip was a tiny star. Pip lived high in the sky next to the big moon." },
      { scene: "⭐😢", text: "Pip was sad. 'I am too small. Nobody can see me,' said Pip." },
      { scene: "👧🔭", text: "But down below, a girl named Anu looked up. 'I see you, little star!' she said." },
      { scene: "⭐😊✨", text: "Pip was so happy that Pip began to shine bright, bright, bright!" },
    ],
    glossary: [{ word: "tiny", meaning: "very small" }, { word: "shine", meaning: "to give out light" }],
    questions: [
      { q: "Who was Pip?", options: ["A cat", "A little star", "A girl"], answer: 1 },
      { q: "Why was Pip sad at first?", options: ["Pip was too small", "Pip was hungry", "Pip lost a toy"], answer: 0 },
      { q: "Who saw Pip?", options: ["The moon", "Anu", "A bird"], answer: 1 },
    ],
  },
  {
    slug: "the-monsoon-puddle", title: "The Monsoon Puddle", genre: "Everyday", band: 2, emoji: "🌧️", cover: "ocean",
    pages: [
      { scene: "🌧️🏠", text: "The monsoon rain fell all night. In the morning, Kabir saw an enormous puddle outside his gate." },
      { scene: "🐸💧", text: "A tiny frog sat in the middle of the puddle. 'Ribbit! This is my lake,' it seemed to say." },
      { scene: "👦🧒⛵", text: "Kabir and his sister Zoya made paper boats. They were careful not to splash the frog." },
      { scene: "⛵🌈", text: "The boats sailed across the puddle. Then a rainbow appeared in the sky. It was the best morning ever!" },
    ],
    glossary: [{ word: "monsoon", meaning: "the season of heavy rain in India" }, { word: "enormous", meaning: "extremely big" }, { word: "careful", meaning: "paying attention so nothing goes wrong" }],
    questions: [
      { q: "What did Kabir find outside his gate?", options: ["A kite", "An enormous puddle", "A puppy"], answer: 1 },
      { q: "Who lived in the puddle?", options: ["A fish", "A duck", "A tiny frog"], answer: 2 },
      { q: "What did Kabir and Zoya make?", options: ["Paper boats", "Paper planes", "Sandcastles"], answer: 0 },
      { q: "What appeared at the end?", options: ["The moon", "A rainbow", "A storm"], answer: 1 },
    ],
  },
  {
    slug: "the-clockwork-elephant", title: "The Clockwork Elephant", genre: "Adventure", band: 3, emoji: "🐘", cover: "castle",
    pages: [
      { scene: "🏛️🐘", text: "In the corner of an ancient museum in Jaipur stood a clockwork elephant, covered in dust. Nobody had wound its golden key for a hundred years." },
      { scene: "👧🔑", text: "One rainy afternoon, curious Ishita noticed the key glimmer. She looked around, then turned it — once, twice, three times." },
      { scene: "🐘✨", text: "With a whir and a click, the elephant opened its eyes. 'Thank you,' it trumpeted softly. 'I have been waiting for someone with courage.'" },
      { scene: "🗺️🌄", text: "The elephant showed Ishita a mysterious map hidden in its saddle. It led to a garden where the city's lost songs were kept." },
      { scene: "🎶🌺", text: "Together they returned the songs to the city. That evening, every street in Jaipur was filled with music — and Ishita was delighted." },
    ],
    glossary: [{ word: "ancient", meaning: "very, very old" }, { word: "glimmer", meaning: "to shine faintly" }, { word: "courage", meaning: "being brave when you feel afraid" }, { word: "mysterious", meaning: "strange and hard to explain" }],
    questions: [
      { q: "Where was the clockwork elephant?", options: ["In a school", "In an ancient museum", "In a forest"], answer: 1 },
      { q: "What made Ishita notice the key?", options: ["It glimmered", "It fell down", "It made a sound"], answer: 0 },
      { q: "What did the elephant say it had been waiting for?", options: ["Food", "Someone with courage", "The rain to stop"], answer: 1 },
      { q: "What did the map lead to?", options: ["A treasure of gold", "A garden of lost songs", "A new museum"], answer: 1 },
    ],
  },
  {
    slug: "signal-from-the-reef", title: "Signal from the Reef", genre: "Science fiction", band: 4, emoji: "🛰️", cover: "ocean",
    pages: [
      { scene: "🛰️🌊", text: "Aarav's school had built a small satellite receiver for the science fair. On the night before the fair, it picked up a faint, repeating signal — not from space, but from the coral reef off the coast." },
      { scene: "👩‍🔬📈", text: "His teacher, Ms. Fernandes, was sceptical. 'Form a hypothesis,' she said, 'then test it meticulously.' Aarav's hypothesis: the signal came from an old ocean sensor." },
      { scene: "🚤🪸", text: "With the local marine-research team, the class sailed out at dawn. The water was serene, but the coral looked pale — bleached by warming seas, an ominous sign." },
      { scene: "📡🐢", text: "They found the sensor tangled in a fishing net. It had been broadcasting temperature warnings for weeks, but no one had been listening." },
      { scene: "🏆🌍", text: "Aarav's project didn't win first prize, but the city installed new reef sensors because of it. Sometimes, the most innovative idea is simply paying attention." },
    ],
    glossary: [{ word: "sceptical", meaning: "not easily convinced; doubtful" }, { word: "hypothesis", meaning: "an idea that can be tested" }, { word: "meticulously", meaning: "with great care about every detail" }, { word: "ominous", meaning: "suggesting something bad may happen" }, { word: "innovative", meaning: "using new, creative ideas" }],
    questions: [
      { q: "Where did the signal actually come from?", options: ["Outer space", "The coral reef", "Another school"], answer: 1 },
      { q: "What was Aarav's hypothesis?", options: ["Aliens were calling", "It came from an old ocean sensor", "The receiver was broken"], answer: 1 },
      { q: "Why was the pale coral 'an ominous sign'?", options: ["It showed the sea was warming", "It meant fish were happy", "It was a new kind of coral"], answer: 0 },
      { q: "What is the main lesson of the story?", options: ["Winning is everything", "Paying attention can lead to change", "Satellites are dangerous"], answer: 1 },
    ],
  },
  {
    slug: "the-honest-potter", title: "The Honest Potter", genre: "Moral", band: 2, emoji: "🏺", cover: "forest",
    pages: [
      { scene: "🏺🏘️", text: "In a small village lived Meena, a potter. She made pots that were strong and beautiful." },
      { scene: "💰😮", text: "One day a rich trader paid her too much money by mistake. Meena saw the extra coins." },
      { scene: "🏃‍♀️💨", text: "She ran after the trader. 'Sir, you gave me too much!' she said, and returned the coins." },
      { scene: "🤝😊", text: "The trader smiled. 'You are honest. From today, I will buy all my pots from you.' Meena's work grew and grew." },
    ],
    glossary: [{ word: "potter", meaning: "a person who makes pots from clay" }, { word: "honest", meaning: "telling the truth and being fair" }, { word: "trader", meaning: "a person who buys and sells things" }],
    questions: [
      { q: "What did Meena make?", options: ["Bread", "Pots", "Clothes"], answer: 1 },
      { q: "What mistake did the trader make?", options: ["He paid too much", "He broke a pot", "He forgot his bag"], answer: 0 },
      { q: "Why did the trader buy all his pots from Meena?", options: ["She was honest", "Her pots were cheap", "She was his sister"], answer: 0 },
    ],
  },
  {
    slug: "moon-library", title: "The Moon Library", genre: "Science fiction", band: 2, emoji: "🪐", cover: "galaxy", reward: "stories-space",
    pages: [
      { scene: "🌙📚", text: "On the far side of the moon there is a library. Its books float, because there is very little gravity!" },
      { scene: "👩‍🚀🤖", text: "Astronaut Leela and her robot friend Bolt visit every Sunday. Bolt reads the books aloud in a funny, beeping voice." },
      { scene: "📖✨", text: "One book was empty. 'This book is waiting for a new story,' said the librarian, a gentle old owl in a space suit." },
      { scene: "✍️🌍", text: "Leela wrote about Earth — its oceans, mango trees and festivals. Now every moon visitor can read it!" },
    ],
    glossary: [{ word: "gravity", meaning: "the force that pulls things down" }, { word: "librarian", meaning: "a person who looks after a library" }],
    questions: [
      { q: "Why do the books float?", options: ["They are magic", "There is little gravity", "They are made of air"], answer: 1 },
      { q: "Who is the librarian?", options: ["A robot", "An owl in a space suit", "Leela"], answer: 1 },
      { q: "What did Leela write about?", options: ["Mars", "Earth", "Robots"], answer: 1 },
    ],
  },
];
