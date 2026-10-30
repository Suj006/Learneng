/** Grammar Galaxy missions. Each exercise: question, options, index of answer, GRAMMY hint. */
export interface GrammarExercise { q: string; options: string[]; answer: number; hint: string }
export interface GrammarTopicSeed {
  slug: string; title: string; emoji: string; band_min: number; explanation: string;
  examples: { sentence: string; note: string }[]; exercises: GrammarExercise[];
}

export const GRAMMAR_TOPICS: GrammarTopicSeed[] = [
  {
    slug: "nouns", title: "Nouns", emoji: "🏷️", band_min: 1,
    explanation: "A noun is a NAMING word. It names a person, animal, place or thing. Teacher, cat, Delhi and pencil are all nouns!",
    examples: [
      { sentence: "The **dog** ran to the **park**.", note: "dog = animal, park = place" },
      { sentence: "**Priya** has a red **bag**.", note: "Priya = person, bag = thing" },
      { sentence: "We saw a **rainbow** in the **sky**.", note: "rainbow and sky are things" },
    ],
    exercises: [
      { q: "Which word is a noun?", options: ["run", "apple", "happy", "quickly"], answer: 1, hint: "A noun names a thing you can point at." },
      { q: "Find the noun: 'The bird sings.'", options: ["The", "bird", "sings"], answer: 1, hint: "Which word names an animal?" },
      { q: "Which word names a place?", options: ["school", "jump", "blue", "soft"], answer: 0, hint: "Where do you go every morning?" },
      { q: "Which word is NOT a noun?", options: ["teacher", "table", "sleep", "Mumbai"], answer: 2, hint: "One of these is an action." },
      { q: "Find the noun: 'My grandma makes tasty ladoos.'", options: ["makes", "tasty", "ladoos", "My"], answer: 2, hint: "What does grandma make?" },
    ],
  },
  {
    slug: "pronouns", title: "Pronouns", emoji: "🙋", band_min: 1,
    explanation: "A pronoun takes the place of a noun so we don't repeat it. Instead of 'Riya is kind. Riya helps me', we say 'Riya is kind. SHE helps me.' Pronouns: I, you, he, she, it, we, they.",
    examples: [
      { sentence: "Arjun is tall. **He** plays basketball.", note: "He = Arjun" },
      { sentence: "The cat is hungry. **It** wants milk.", note: "It = the cat" },
      { sentence: "Meera and I are friends. **We** walk to school.", note: "We = Meera and I" },
    ],
    exercises: [
      { q: "Sara likes music. ___ sings every day.", options: ["He", "She", "It", "They"], answer: 1, hint: "Sara is a girl." },
      { q: "The boys are playing. ___ are happy.", options: ["He", "It", "They", "She"], answer: 2, hint: "More than one boy." },
      { q: "My bicycle is new. ___ is red.", options: ["It", "She", "We", "He"], answer: 0, hint: "Use this for a thing." },
      { q: "Rahul and I are cousins. ___ live in Pune.", options: ["They", "We", "He", "You"], answer: 1, hint: "'I' is included!" },
      { q: "Which is a pronoun?", options: ["table", "they", "run", "green"], answer: 1, hint: "It replaces a naming word." },
    ],
  },
  {
    slug: "verbs", title: "Verbs", emoji: "🏃", band_min: 1,
    explanation: "A verb is an ACTION word. It tells us what someone or something does: run, eat, sing, think, write. Every sentence needs a verb!",
    examples: [
      { sentence: "The baby **laughs**.", note: "laughs = action" },
      { sentence: "We **play** cricket after school.", note: "play = action" },
      { sentence: "Birds **fly** high.", note: "fly = action" },
    ],
    exercises: [
      { q: "Which word is a verb?", options: ["swim", "chair", "pretty", "she"], answer: 0, hint: "Which one can you DO?" },
      { q: "Find the verb: 'Tara reads a book.'", options: ["Tara", "reads", "a", "book"], answer: 1, hint: "What is Tara doing?" },
      { q: "The dog ___ loudly.", options: ["table", "barks", "happy", "green"], answer: 1, hint: "What sound does a dog make?" },
      { q: "Which is NOT a verb?", options: ["dance", "write", "window", "climb"], answer: 2, hint: "You can't 'window'!" },
      { q: "Find the verb: 'The children painted a mural.'", options: ["children", "painted", "mural", "The"], answer: 1, hint: "What did the children do?" },
    ],
  },
  {
    slug: "adjectives", title: "Adjectives", emoji: "🎨", band_min: 1,
    explanation: "An adjective is a DESCRIBING word. It tells us more about a noun — its colour, size, shape, feeling or number. 'A BIG, RED balloon.'",
    examples: [
      { sentence: "The **enormous** elephant drank water.", note: "enormous describes elephant" },
      { sentence: "I have **two** **fluffy** kittens.", note: "two (number), fluffy (feel)" },
      { sentence: "The soup is **hot**.", note: "hot describes soup" },
    ],
    exercises: [
      { q: "Which word is an adjective?", options: ["jump", "tiny", "boy", "quickly"], answer: 1, hint: "Which word describes size?" },
      { q: "Find the adjective: 'She wore a yellow dress.'", options: ["She", "wore", "yellow", "dress"], answer: 2, hint: "Which word tells the colour?" },
      { q: "The ___ lion roared.", options: ["brave", "ran", "slowly", "it"], answer: 0, hint: "Pick a describing word." },
      { q: "Which sentence has an adjective?", options: ["He runs.", "It is a shiny coin.", "They eat.", "We go."], answer: 1, hint: "Look for a describing word." },
      { q: "Find the adjective: 'The curious monkey opened the box.'", options: ["curious", "monkey", "opened", "box"], answer: 0, hint: "What kind of monkey?" },
    ],
  },
  {
    slug: "articles", title: "Articles: a, an, the", emoji: "🅰️", band_min: 2,
    explanation: "Use 'a' before consonant sounds (a cat), 'an' before vowel sounds (an apple, an hour), and 'the' for something specific (the sun, the book I lent you).",
    examples: [
      { sentence: "I ate **an** orange and **a** banana.", note: "an + vowel sound, a + consonant sound" },
      { sentence: "**The** moon is bright tonight.", note: "there's only one moon" },
      { sentence: "She waited for **an** hour.", note: "'hour' starts with a vowel SOUND" },
    ],
    exercises: [
      { q: "I saw ___ elephant.", options: ["a", "an", "the"], answer: 1, hint: "'elephant' starts with a vowel sound." },
      { q: "She has ___ umbrella.", options: ["a", "an"], answer: 1, hint: "u-m-brella starts with an 'uh' sound." },
      { q: "___ sun rises in the east.", options: ["A", "An", "The"], answer: 2, hint: "There is only one sun." },
      { q: "He is ___ honest boy.", options: ["a", "an"], answer: 1, hint: "The 'h' in honest is silent!" },
      { q: "I want ___ new pencil.", options: ["a", "an"], answer: 0, hint: "'new' starts with a consonant sound." },
    ],
  },
  {
    slug: "prepositions", title: "Prepositions", emoji: "📦", band_min: 2,
    explanation: "Prepositions tell us WHERE or WHEN something is: in, on, under, behind, between, at, before, after. 'The cat is UNDER the table.'",
    examples: [
      { sentence: "The book is **on** the shelf.", note: "on = position" },
      { sentence: "We play **after** lunch.", note: "after = time" },
      { sentence: "The ball rolled **under** the bed.", note: "under = position" },
    ],
    exercises: [
      { q: "The fish swims ___ the water.", options: ["in", "on", "at"], answer: 0, hint: "The fish is inside the water." },
      { q: "The picture hangs ___ the wall.", options: ["under", "on", "between"], answer: 1, hint: "It's touching the wall's surface." },
      { q: "I sat ___ Riya and Aman.", options: ["between", "under", "in"], answer: 0, hint: "Riya on one side, Aman on the other." },
      { q: "School starts ___ 8 o'clock.", options: ["in", "on", "at"], answer: 2, hint: "Use this for an exact time." },
      { q: "The puppy hid ___ the sofa.", options: ["behind", "after", "at"], answer: 0, hint: "It's hiding at the back." },
    ],
  },
  {
    slug: "punctuation", title: "Punctuation", emoji: "❗", band_min: 2,
    explanation: "Punctuation marks help readers. Start sentences with a capital letter. End with a full stop (.), a question mark (?) or an exclamation mark (!). Use commas (,) in lists.",
    examples: [
      { sentence: "Where is my bag**?**", note: "a question" },
      { sentence: "What a beautiful day**!**", note: "strong feeling" },
      { sentence: "I bought apples**,** mangoes and bananas.", note: "commas in a list" },
    ],
    exercises: [
      { q: "Which sentence is correct?", options: ["where are you going", "Where are you going?", "where are you going?"], answer: 1, hint: "Capital letter + question mark." },
      { q: "Pick the right ending: 'What a lovely garden'", options: [".", "?", "!"], answer: 2, hint: "It shows excitement." },
      { q: "Which sentence uses commas correctly?", options: ["I like red, blue and green.", "I like, red blue and green.", "I, like red blue, and green."], answer: 0, hint: "Commas separate list items." },
      { q: "Which needs a capital letter?", options: ["dog", "monday", "table"], answer: 1, hint: "Days of the week are special names." },
      { q: "Choose the correct one:", options: ["i am happy.", "I am happy.", "I am happy"], answer: 1, hint: "'I' is always capital, and end with a full stop." },
    ],
  },
  {
    slug: "sentence-construction", title: "Building Sentences", emoji: "🧱", band_min: 2,
    explanation: "A sentence needs a SUBJECT (who) and a VERB (does what), and it must make sense. 'The cat (subject) sleeps (verb).' Order matters in English: Subject → Verb → Object.",
    examples: [
      { sentence: "**Ravi** (subject) **kicks** (verb) the ball (object).", note: "S → V → O" },
      { sentence: "**The flowers** **bloom** in spring.", note: "subject + verb + extra detail" },
      { sentence: "**My sister** **loves** chocolate.", note: "S → V → O" },
    ],
    exercises: [
      { q: "Which is a complete sentence?", options: ["The big dog.", "Runs fast.", "The big dog runs fast.", "Fast the runs."], answer: 2, hint: "It needs who + doing what." },
      { q: "Which order is correct?", options: ["Ball the kicked Sam.", "Sam kicked the ball.", "Kicked Sam the ball."], answer: 1, hint: "Subject → Verb → Object." },
      { q: "What is the subject? 'The teacher smiled.'", options: ["The teacher", "smiled"], answer: 0, hint: "WHO smiled?" },
      { q: "Which is NOT a complete sentence?", options: ["Birds sing.", "On the table.", "I am ready."], answer: 1, hint: "Who is doing what?" },
      { q: "Pick the best sentence:", options: ["We went to the zoo yesterday.", "Yesterday zoo we to went.", "Went we zoo."], answer: 0, hint: "Read each aloud — which sounds right?" },
    ],
  },
  {
    slug: "adverbs", title: "Adverbs", emoji: "💨", band_min: 3,
    explanation: "An adverb describes a VERB — HOW, WHEN or WHERE something happens. Many adverbs end in -ly: quickly, softly, happily. Others: soon, here, always.",
    examples: [
      { sentence: "The tortoise walked **slowly**.", note: "how it walked" },
      { sentence: "We will leave **soon**.", note: "when" },
      { sentence: "She sang **beautifully**.", note: "how she sang" },
    ],
    exercises: [
      { q: "Which word is an adverb?", options: ["quick", "quickly", "quickness"], answer: 1, hint: "It describes HOW an action happens." },
      { q: "Find the adverb: 'He whispered softly.'", options: ["He", "whispered", "softly"], answer: 2, hint: "How did he whisper?" },
      { q: "The cheetah ran ___.", options: ["fast", "fastness", "faster than"], answer: 0, hint: "'fast' can describe how it ran." },
      { q: "Which adverb tells WHEN?", options: ["loudly", "yesterday", "carefully"], answer: 1, hint: "Think about time." },
      { q: "Complete: 'She solved the puzzle ___.'", options: ["easy", "easily", "ease"], answer: 1, hint: "Describe the verb 'solved'." },
    ],
  },
  {
    slug: "conjunctions", title: "Conjunctions", emoji: "🔗", band_min: 3,
    explanation: "Conjunctions are JOINING words: and, but, or, so, because. They connect words or ideas. 'I was hungry, SO I ate a sandwich.'",
    examples: [
      { sentence: "I like tea **and** biscuits.", note: "adds" },
      { sentence: "It was raining, **but** we played.", note: "contrast" },
      { sentence: "She smiled **because** she won.", note: "reason" },
    ],
    exercises: [
      { q: "I wanted to play, ___ it was raining.", options: ["and", "but", "or"], answer: 1, hint: "Two opposite ideas." },
      { q: "Do you want juice ___ milk?", options: ["or", "but", "so"], answer: 0, hint: "A choice." },
      { q: "He was tired, ___ he went to bed early.", options: ["because", "so", "or"], answer: 1, hint: "Result of being tired." },
      { q: "We stayed inside ___ it was too hot.", options: ["because", "but", "or"], answer: 0, hint: "Gives the reason." },
      { q: "Which word is a conjunction?", options: ["quickly", "and", "table"], answer: 1, hint: "It joins things." },
    ],
  },
  {
    slug: "tenses", title: "Tenses", emoji: "⏰", band_min: 3,
    explanation: "Tense shows WHEN an action happens. Past: I played. Present: I play / I am playing. Future: I will play.",
    examples: [
      { sentence: "Yesterday I **visited** my grandma.", note: "past" },
      { sentence: "Now I **am reading** a story.", note: "present continuous" },
      { sentence: "Tomorrow we **will go** to the beach.", note: "future" },
    ],
    exercises: [
      { q: "Yesterday, I ___ a kite.", options: ["fly", "flew", "will fly"], answer: 1, hint: "'Yesterday' is the past." },
      { q: "Tomorrow, she ___ her cousins.", options: ["visited", "visits", "will visit"], answer: 2, hint: "'Tomorrow' is the future." },
      { q: "Look! The baby ___.", options: ["is sleeping", "slept", "will sleep"], answer: 0, hint: "Happening right now." },
      { q: "Which sentence is in the past tense?", options: ["We eat lunch.", "We ate lunch.", "We will eat lunch."], answer: 1, hint: "Already happened." },
      { q: "Every morning, he ___ to school.", options: ["walks", "walked", "will walked"], answer: 0, hint: "A habit = simple present." },
    ],
  },
  {
    slug: "subject-verb-agreement", title: "Subject–Verb Agreement", emoji: "🤝", band_min: 3,
    explanation: "The verb must match the subject. One person/thing (he, she, it, the dog) → add -s: 'She runs.' More than one (they, we, the dogs) → no -s: 'They run.'",
    examples: [
      { sentence: "The dog **barks**.", note: "one dog → barks" },
      { sentence: "The dogs **bark**.", note: "many dogs → bark" },
      { sentence: "My friends **are** here.", note: "plural → are" },
    ],
    exercises: [
      { q: "She ___ to music every day.", options: ["listen", "listens"], answer: 1, hint: "She = one person → -s." },
      { q: "The children ___ in the park.", options: ["play", "plays"], answer: 0, hint: "Children = more than one." },
      { q: "My brother ___ cricket.", options: ["love", "loves"], answer: 1, hint: "One brother." },
      { q: "They ___ ready for the trip.", options: ["is", "are"], answer: 1, hint: "They = plural." },
      { q: "The box of crayons ___ on the desk.", options: ["is", "are"], answer: 0, hint: "The subject is 'box' (one), not 'crayons'." },
    ],
  },
  {
    slug: "active-passive", title: "Active & Passive Voice", emoji: "🔄", band_min: 4,
    explanation: "Active voice: the subject DOES the action — 'Ravi wrote the letter.' Passive voice: the subject RECEIVES the action — 'The letter was written by Ravi.' Active is usually clearer; passive is useful when the doer is unknown.",
    examples: [
      { sentence: "Active: The chef **cooked** the meal.", note: "chef does the action" },
      { sentence: "Passive: The meal **was cooked** by the chef.", note: "meal receives the action" },
      { sentence: "Passive: My bike **was stolen**.", note: "doer unknown" },
    ],
    exercises: [
      { q: "Which sentence is passive?", options: ["The cat chased the mouse.", "The mouse was chased by the cat.", "The mouse ran."], answer: 1, hint: "Look for 'was ... by'." },
      { q: "Make it passive: 'Asha painted the picture.'", options: ["The picture painted Asha.", "The picture was painted by Asha.", "Asha was painted by the picture."], answer: 1, hint: "Object becomes subject + was + past participle." },
      { q: "Make it active: 'The match was won by our team.'", options: ["Our team won the match.", "The match won our team.", "Our team was won."], answer: 0, hint: "Who did the winning?" },
      { q: "Which is active?", options: ["The song was sung by the choir.", "The choir sang the song."], answer: 1, hint: "The subject performs the action." },
      { q: "Passive of 'They build houses.'", options: ["Houses are built by them.", "Houses build them.", "Houses were building."], answer: 0, hint: "Present tense → are + built." },
    ],
  },
  {
    slug: "direct-indirect", title: "Direct & Indirect Speech", emoji: "💬", band_min: 4,
    explanation: "Direct speech quotes exact words: She said, \"I am tired.\" Indirect (reported) speech reports them without quotes, usually shifting tense and pronouns: She said that she was tired.",
    examples: [
      { sentence: "Direct: Raj said, \"I like mangoes.\"", note: "exact words in quotes" },
      { sentence: "Indirect: Raj said that he liked mangoes.", note: "I → he, like → liked" },
      { sentence: "Direct: \"Are you coming?\" asked Mom. → Mom asked if I was coming.", note: "questions use if/whether" },
    ],
    exercises: [
      { q: "Indirect of: She said, \"I am happy.\"", options: ["She said that she was happy.", "She said that I am happy.", "She says I was happy."], answer: 0, hint: "I → she, am → was." },
      { q: "Indirect of: He said, \"I will come.\"", options: ["He said that he would come.", "He said that I will come.", "He said he comes."], answer: 0, hint: "will → would." },
      { q: "Which is direct speech?", options: ["Tom said he was late.", "Tom said, \"I am late.\"", "Tom told that he is late."], answer: 1, hint: "Look for quotation marks." },
      { q: "Indirect of: \"Do you like chess?\" she asked me.", options: ["She asked me if I liked chess.", "She asked me do you like chess.", "She said I like chess."], answer: 0, hint: "Questions → asked if…" },
      { q: "Indirect of: The teacher said, \"Open your books.\"", options: ["The teacher told us to open our books.", "The teacher said open your books.", "The teacher opened our books."], answer: 0, hint: "Commands → told … to …" },
    ],
  },
];
