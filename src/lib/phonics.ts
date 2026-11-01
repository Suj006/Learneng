/**
 * Phonics & Sound Valley — content and question generation (pure; the server keeps the answer key).
 * 12 units from letter sounds to decoding. Audio is spoken with the platform voice (browser or neural TTS): `say` is
 * what is read aloud, `show` is what is shown. Each question has an explanation used for mistake review.
 */
export interface Unit { slug: string; title: string; emoji: string; objective: string; band_min: number; order: number }
export interface PQuestion { prompt: string; say?: string; show?: string; options: string[] }
export interface PKey { answer: string; explain: string }

export const UNITS: Unit[] = [
  { slug: "letter-sounds", title: "Letter Sounds", emoji: "🔤", objective: "Match each letter to its sound.", band_min: 1, order: 1 },
  { slug: "beginning-sounds", title: "Beginning Sounds", emoji: "🐝", objective: "Hear the first sound in a word.", band_min: 1, order: 2 },
  { slug: "ending-sounds", title: "Ending Sounds", emoji: "🎯", objective: "Hear the last sound in a word.", band_min: 1, order: 3 },
  { slug: "short-vowels", title: "Short Vowels", emoji: "🍎", objective: "Hear a, e, i, o, u in the middle of a word.", band_min: 1, order: 4 },
  { slug: "cvc-blending", title: "Blend CVC Words", emoji: "🧩", objective: "Blend three sounds into a word.", band_min: 1, order: 5 },
  { slug: "segmenting", title: "Count the Sounds", emoji: "👏", objective: "Break a word into its sounds.", band_min: 1, order: 6 },
  { slug: "rhyming", title: "Rhyme Time", emoji: "🎵", objective: "Find words that rhyme.", band_min: 1, order: 7 },
  { slug: "digraphs", title: "Digraphs: sh, ch, th", emoji: "🐚", objective: "Two letters, one sound: sh, ch, th, wh, ck.", band_min: 1, order: 8 },
  { slug: "blends", title: "Consonant Blends", emoji: "🌸", objective: "Hear blends like bl, cr, st, fr.", band_min: 2, order: 9 },
  { slug: "long-vowels", title: "Long Vowels & Magic e", emoji: "✨", objective: "Magic e makes the vowel say its name.", band_min: 2, order: 10 },
  { slug: "syllables", title: "Syllable Clap", emoji: "🥁", objective: "Count the beats (syllables) in a word.", band_min: 2, order: 11 },
  { slug: "decoding", title: "Read It!", emoji: "📖", objective: "Read a word and find its picture.", band_min: 1, order: 12 },
];

