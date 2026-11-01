/**
 * WORD SCENES — original contextual vocabulary environments (PING VIBE-authored text; themes informed by the Cambridge
 * reference analysis, no Cambridge artwork, wording or exercises reused). Pure data + checking helpers (unit-tested).
 * Exploring a scene never adds "new words" to the child's daily five: it is contextual practice.
 */
export interface SceneItem { word: string; emoji: string; x: number; y: number; meaning: string; young: string; older: string }
export interface SentenceTask { level: "young" | "older"; tiles: string[]; answers: string[]; hint: string }
export interface SceneQuestion { level: "young" | "older"; q: string; options: string[]; answer: string }
export interface WordScene {
  slug: string; title: string; emoji: string; who: "max" | "lexi" | "grammy" | "speaky" | "story"; intro: string; theme: string;
  sky: string; ground: string; realLife: string | null; items: SceneItem[]; sentences: SentenceTask[]; questions: SceneQuestion[];
  describe: { young: string; older: string; keywords: string[] };
}

export const SCENES: WordScene[] = [
  {
    slug: "toy-shop", title: "Toy Shop Adventure", emoji: "🧸", who: "max", theme: "shopping", sky: "#FFE7F3", ground: "#F6C66B", realLife: "mall",
    intro: "Welcome to Tinku's Toy Shop! Tap the toys to hear their names.",
    items: [
      { word: "teddy bear", emoji: "🧸", x: 12, y: 30, meaning: "a soft toy bear", young: "The teddy bear is soft.", older: "A fluffy teddy bear sits on the top shelf, waiting for a hug." },
      { word: "kite", emoji: "🪁", x: 32, y: 14, meaning: "a toy that flies in the wind on a long string", young: "I fly my kite.", older: "The bright kite hangs from the ceiling, ready for the kite festival." },
      { word: "robot", emoji: "🤖", x: 52, y: 32, meaning: "a machine that can move and do jobs", young: "The robot can walk.", older: "The silver robot beeps and waves its arms when you press a button." },
      { word: "puzzle", emoji: "🧩", x: 72, y: 30, meaning: "a game where you fit pieces together", young: "I like this puzzle.", older: "This puzzle has a hundred pieces, so it will take patience to finish." },
      { word: "drum", emoji: "🥁", x: 86, y: 52, meaning: "a musical instrument you hit to make a beat", young: "Boom! I hit the drum.", older: "A boy is tapping a toy drum loudly, and the shopkeeper smiles." },
      { word: "doll", emoji: "🪆", x: 22, y: 60, meaning: "a toy that looks like a small person", young: "The doll has a red dress.", older: "The wooden dolls fit inside each other, from the biggest to the smallest." },
      { word: "ball", emoji: "⚽", x: 44, y: 70, meaning: "a round toy you kick, throw or catch", young: "Kick the ball!", older: "A football has rolled under the table, and a puppy is chasing it." },
      { word: "comic", emoji: "📚", x: 62, y: 62, meaning: "a book that tells a story with pictures", young: "I read a comic.", older: "Two friends are reading a funny comic about a superhero monkey." },
      { word: "skates", emoji: "🛼", x: 80, y: 78, meaning: "boots with wheels for gliding", young: "My skates are fast.", older: "The new skates have pink wheels and soft straps." },
      { word: "shopkeeper", emoji: "🧑‍💼", x: 92, y: 24, meaning: "a person who owns or works in a shop", young: "The shopkeeper is kind.", older: "The friendly shopkeeper helps children choose the perfect toy." },
    ],
    sentences: [
      { level: "young", tiles: ["I", "like", "the", "robot."], answers: ["I like the robot."], hint: "Start with “I”." },
      { level: "older", tiles: ["The", "kite", "is", "hanging", "from", "the", "ceiling."], answers: ["The kite is hanging from the ceiling."], hint: "Who? → The kite. What is it doing?" },
    ],
    questions: [
      { level: "young", q: "Which toy flies in the wind?", options: ["kite", "drum", "doll"], answer: "kite" },
      { level: "young", q: "What do you hit to make a beat?", options: ["puzzle", "drum", "ball"], answer: "drum" },
      { level: "older", q: "Which toy needs patience to finish?", options: ["skates", "puzzle", "teddy bear"], answer: "puzzle" },
      { level: "older", q: "Who helps children choose a toy?", options: ["the robot", "the shopkeeper", "the puppy"], answer: "the shopkeeper" },
    ],
    describe: { young: "Say or type the name of one toy you can see.", older: "Describe your favourite toy in the shop in two sentences. Why do you like it?", keywords: ["teddy", "bear", "kite", "robot", "puzzle", "drum", "doll", "ball", "comic", "skates", "shopkeeper"] },
  },
  {
    slug: "birthday-party", title: "Birthday Party", emoji: "🎂", who: "story", theme: "celebration", sky: "#FFF3D6", ground: "#F7B7C9", realLife: "birthday",
    intro: "It's Meera's birthday party! Find all the party things.",
    items: [
      { word: "cake", emoji: "🎂", x: 50, y: 52, meaning: "a sweet baked food for celebrations", young: "The cake is big.", older: "A chocolate cake with eight candles stands in the middle of the table." },
      { word: "candles", emoji: "🕯️", x: 50, y: 36, meaning: "sticks of wax that give light when lit", young: "Blow the candles!", older: "Meera takes a deep breath and blows out all the candles at once." },
      { word: "balloons", emoji: "🎈", x: 14, y: 16, meaning: "colourful rubber bags filled with air", young: "Look at the balloons.", older: "Bunches of red and yellow balloons are tied to every chair." },
      { word: "present", emoji: "🎁", x: 80, y: 66, meaning: "a gift you give someone", young: "This present is for you.", older: "The present is wrapped in shiny paper with a big blue bow." },
      { word: "guests", emoji: "🧑‍🤝‍🧑", x: 22, y: 64, meaning: "people invited to a party", young: "The guests are happy.", older: "The guests arrive at five o'clock and say “Happy birthday!”" },
      { word: "music", emoji: "🎵", x: 86, y: 20, meaning: "sounds and songs that people play or sing", young: "We dance to the music.", older: "Cheerful music plays while everyone dances in a circle." },
      { word: "juice", emoji: "🧃", x: 34, y: 46, meaning: "a drink made from fruit", young: "I drink juice.", older: "There is cold mango juice in paper cups for every guest." },
      { word: "hat", emoji: "🥳", x: 66, y: 28, meaning: "something you wear on your head", young: "I have a party hat.", older: "Everyone wears a pointy party hat with a gold star." },
      { word: "grandparents", emoji: "👵", x: 70, y: 74, meaning: "the parents of your mother or father", young: "My grandparents are here.", older: "Meera's grandparents clap and sing the loudest of all." },
      { word: "invitation", emoji: "💌", x: 8, y: 78, meaning: "a card asking someone to come to an event", young: "I got an invitation.", older: "The invitation said: “Please come to my party on Saturday!”" },
    ],
    sentences: [
      { level: "young", tiles: ["The", "cake", "is", "big."], answers: ["The cake is big."], hint: "Start with “The”." },
      { level: "older", tiles: ["Meera", "blows", "out", "the", "candles", "on", "her", "cake."], answers: ["Meera blows out the candles on her cake."], hint: "Who? Meera. What does she do?" },
    ],
    questions: [
      { level: "young", q: "What do you blow out on a cake?", options: ["balloons", "candles", "juice"], answer: "candles" },
      { level: "young", q: "What is a gift called?", options: ["present", "hat", "music"], answer: "present" },
      { level: "older", q: "Which card asks people to come to the party?", options: ["an invitation", "a comic", "a ticket"], answer: "an invitation" },
      { level: "older", q: "Who are the parents of your mother or father?", options: ["guests", "grandparents", "cousins"], answer: "grandparents" },
    ],
    describe: { young: "Say or type one thing you see at the party.", older: "Write two sentences about what people are doing at the party.", keywords: ["cake", "candle", "balloon", "present", "gift", "guest", "music", "dance", "juice", "hat", "grandparent", "invitation"] },
  },
  {
    slug: "doctors-clinic", title: "Doctor's Clinic", emoji: "🩺", who: "grammy", theme: "health", sky: "#E6F6FF", ground: "#CFEFE3", realLife: "clinic",
    intro: "Welcome to Dr. Kapoor's clinic (pretend play). Learn the words for how we feel.",
    items: [
      { word: "doctor", emoji: "🧑‍⚕️", x: 84, y: 30, meaning: "a person who helps sick people get better", young: "The doctor is kind.", older: "The doctor listens carefully and asks, “How are you feeling today?”" },
      { word: "nurse", emoji: "👩‍⚕️", x: 64, y: 28, meaning: "a person who cares for patients", young: "The nurse helps me.", older: "The nurse writes each patient's name and checks their temperature." },
      { word: "headache", emoji: "🤕", x: 18, y: 40, meaning: "a pain in your head", young: "He has a headache.", older: "Too much screen time gave Arjun a headache, so he is resting his eyes." },
      { word: "cough", emoji: "😷", x: 36, y: 56, meaning: "to push air out of your throat with a noise", young: "She has a cough.", older: "A girl with a cough covers her mouth with her elbow to protect others." },
      { word: "stomach", emoji: "🫃", x: 52, y: 66, meaning: "the part of your body where food goes", young: "My stomach hurts.", older: "After eating too many sweets, his stomach feels uncomfortable." },
      { word: "medicine", emoji: "💊", x: 74, y: 60, meaning: "something that helps you get well", young: "A grown-up gives me medicine.", older: "Only take medicine that a doctor or a parent gives you." },
      { word: "thermometer", emoji: "🌡️", x: 60, y: 46, meaning: "a tool that measures temperature", young: "This is a thermometer.", older: "The thermometer shows thirty-eight degrees, so she has a slight fever." },
      { word: "waiting room", emoji: "🪑", x: 26, y: 76, meaning: "a room where you sit until it is your turn", young: "We sit in the waiting room.", older: "The waiting room has comfy chairs, picture books and a fish tank." },
      { word: "shoulder", emoji: "💪", x: 42, y: 30, meaning: "the part of your body where your arm joins it", young: "My shoulder hurts.", older: "He hurt his shoulder playing cricket, so the doctor checks it gently." },
      { word: "better", emoji: "😊", x: 88, y: 74, meaning: "healthier than before", young: "I feel better now.", older: "With rest and water, everyone will feel better soon." },
    ],
    sentences: [
      { level: "young", tiles: ["I", "feel", "better", "now."], answers: ["I feel better now."], hint: "Start with “I”." },
      { level: "older", tiles: ["The", "nurse", "checks", "my", "temperature", "with", "a", "thermometer."], answers: ["The nurse checks my temperature with a thermometer."], hint: "Who checks? What does she use?" },
    ],
    questions: [
      { level: "young", q: "Who helps sick people get better?", options: ["doctor", "pilot", "farmer"], answer: "doctor" },
      { level: "young", q: "A pain in your head is a…", options: ["cough", "headache", "stomach"], answer: "headache" },
      { level: "older", q: "What does a thermometer measure?", options: ["weight", "temperature", "height"], answer: "temperature" },
      { level: "older", q: "Where do you wait for your turn?", options: ["the waiting room", "the kitchen", "the playground"], answer: "the waiting room" },
    ],
    describe: { young: "Say or type one word about the clinic.", older: "Pretend you are at the clinic. Tell the doctor how you feel in two sentences.", keywords: ["doctor", "nurse", "headache", "cough", "stomach", "medicine", "thermometer", "waiting", "shoulder", "better", "feel", "hurt"] },
  },
  {
    slug: "hotel", title: "Hotel Adventure", emoji: "🏨", who: "max", theme: "travel", sky: "#EEF0FF", ground: "#E9D8B4", realLife: "hotel",
    intro: "You've arrived at the Sea Breeze Hotel! Explore the lobby.",
    items: [
      { word: "reception", emoji: "🛎️", x: 18, y: 42, meaning: "the desk where guests check in", young: "Ring the bell at reception.", older: "At reception, the manager gives each family a key and a map." },
      { word: "key", emoji: "🔑", x: 30, y: 60, meaning: "a small object that opens a lock", young: "Here is your key.", older: "Keep the room key safe — you need it to open your door." },
      { word: "lift", emoji: "🛗", x: 50, y: 30, meaning: "a machine that carries people between floors", young: "We go up in the lift.", older: "The lift takes guests from the ground floor to the fifth floor." },
      { word: "stairs", emoji: "🪜", x: 66, y: 44, meaning: "steps that go up and down", young: "I walk up the stairs.", older: "If the lift is busy, you can climb the stairs to the first floor." },
      { word: "suitcase", emoji: "🧳", x: 40, y: 76, meaning: "a bag with a handle for carrying clothes when you travel", young: "My suitcase is blue.", older: "A boy pulls his heavy suitcase on wheels across the shiny floor." },
      { word: "towel", emoji: "🧺", x: 82, y: 26, meaning: "a soft cloth for drying yourself", young: "Dry your hands with a towel.", older: "Fresh towels are folded neatly beside the swimming pool." },
      { word: "swimming pool", emoji: "🏊", x: 84, y: 66, meaning: "a large tank of water for swimming", young: "I swim in the pool.", older: "The swimming pool on the roof has a wonderful view of the sea." },
      { word: "map", emoji: "🗺️", x: 58, y: 64, meaning: "a drawing that shows where places are", young: "Look at the map.", older: "A tourist studies a map of the city to plan her day." },
      { word: "upstairs", emoji: "⬆️", x: 70, y: 16, meaning: "on a higher floor", young: "My room is upstairs.", older: "The restaurant is upstairs, and the gym is downstairs." },
      { word: "manager", emoji: "🧑‍💼", x: 10, y: 22, meaning: "the person in charge of a place", young: "The manager smiles.", older: "The hotel manager makes sure every guest is comfortable." },
    ],
    sentences: [
      { level: "young", tiles: ["Here", "is", "your", "key."], answers: ["Here is your key."], hint: "Start with “Here”." },
      { level: "older", tiles: ["The", "lift", "takes", "us", "to", "the", "fifth", "floor."], answers: ["The lift takes us to the fifth floor."], hint: "What takes us? Where to?" },
    ],
    questions: [
      { level: "young", q: "What opens your room door?", options: ["key", "towel", "map"], answer: "key" },
      { level: "young", q: "What do you dry yourself with?", options: ["suitcase", "towel", "stairs"], answer: "towel" },
      { level: "older", q: "Where do guests check in?", options: ["at reception", "in the pool", "on the roof"], answer: "at reception" },
      { level: "older", q: "Which word means “on a higher floor”?", options: ["downstairs", "upstairs", "outside"], answer: "upstairs" },
    ],
    describe: { young: "Say or type one thing you see in the hotel.", older: "Describe the hotel lobby in two sentences, using upstairs, lift or reception.", keywords: ["reception", "key", "lift", "stairs", "suitcase", "towel", "pool", "map", "upstairs", "downstairs", "manager", "floor"] },
  },
  {
    slug: "countryside", title: "Countryside Explorer", emoji: "🌾", who: "lexi", theme: "nature", sky: "#D7F2FF", ground: "#A8E08A", realLife: "park",
    intro: "Let's explore the countryside, from the farm to the waterfall!",
    items: [
      { word: "farm", emoji: "🏡", x: 14, y: 52, meaning: "land where people grow food and keep animals", young: "Cows live on the farm.", older: "The farm has fields of wheat, a red barn and a busy tractor." },
      { word: "tractor", emoji: "🚜", x: 30, y: 70, meaning: "a strong vehicle used on farms", young: "The tractor is green.", older: "A farmer drives the tractor slowly to plough the field." },
      { word: "field", emoji: "🌾", x: 46, y: 60, meaning: "an open area of land, often with crops or grass", young: "The field is big.", older: "Golden fields of rice stretch all the way to the hills." },
      { word: "river", emoji: "🏞️", x: 60, y: 78, meaning: "a long flow of water to the sea or a lake", young: "Fish swim in the river.", older: "A wooden bridge crosses the river where ducks are swimming." },
      { word: "mountain", emoji: "⛰️", x: 74, y: 18, meaning: "a very high hill", young: "The mountain is tall.", older: "Snow covers the top of the mountain even in summer." },
      { word: "waterfall", emoji: "💦", x: 88, y: 44, meaning: "water falling from a high place", young: "The waterfall is loud.", older: "The waterfall crashes onto the rocks and makes a rainbow in the spray." },
      { word: "forest", emoji: "🌲", x: 56, y: 32, meaning: "a large area full of trees", young: "Birds live in the forest.", older: "Monkeys chatter in the forest, swinging from branch to branch." },
      { word: "bridge", emoji: "🌉", x: 72, y: 64, meaning: "something built over a river or road so you can cross", young: "We walk on the bridge.", older: "The old stone bridge has stood over the river for a hundred years." },
      { word: "leaves", emoji: "🍃", x: 40, y: 34, meaning: "the flat green parts of a plant (one leaf, many leaves)", young: "The leaves are green.", older: "In autumn, the leaves change colour and fall to the ground." },
      { word: "rainbow", emoji: "🌈", x: 26, y: 14, meaning: "an arc of colours in the sky after rain", young: "I see a rainbow.", older: "A rainbow appears when sunlight shines through raindrops." },
    ],
    sentences: [
      { level: "young", tiles: ["The", "mountain", "is", "tall."], answers: ["The mountain is tall."], hint: "Start with “The”." },
      { level: "older", tiles: ["A", "farmer", "drives", "the", "tractor", "across", "the", "field."], answers: ["A farmer drives the tractor across the field."], hint: "Who drives? What? Where?" },
    ],
    questions: [
      { level: "young", q: "Where do cows live?", options: ["on a farm", "in a lift", "in a shop"], answer: "on a farm" },
      { level: "young", q: "What is a very high hill?", options: ["river", "mountain", "bridge"], answer: "mountain" },
      { level: "older", q: "What helps you cross a river?", options: ["a bridge", "a tractor", "a rainbow"], answer: "a bridge" },
      { level: "older", q: "What is the plural of “leaf”?", options: ["leafs", "leaves", "leafes"], answer: "leaves" },
    ],
    describe: { young: "Say or type one thing you see in the countryside.", older: "Describe a walk in the countryside in two sentences. What can you see and hear?", keywords: ["farm", "tractor", "field", "river", "mountain", "waterfall", "forest", "bridge", "leaf", "leaves", "rainbow", "tree"] },
  },
  {
    slug: "weather-station", title: "Weather Station", emoji: "⛅", who: "speaky", theme: "weather", sky: "#CFE9FF", ground: "#BEE3B8", realLife: "weather",
    intro: "You're the weather reporter today! Learn the weather words.",
    items: [
      { word: "sunny", emoji: "☀️", x: 14, y: 18, meaning: "bright with sunshine", young: "It is sunny today.", older: "It will be sunny all morning, so remember your cap and water bottle." },
      { word: "cloudy", emoji: "☁️", x: 36, y: 14, meaning: "with lots of clouds in the sky", young: "It is cloudy.", older: "By afternoon the sky will turn cloudy and grey." },
      { word: "rainy", emoji: "🌧️", x: 58, y: 18, meaning: "with a lot of rain", young: "It is rainy. Take an umbrella!", older: "The monsoon brings rainy days, so the streets are full of puddles." },
      { word: "windy", emoji: "🌬️", x: 80, y: 16, meaning: "with a lot of wind", young: "It is windy. My kite flies!", older: "It is so windy that the leaves are dancing across the playground." },
      { word: "storm", emoji: "⛈️", x: 24, y: 44, meaning: "very bad weather with strong wind, rain and thunder", young: "There is a storm.", older: "During a storm, stay indoors and keep away from tall trees." },
      { word: "snow", emoji: "❄️", x: 46, y: 46, meaning: "soft white ice that falls from the sky", young: "Snow is cold.", older: "In the mountains, snow covers the roofs like a white blanket." },
      { word: "temperature", emoji: "🌡️", x: 68, y: 46, meaning: "how hot or cold something is", young: "The temperature is hot.", older: "The temperature will drop to twelve degrees tonight." },
      { word: "umbrella", emoji: "☂️", x: 86, y: 54, meaning: "something you hold over your head in the rain", young: "Open your umbrella.", older: "Pack an umbrella — the forecast says showers later." },
      { word: "forecast", emoji: "📺", x: 30, y: 74, meaning: "a report saying what the weather will be like", young: "Watch the forecast.", older: "Today's forecast: sunny in the morning, thunderstorms in the evening." },
      { word: "thunder", emoji: "⚡", x: 58, y: 74, meaning: "the loud noise in the sky during a storm", young: "Boom! Thunder is loud.", older: "We counted the seconds between the lightning and the thunder." },
    ],
    sentences: [
      { level: "young", tiles: ["It", "is", "sunny", "today."], answers: ["It is sunny today."], hint: "Start with “It”." },
      { level: "older", tiles: ["Tomorrow", "it", "will", "be", "cloudy", "and", "windy."], answers: ["Tomorrow it will be cloudy and windy.", "It will be cloudy and windy tomorrow."], hint: "Start with when: “Tomorrow…”" },
    ],
    questions: [
      { level: "young", q: "What do you need when it is rainy?", options: ["an umbrella", "skates", "a kite"], answer: "an umbrella" },
      { level: "young", q: "Which weather is bright with sunshine?", options: ["snowy", "sunny", "stormy"], answer: "sunny" },
      { level: "older", q: "What does a forecast tell you?", options: ["the time", "what the weather will be like", "a story"], answer: "what the weather will be like" },
      { level: "older", q: "What is the loud noise in a storm?", options: ["thunder", "snow", "temperature"], answer: "thunder" },
    ],
    describe: { young: "What is the weather like today? Say or type one weather word.", older: "Give a short weather report for tomorrow (two sentences) like a TV reporter.", keywords: ["sunny", "cloudy", "rainy", "rain", "windy", "wind", "storm", "snow", "temperature", "degrees", "umbrella", "forecast", "thunder", "hot", "cold"] },
  },
  {
    slug: "my-town", title: "My Town", emoji: "🏙️", who: "max", theme: "community", sky: "#E2F1FF", ground: "#D9D9D9", realLife: "asking-help",
    intro: "Let's walk around town and find the important places.",
    items: [
      { word: "market", emoji: "🧺", x: 14, y: 60, meaning: "a place where people buy and sell food and things", young: "We buy mangoes at the market.", older: "The busy market sells fresh vegetables, flowers and spices." },
      { word: "library", emoji: "📚", x: 34, y: 36, meaning: "a place where you borrow books", young: "I read at the library.", older: "You can borrow three books at a time from the town library." },
      { word: "bank", emoji: "🏦", x: 54, y: 34, meaning: "a place that keeps people's money safe", young: "Money is safe in the bank.", older: "The bank is opposite the market, next to the post office." },
      { word: "hospital", emoji: "🏥", x: 76, y: 36, meaning: "a place where doctors and nurses care for sick people", young: "The hospital helps people.", older: "An ambulance drives quickly to the hospital with its lights flashing." },
      { word: "post office", emoji: "📮", x: 88, y: 60, meaning: "a place where you send letters and parcels", young: "I post a letter.", older: "At the post office, Nani buys stamps to send a parcel." },
      { word: "bus stop", emoji: "🚏", x: 30, y: 76, meaning: "a place where buses stop for passengers", young: "Wait at the bus stop.", older: "We wait at the bus stop until bus number twelve arrives." },
      { word: "traffic lights", emoji: "🚦", x: 50, y: 62, meaning: "lights that tell cars and people when to stop or go", young: "Red means stop.", older: "Always cross the road when the traffic lights show the green walking sign." },
      { word: "park", emoji: "🌳", x: 66, y: 74, meaning: "a green public place to play and walk", young: "We play in the park.", older: "The park has swings, a pond and a path for cycling." },
      { word: "police officer", emoji: "👮", x: 46, y: 82, meaning: "a person whose job is to keep people safe", young: "The police officer helps us.", older: "If you are lost, a police officer in uniform can help you." },
      { word: "opposite", emoji: "↔️", x: 70, y: 16, meaning: "on the other side, facing something", young: "The bank is opposite the shop.", older: "The library is opposite the park, across the main road." },
    ],
    sentences: [
      { level: "young", tiles: ["We", "play", "in", "the", "park."], answers: ["We play in the park."], hint: "Start with “We”." },
      { level: "older", tiles: ["The", "bank", "is", "opposite", "the", "market."], answers: ["The bank is opposite the market."], hint: "Which place? Where is it?" },
    ],
    questions: [
      { level: "young", q: "Where do you borrow books?", options: ["library", "bank", "market"], answer: "library" },
      { level: "young", q: "What does a red traffic light mean?", options: ["go", "stop", "jump"], answer: "stop" },
      { level: "older", q: "Where would you send a parcel?", options: ["the post office", "the park", "the bus stop"], answer: "the post office" },
      { level: "older", q: "If you are lost, who in uniform can help?", options: ["a police officer", "a stranger in a car", "nobody"], answer: "a police officer" },
    ],
    describe: { young: "Say or type one place in the town.", older: "Give directions in two sentences: how do you get from the bus stop to the library?", keywords: ["market", "library", "bank", "hospital", "post", "bus", "traffic", "park", "police", "opposite", "left", "right", "straight", "next"] },
  },
  {
    slug: "holiday-planner", title: "Holiday Planner", emoji: "🏖️", who: "story", theme: "travel", sky: "#CDEBFF", ground: "#FCE3A6", realLife: "travel-desk",
    intro: "Plan a dream holiday! Discover holiday words.",
    items: [
      { word: "beach", emoji: "🏖️", x: 20, y: 72, meaning: "sand next to the sea", young: "We play on the beach.", older: "We build a sandcastle on the beach and watch the waves." },
      { word: "aeroplane", emoji: "✈️", x: 76, y: 14, meaning: "a vehicle with wings that flies", young: "The aeroplane flies high.", older: "Our aeroplane takes off at nine o'clock and lands in Goa at eleven." },
      { word: "passport", emoji: "🛂", x: 60, y: 40, meaning: "an official book you need to travel to other countries", young: "Keep your passport safe.", older: "Before flying abroad, check that your passport is in your bag." },
      { word: "camera", emoji: "📷", x: 40, y: 46, meaning: "a device for taking photos", young: "Smile for the camera!", older: "Dadi takes photos of the sunset with her camera." },
      { word: "boat", emoji: "⛵", x: 52, y: 70, meaning: "a vehicle that travels on water", young: "The boat is on the sea.", older: "We sail on a small boat to see the dolphins." },
      { word: "tent", emoji: "⛺", x: 84, y: 64, meaning: "a shelter made of cloth for camping", young: "We sleep in a tent.", older: "Camping in a tent under the stars is an adventure." },
      { word: "souvenir", emoji: "🗿", x: 30, y: 26, meaning: "something you keep to remember a place", young: "I buy a souvenir.", older: "I bought a little wooden elephant as a souvenir for my best friend." },
      { word: "journey", emoji: "🛤️", x: 12, y: 40, meaning: "travelling from one place to another", young: "The journey is long.", older: "The train journey through the hills took six hours." },
      { word: "sunglasses", emoji: "🕶️", x: 70, y: 34, meaning: "dark glasses that protect your eyes from the sun", young: "I wear sunglasses.", older: "Wear sunglasses and sunscreen when the sun is strong." },
      { word: "destination", emoji: "📍", x: 90, y: 30, meaning: "the place you are travelling to", young: "Goa is our destination.", older: "Our destination is a hill station famous for its tea gardens." },
    ],
    sentences: [
      { level: "young", tiles: ["We", "play", "on", "the", "beach."], answers: ["We play on the beach."], hint: "Start with “We”." },
      { level: "older", tiles: ["Our", "destination", "is", "a", "village", "near", "the", "sea."], answers: ["Our destination is a village near the sea."], hint: "Start with “Our destination…”" },
    ],
    questions: [
      { level: "young", q: "What flies in the sky?", options: ["boat", "aeroplane", "tent"], answer: "aeroplane" },
      { level: "young", q: "Where is the sand next to the sea?", options: ["beach", "bank", "library"], answer: "beach" },
      { level: "older", q: "What do you need to travel to another country?", options: ["a passport", "a souvenir", "a tent"], answer: "a passport" },
      { level: "older", q: "What is a “destination”?", options: ["the place you travel to", "a kind of boat", "a holiday photo"], answer: "the place you travel to" },
    ],
    describe: { young: "Say or type one thing you would take on holiday.", older: "Plan your dream holiday in two or three sentences: where, how you will travel and what you will do.", keywords: ["beach", "aeroplane", "plane", "passport", "camera", "boat", "tent", "souvenir", "journey", "sunglasses", "destination", "travel", "visit", "train"] },
  },
];

export const levelFor = (band: number): "young" | "older" => (band <= 2 ? "young" : "older");
const norm = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z' ]+/g, " ").replace(/\s+/g, " ").trim();
export function checkSentence(task: SentenceTask, built: string) { return task.answers.some((a) => norm(a) === norm(built)); }
/** Counts how many scene words a child used in their own description (inflections count: leaf/leaves, rain/rainy). */
export function describeScore(keywords: string[], text: string) {
  const t = ` ${norm(text)} `;
  const used = keywords.filter((k) => new RegExp(`\\b${k.replace(/[^a-z]/g, "")}`, "i").test(t));
  const words = (t.match(/[a-z']+/g) ?? []).length;
  return { used: [...new Set(used)], words };
}