const LETTERS: [string, string, string][] = [
  ["a", "apple", "🍎"], ["b", "ball", "⚽"], ["c", "cat", "🐱"], ["d", "dog", "🐶"], ["e", "egg", "🥚"], ["f", "fish", "🐟"], ["g", "goat", "🐐"],
  ["h", "hat", "👒"], ["i", "insect", "🐞"], ["j", "jam", "🍯"], ["k", "kite", "🪁"], ["l", "lion", "🦁"], ["m", "moon", "🌙"], ["n", "nest", "🪺"],
  ["o", "octopus", "🐙"], ["p", "pig", "🐷"], ["r", "rabbit", "🐰"], ["s", "sun", "☀️"], ["t", "tiger", "🐯"], ["u", "umbrella", "☂️"],
  ["v", "van", "🚐"], ["w", "web", "🕸️"], ["y", "yak", "🐂"], ["z", "zebra", "🦓"],
];
const CVC: [string, string][] = [["cat", "🐱"], ["dog", "🐶"], ["sun", "☀️"], ["pig", "🐷"], ["bed", "🛏️"], ["hat", "👒"], ["bus", "🚌"], ["cup", "☕"], ["fox", "🦊"], ["hen", "🐔"], ["map", "🗺️"], ["net", "🥅"], ["pen", "🖊️"], ["box", "📦"], ["bag", "👜"], ["jam", "🍯"], ["mug", "☕"], ["web", "🕸️"]];
const VOWEL_SWAP: Record<string, string> = { a: "o", e: "i", i: "a", o: "u", u: "e" };
const RHYMES: string[][] = [["cat", "hat", "bat", "mat"], ["dog", "log", "frog", "fog"], ["sun", "run", "fun", "bun"], ["bed", "red", "fed", "ted"], ["pig", "big", "dig", "wig"], ["cake", "lake", "make", "bake"], ["star", "car", "jar", "far"], ["moon", "spoon", "soon", "noon"], ["tree", "bee", "see", "free"], ["ring", "sing", "king", "wing"]];
const DIGRAPHS: [string, string, string][] = [["sh", "ship", "🚢"], ["sh", "fish", "🐟"], ["sh", "shell", "🐚"], ["ch", "chair", "🪑"], ["ch", "cheese", "🧀"], ["ch", "chick", "🐥"], ["th", "thumb", "👍"], ["th", "three", "3️⃣"], ["wh", "whale", "🐋"], ["wh", "wheel", "🛞"], ["ck", "duck", "🦆"], ["ck", "clock", "🕰️"], ["ck", "sock", "🧦"]];
const BLENDS: [string, string, string][] = [["bl", "blue", "🔵"], ["bl", "block", "🧱"], ["cr", "crab", "🦀"], ["cr", "crown", "👑"], ["st", "star", "⭐"], ["st", "stamp", "📮"], ["fr", "frog", "🐸"], ["fr", "fruit", "🍇"], ["gr", "grapes", "🍇"], ["tr", "train", "🚆"], ["tr", "tree", "🌳"], ["sp", "spoon", "🥄"], ["sn", "snake", "🐍"], ["pl", "plane", "✈️"], ["dr", "drum", "🥁"]];
const MAGIC_E: [string, string, string][] = [["cap", "cape", "🦸"], ["kit", "kite", "🪁"], ["tap", "tape", "📼"], ["pin", "pine", "🌲"], ["cub", "cube", "🧊"], ["hop", "hope", "🙏"], ["can", "cane", "🦯"], ["rob", "robe", "🥋"], ["man", "mane", "🦁"], ["not", "note", "🎵"]];
const SYLLABLES: [string, number][] = [["cat", 1], ["sun", 1], ["frog", 1], ["apple", 2], ["tiger", 2], ["rabbit", 2], ["pencil", 2], ["monkey", 2], ["banana", 3], ["elephant", 3], ["butterfly", 3], ["umbrella", 3], ["dinosaur", 3], ["watermelon", 4], ["caterpillar", 4]];
const DIGRAPH_SET = ["sh", "ch", "th", "wh", "ck"];
const BLEND_SET = ["bl", "cr", "st", "fr", "gr", "tr", "sp", "sn", "pl", "dr"];

/** Small seeded random generator so a session can be rebuilt identically. */
function rng(seed: number) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const shuffle = <T,>(a: T[], r: () => number) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pickN = <T,>(a: T[], n: number, r: () => number) => shuffle(a, r).slice(0, n);
const opts = (answer: string, pool: string[], r: () => number, n = 3) => shuffle([answer, ...pickN([...new Set(pool)].filter((x) => x !== answer), n, r)], r);

/** Builds N questions for a unit. Returns the public questions and the server-side key. */
export function buildUnit(slug: string, seed: number, n = 6): { questions: PQuestion[]; key: PKey[] } {
  const r = rng(seed);
  const qs: PQuestion[] = [], key: PKey[] = [];
  const push = (q: PQuestion, k: PKey) => { qs.push(q); key.push(k); };
  const letters = LETTERS.map((l) => l[0]);
  for (let i = 0; i < n; i++) {
    switch (slug) {
      case "letter-sounds": { const [l, w, e] = LETTERS[Math.floor(r() * LETTERS.length)];
        push({ prompt: `Which letter makes the first sound in “${w}” ${e}?`, say: `${w}. ${w}.`, options: opts(l, letters, r) }, { answer: l, explain: `“${w}” starts with the sound of the letter ${l.toUpperCase()}.` }); break; }
      case "beginning-sounds": { const [l, w, e] = LETTERS[Math.floor(r() * LETTERS.length)];
        push({ prompt: `Listen. What is the beginning sound?`, say: w, show: e, options: opts(l, letters, r) }, { answer: l, explain: `${w} begins with ${l}: ${l}-${w.slice(1)}.` }); break; }
      case "ending-sounds": { const [w, e] = CVC[Math.floor(r() * CVC.length)]; const l = w.at(-1)!;
        push({ prompt: `Listen. What is the ending sound?`, say: w, show: e, options: opts(l, CVC.map((c) => c[0].at(-1)!).concat(letters), r) }, { answer: l, explain: `${w} ends with ${l}.` }); break; }
      case "short-vowels": { const [w, e] = CVC[Math.floor(r() * CVC.length)]; const v = w[1];
        push({ prompt: `Fill the missing vowel: ${w[0]} _ ${w[2]}`, say: w, show: e, options: opts(v, ["a", "e", "i", "o", "u"], r) }, { answer: v, explain: `${w} has the short “${v}” sound in the middle.` }); break; }
      case "cvc-blending": { const [w, e] = CVC[Math.floor(r() * CVC.length)]; const wrong = [w[0] + VOWEL_SWAP[w[1]] + w[2], CVC[Math.floor(r() * CVC.length)][0]];
        push({ prompt: `Blend the sounds: ${w.split("").join(" – ")}`, say: w.split("").join("... "), options: opts(w, wrong.concat(CVC.map((c) => c[0])), r) }, { answer: w, explain: `${w.split("").join(" + ")} blends into “${w}” ${e}.` }); break; }
      case "segmenting": { const words: [string, number][] = [["cat", 3], ["ship", 3], ["frog", 4], ["sun", 3], ["fish", 3], ["stop", 4], ["chick", 3], ["at", 2], ["up", 2], ["crab", 4]]; const [w, s] = words[Math.floor(r() * words.length)];
        push({ prompt: `How many sounds do you hear in “${w}”?`, say: w, options: opts(String(s), ["1", "2", "3", "4", "5"], r) }, { answer: String(s), explain: `“${w}” has ${s} sounds. Two letters like sh or ck make one sound.` }); break; }
      case "rhyming": { const set = RHYMES[Math.floor(r() * RHYMES.length)]; const [a, b] = pickN(set, 2, r); const others = RHYMES.filter((x) => x !== set).flat();
        push({ prompt: `Which word rhymes with “${a}”?`, say: a, options: opts(b, others, r) }, { answer: b, explain: `“${a}” and “${b}” end with the same sound.` }); break; }
      case "digraphs": { const [d, w, e] = DIGRAPHS[Math.floor(r() * DIGRAPHS.length)];
        push({ prompt: `Which two letters make the special sound in this word?`, say: w, show: e, options: opts(d, DIGRAPH_SET, r) }, { answer: d, explain: `In “${w}”, the letters ${d} work together to make one sound.` }); break; }
      case "blends": { const [b, w, e] = BLENDS[Math.floor(r() * BLENDS.length)];
        push({ prompt: `Which blend does this word start with?`, say: w, show: e, options: opts(b, BLEND_SET, r) }, { answer: b, explain: `“${w}” starts with the blend ${b}: you can hear both sounds.` }); break; }
      case "long-vowels": { const [short, long, e] = MAGIC_E[Math.floor(r() * MAGIC_E.length)];
        push({ prompt: `Listen and pick the word you hear.`, say: long, show: e, options: shuffle([long, short], r) }, { answer: long, explain: `Magic e at the end makes the vowel say its name: ${short} → ${long}.` }); break; }
      case "syllables": { const [w, s] = SYLLABLES[Math.floor(r() * SYLLABLES.length)];
        push({ prompt: `Clap the beats! How many syllables in “${w}”?`, say: w, options: opts(String(s), ["1", "2", "3", "4"], r) }, { answer: String(s), explain: `“${w}” has ${s} beat${s > 1 ? "s" : ""}.` }); break; }
      case "decoding": { const all = [...CVC, ...MAGIC_E.map((m) => [m[1], m[2]] as [string, string])]; const [w, e] = all[Math.floor(r() * all.length)];
        push({ prompt: `Read the word: ${w.toUpperCase()}. Which picture is it?`, options: opts(e, all.map((a) => a[1]), r) }, { answer: e, explain: `${w.toUpperCase()} is ${e}. Sound it out: ${w.split("").join("-")}.` }); break; }
      default: return { questions: [], key: [] };
    }
  }
  return { questions: qs, key };
}

/** Units open by demonstrated ability only (never grade): the first unit is always open, each next one after 60%+ on the previous. */
export function unitState(_band: number, best: Record<string, number>) {
  let prevPassed = true;
  return UNITS.map((u) => {
    const score = best[u.slug] ?? null;
    const open = prevPassed;
    prevPassed = open && (score ?? 0) >= 60;
    return { ...u, best: score, open, passed: (score ?? 0) >= 60 };
  });
}
