import type { Scenario, Turn } from "@/lib/reallife";

/**
 * VIBE REAL LIFE — 12 more everyday scenarios (seeded as data; admins can add more without code).
 * Each turn accepts several natural answers; the model answer and every "great" option are unit-tested.
 */
const WANT = ["i would like", "i'd like", "can i have", "could i have", "may i have", "i want", "i need", "can i get", "could i get", "i'll have"];
const ASK = ["where is", "where's", "how do i", "can you tell me", "could you tell me", "which", "what time", "when does", "when is", "how much", "is there", "do you have"];
const YES = ["yes", "yeah", "sure", "okay", "ok", "that's fine", "that is fine", "no problem", "great"];

/** Compact turn builder: great / ok / retry options are generated around the model answer. */
function T(say: string, task: string, any: string[], model: string, reply: string, hint: string, ok: string, wrong: string, extra: Partial<Turn> = {}): Turn {
  return {
    say, task, any, model, reply, hint,
    options: [{ text: model, emoji: "✅", result: "great" }, { text: ok, emoji: "🙂", result: "ok", tip: `Try a full sentence, like: “${model}”` }, { text: wrong, emoji: "🙃", result: "retry", tip: hint }],
    ...extra,
  };
}

export const REAL_LIFE_MORE: Scenario[] = [
  {
    slug: "post-office", title: "Post Office", emoji: "📮", place: "City Post Office", theme: "community", band_min: 1,
    character: { name: "Mr. Das the postal clerk", emoji: "👨‍💼", voice: "grammy" },
    intro: "You want to send a birthday card to your grandmother.", mission: "Buy a stamp, ask how long it takes, and send your card.",
    words: [{ word: "stamp", emoji: "📮" }, { word: "envelope", emoji: "✉️" }, { word: "letter", emoji: "💌" }, { word: "parcel", emoji: "📦" }, { word: "address", emoji: "🏠" }],
    phrases: ["I would like to send this card, please.", "How much is a stamp?", "How long will it take?", "Thank you for your help."],
    turns: [
      T("Good morning! How can I help you today?", "Say what you want to send.", ["send", "post", ...WANT], "I would like to send this card, please.", "Of course! Let me weigh your {item}.", "Say what you want to do, like “I would like to send this card, please.”", "Card.", "I want ice cream.", { need: ["card", "letter", "parcel", "envelope", "package"], polite: true }),
      T("You need one stamp. It costs ten rupees.", "Pay or ask a question about the stamp.", ["here you are", "here is", "here's", "ten rupees", "okay", "thank you"], "Here you are. Thank you!", "Thank you! Your stamp is on.", "Give the money politely, like “Here you are, thank you!”", "Okay.", "No stamps ever!", { polite: true }),
      T("Where should the card go?", "Say where it is going.", ["to", "it's going to", "it is going to", "please send it to"], "It is going to my grandmother in Chennai.", "Lovely! It will reach your grandmother soon.", "Say the place, like “It is going to my grandmother in Chennai.”", "Chennai.", "I like football.", { need: ["grandmother", "grandma", "grandfather", "grandpa", "aunt", "uncle", "friend", "chennai", "delhi", "mumbai", "kolkata", "bengaluru", "pune", "school", "cousin"] }),
      T("Oh! The card has no address written on it yet.", "Solve the problem politely.", ["sorry", "i will write", "i'll write", "can i borrow", "could i borrow", "pen"], "Sorry! Could I borrow a pen to write the address, please?", "Here is a pen. Now it's ready to go!", "Say sorry and ask for a pen, like “Sorry! Could I borrow a pen, please?”", "Pen.", "Throw it away!", { adv: true, polite: true }),
    ],
    reflection: ["You explained what you wanted to send.", "You paid politely with “Here you are”.", "You solved a problem by asking for help."],
  },
  {
    slug: "bus-station", title: "Bus Station", emoji: "🚌", place: "Central Bus Stand", theme: "travel", band_min: 1,
    character: { name: "Asha at the ticket counter", emoji: "👩‍✈️", voice: "lexi" },
    intro: "You are going to the zoo by bus with your family.", mission: "Find the right bus, buy tickets and ask about the time.",
    words: [{ word: "bus", emoji: "🚌" }, { word: "ticket", emoji: "🎫" }, { word: "platform", emoji: "🚏" }, { word: "time", emoji: "⏰" }, { word: "zoo", emoji: "🦁" }],
    phrases: ["Which bus goes to the zoo?", "Two tickets, please.", "What time does it leave?", "Thank you!"],
    turns: [
      T("Hello! Where would you like to go?", "Ask about the bus to the zoo.", [...ASK, "i want to go", "we want to go", "i would like to go", "bus to"], "Which bus goes to the zoo, please?", "Bus number 12 goes to the zoo.", "Ask which bus, like “Which bus goes to the zoo, please?”", "Zoo.", "I am a bus.", { need: ["zoo"], polite: true }),
      T("How many tickets do you need?", "Ask for the tickets.", [...WANT, "tickets", "ticket"], "Can I have three tickets, please?", "Here are your tickets!", "Say a number, like “Three tickets, please.”", "Three.", "No tickets, no!", { need: ["one", "two", "three", "four", "five", "1", "2", "3", "4", "5"], polite: true }),
      T("Any other question?", "Ask when the bus leaves.", ["what time", "when does", "when is", "when will"], "What time does the bus leave?", "It leaves at ten o'clock from platform two.", "Ask about the time, like “What time does the bus leave?”", "Time?", "I like purple."),
      T("Sorry, bus 12 is late today. Bus 15 also stops near the zoo.", "Decide what to do.", [...YES, "we will take", "we'll take", "i will take", "bus 15", "we can wait", "i can wait"], "That's fine. We will take bus 15, thank you.", "Good idea! Bus 15 is just arriving.", "Choose the other bus or wait, like “We will take bus 15, thank you.”", "Okay.", "I'm going home forever!", { adv: true, polite: true }),
    ],
    reflection: ["You asked which bus to take.", "You bought tickets with a number and “please”.", "You chose a new plan when the bus was late."],
  },
  {
    slug: "hotel", title: "Hotel Reception", emoji: "🏨", place: "Seaside Hotel", theme: "travel", band_min: 2,
    character: { name: "Mr. Thomas the receptionist", emoji: "🤵", voice: "grammy" },
    intro: "Your family has arrived at a hotel for a holiday.", mission: "Check in, ask about breakfast and the swimming pool.",
    words: [{ word: "reception", emoji: "🛎️" }, { word: "room", emoji: "🛏️" }, { word: "key", emoji: "🔑" }, { word: "breakfast", emoji: "🍳" }, { word: "pool", emoji: "🏊" }],
    phrases: ["We have a booking.", "What time is breakfast?", "Where is the swimming pool?", "Thank you very much."],
    turns: [
      T("Welcome to Seaside Hotel! How can I help you?", "Say you have a room booked.", ["we have a booking", "we have booked", "booking", "reservation", "we booked", "check in"], "Hello! We have a booking for the Kumar family.", "Welcome! Here is the key to room 204.", "Say you have a booking, like “We have a booking for the Kumar family.”", "Booking.", "Where is the moon?"),
      T("Is there anything you would like to know?", "Ask about breakfast.", ["what time", "when is", "when does", "where is"], "What time is breakfast, please?", "Breakfast is from seven to ten in the garden restaurant.", "Ask about the time, like “What time is breakfast?”", "Breakfast?", "I hate holidays.", { need: ["breakfast"], polite: true }),
      T("Anything else?", "Ask where the swimming pool is.", ASK, "Where is the swimming pool?", "The pool is on the ground floor, next to the garden.", "Ask where, like “Where is the swimming pool?”", "Pool?", "Give me a dragon.", { need: ["pool", "swimming"] }),
      T("I'm sorry, the pool is closed for cleaning this morning.", "Respond and ask a follow-up question.", ["when will", "when does", "what time", "when can", "is it open", "will it open"], "Oh, that's okay. When will it open again?", "It opens again at two o'clock this afternoon.", "Ask when it opens, like “When will it open again?”", "Oh.", "That's terrible!", { adv: true }),
    ],
    reflection: ["You checked in by giving your family name.", "You asked “What time…?” and “Where is…?” questions.", "You asked a follow-up question to solve a problem."],
  },
  {
    slug: "airport", title: "Airport Check-in", emoji: "✈️", place: "Skyway Airport", theme: "travel", band_min: 2,
    character: { name: "Neha at check-in", emoji: "👩‍✈️", voice: "lexi" },
    intro: "You're flying to visit your cousins!", mission: "Check in your bag, choose a seat and find your gate.",
    words: [{ word: "passport", emoji: "🛂" }, { word: "suitcase", emoji: "🧳" }, { word: "seat", emoji: "💺" }, { word: "gate", emoji: "🚪" }, { word: "boarding pass", emoji: "🎟️" }],
    phrases: ["Here is my ticket.", "Can I have a window seat, please?", "Which gate is it?", "Thank you!"],
    turns: [
      T("Good morning! May I see your tickets, please?", "Hand over the tickets politely.", ["here you are", "here is", "here are", "here's", "sure"], "Here are our tickets.", "Thank you! Please put your suitcase on the belt.", "Give the tickets, like “Here are our tickets.”", "Tickets.", "No, they're mine!"),
      T("Would you like a window seat or an aisle seat?", "Choose a seat.", [...WANT, "window", "aisle", "i prefer"], "Can I have a window seat, please?", "Sure! You have seat 14A by the window.", "Choose one, like “Can I have a window seat, please?”", "Window.", "I'll sit on the wing.", { need: ["window", "aisle"], polite: true }),
      T("Here is your boarding pass. Any questions?", "Ask which gate to go to.", ASK, "Which gate do we go to?", "Gate 7. Boarding starts at nine thirty.", "Ask about the gate, like “Which gate do we go to?”", "Gate?", "Is lunch free forever?", { need: ["gate"] }),
      T("Your suitcase is a little too heavy. You can move some things to your hand bag.", "Respond to the problem.", [...YES, "i will move", "i'll move", "we will move", "we'll move", "let me"], "Okay, I will move my books to my bag. Thank you!", "Perfect, now it's just right. Have a great flight!", "Say what you will do, like “Okay, I will move my books to my bag.”", "Fine.", "Throw the suitcase!", { adv: true, polite: true }),
    ],
    reflection: ["You handed over tickets with “Here are…”.", "You made a choice with “Can I have…, please?”", "You solved a heavy-bag problem calmly."],
  },
  {
    slug: "new-friend", title: "Meeting a New Friend", emoji: "🤝", place: "Summer Camp", theme: "social", band_min: 1,
    character: { name: "Arjun, a new camper", emoji: "🧒", voice: "max" },
    intro: "It's the first day of summer camp and someone new sits next to you.", mission: "Introduce yourself, ask questions and make a plan to play.",
    words: [{ word: "name", emoji: "🏷️" }, { word: "hobby", emoji: "🎨" }, { word: "favourite", emoji: "⭐" }, { word: "together", emoji: "👫" }, { word: "game", emoji: "🎲" }],
    phrases: ["Hi! My name is ___.", "What's your name?", "What do you like to do?", "Do you want to play together?"],
    turns: [
      T("Hi! I'm Arjun. I'm new here.", "Introduce yourself.", ["my name is", "i am", "i'm", "call me"], "Hi Arjun! My name is Priya. Nice to meet you.", "Nice to meet you too!", "Say your name, like “Hi! My name is Priya.”", "Priya.", "Go away."),
      T("What do you like to do?", "Talk about a hobby.", ["i like", "i love", "i enjoy", "my favourite", "my hobby"], "I like drawing and playing football.", "Wow, I like football too!", "Say what you like, like “I like drawing.”", "Drawing.", "Bananas are yellow."),
      T("What about you? Ask me something!", "Ask Arjun a question.", ["what", "do you", "where", "how", "which", "who"], "What is your favourite game?", "My favourite game is hide and seek!", "Ask a question, like “What is your favourite game?”", "Game?", "I don't talk."),
      T("I don't know anyone else here. I feel a bit shy.", "Be kind and invite Arjun to play.", ["do you want to", "would you like to", "let's", "let us", "come and", "you can play"], "Don't worry! Do you want to play football with us?", "Yes, please! Thank you for being so kind.", "Invite him, like “Do you want to play with us?”", "Play.", "That's your problem.", { adv: true }),
    ],
    reflection: ["You introduced yourself with “My name is…”.", "You shared your hobbies and asked questions.", "Kind words help new friends feel welcome."],
  },
  {
    slug: "asking-help", title: "Asking for Help", emoji: "🙋", place: "Busy Market", theme: "safety", band_min: 1,
    character: { name: "Officer Meena", emoji: "👮‍♀️", voice: "grammy" },
    intro: "You and your dad got separated in a busy market. You remember what to do: find a helper in uniform.", mission: "Ask a police officer for help calmly and give useful information.",
    words: [{ word: "help", emoji: "🆘" }, { word: "lost", emoji: "😟" }, { word: "police officer", emoji: "👮" }, { word: "wait", emoji: "⏳" }, { word: "safe", emoji: "🛡️" }],
    phrases: ["Excuse me, can you help me, please?", "I can't find my dad.", "He is wearing a blue shirt.", "Thank you for helping me."],
    turns: [
      T("Hello! Are you okay?", "Ask for help.", ["help me", "can you help", "could you help", "i need help", "please help", "i am lost", "i'm lost"], "Excuse me, can you help me, please? I am lost.", "Of course. You did the right thing coming to me.", "Ask for help, like “Can you help me, please? I am lost.”", "Help.", "I want a toy."),
      T("Who were you with?", "Say who you were with.", ["my", "i was with", "i came with", "i can't find", "i cannot find"], "I was with my dad, but I can't find him.", "Don't worry, we will find your dad.", "Say who, like “I was with my dad.”", "Dad.", "With a dragon.", { need: ["dad", "father", "mum", "mom", "mother", "grandma", "grandpa", "aunt", "uncle", "brother", "sister", "family", "papa", "mummy"] }),
      T("What does he look like?", "Describe the person.", ["he is wearing", "she is wearing", "he has", "she has", "he is", "she is", "wearing"], "He is wearing a blue shirt and glasses.", "Thank you, that really helps. Please wait here with me.", "Describe clothes, like “He is wearing a blue shirt.”", "Blue.", "He is a giraffe."),
      T("I'll make an announcement. Can you remember your dad's phone number? Only tell a police officer or a trusted helper like me.", "Answer calmly. (In this pretend game, say you know it or that it's on your card.)", ["yes", "i know it", "it is on", "it's on", "my card", "i don't remember", "i do not remember"], "Yes, it is on the card in my pocket.", "Great thinking! Your dad is coming now.", "Say where the number is, like “Yes, it is on the card in my pocket.”", "Yes.", "I'll shout loudly forever.", { adv: true }),
    ],
    reflection: ["You asked a uniformed helper for help.", "You described the person clearly.", "Staying calm and waiting in one place keeps you safe."],
  },
  {
    slug: "food-counter", title: "Ordering at a Food Counter", emoji: "🍔", place: "Food Court", theme: "food", band_min: 1,
    character: { name: "Sam at the counter", emoji: "🧑‍🍳", voice: "speaky" },
    intro: "You're hungry at the mall's food court!", mission: "Order a meal, choose a size, and ask about the wait.",
    words: [{ word: "meal", emoji: "🍱" }, { word: "small", emoji: "🔹" }, { word: "large", emoji: "🔷" }, { word: "token", emoji: "🔢" }, { word: "napkin", emoji: "🧻" }],
    phrases: ["I'll have ___, please.", "A small one, please.", "How long will it take?", "Can I have a napkin?"],
    turns: [
      T("Hi there! What can I get you?", "Order your food.", WANT, "I'll have a veggie burger, please.", "One {item}, coming up!", "Order something, like “I'll have a veggie burger, please.”", "Burger.", "Nothing, bye!", { need: ["burger", "pizza", "wrap", "noodles", "fries", "dosa", "sandwich", "rice", "roll", "momos", "pasta", "biryani", "taco"], polite: true }),
      T("Would you like a small or a large drink with that?", "Choose a size.", [...WANT, "small", "large", "medium", "no thank you", "a small", "a large"], "A small lemonade, please.", "Great, a small one it is.", "Choose a size, like “A small lemonade, please.”", "Small.", "A giant bucket!", { need: ["small", "large", "medium", "no"], polite: true }),
      T("Here's your token: number 25.", "Ask how long it will take.", ["how long", "when will", "how many minutes", "what time"], "Thank you! How long will it take?", "About ten minutes. We'll call your number.", "Ask about the wait, like “How long will it take?”", "Long?", "Give me a pony."),
      T("Oops, we've run out of lemonade. Would you like orange juice or water instead?", "Choose again politely.", [...WANT, ...YES, "orange juice", "water", "instead"], "That's okay. Orange juice, please.", "Thanks for understanding! Orange juice for you.", "Pick another drink, like “Orange juice, please.”", "Juice.", "This is the worst!", { adv: true, need: ["orange", "water", "juice"], polite: true }),
    ],
    reflection: ["You ordered with “I'll have…, please.”", "You chose a size.", "You stayed polite when your drink ran out."],
  },
  {
    slug: "sports-club", title: "Sports Club", emoji: "🏸", place: "Sunrise Sports Club", theme: "sports", band_min: 2,
    character: { name: "Coach Kavya", emoji: "🧑‍🏫", voice: "max" },
    intro: "You want to join a sports class at the club.", mission: "Choose a sport, ask about the timing and what to bring.",
    words: [{ word: "coach", emoji: "🧑‍🏫" }, { word: "class", emoji: "🏫" }, { word: "racket", emoji: "🏸" }, { word: "shoes", emoji: "👟" }, { word: "practice", emoji: "🔁" }],
    phrases: ["I would like to join the ___ class.", "When is the class?", "What should I bring?", "Thank you, Coach!"],
    turns: [
      T("Welcome! Which sport would you like to learn?", "Choose a sport.", [...WANT, "i would like to join", "i'd like to join", "i want to join", "i want to learn", "i'd like to learn", "i would like to learn", "i like"], "I would like to join the badminton class.", "Great choice! Badminton is lots of fun.", "Say a sport, like “I would like to join the badminton class.”", "Badminton.", "I want to sleep.", { need: ["badminton", "football", "cricket", "swimming", "tennis", "basketball", "skating", "chess", "karate", "athletics", "table tennis", "volleyball", "hockey"] }),
      T("Do you have any questions?", "Ask when the class is.", ["when is", "when does", "what time", "which day", "how often"], "When is the class, please?", "Every Saturday at eight in the morning.", "Ask about the time, like “When is the class?”", "When?", "Is the coach a robot?", { polite: true }),
      T("Anything else?", "Ask what to bring.", ["what should i bring", "what do i need", "what do i bring", "do i need", "should i bring"], "What should I bring to the class?", "Bring sports shoes, a water bottle and a racket.", "Ask, like “What should I bring?”", "Bring?", "I'll bring my cat."),
      T("The Saturday class is full. There is space on Sunday at nine. Is that okay?", "Respond and confirm.", [...YES, "sunday", "i can come", "i will come", "i'll come"], "Yes, Sunday at nine is fine. Thank you!", "Wonderful! See you on Sunday.", "Confirm, like “Yes, Sunday is fine. Thank you!”", "Yes.", "No, never!", { adv: true, polite: true }),
    ],
    reflection: ["You said what you wanted to join.", "You asked “When…?” and “What should I bring?”", "You agreed to a new time politely."],
  },
  {
    slug: "bookshop", title: "Bookshop", emoji: "📚", place: "Story Corner Bookshop", theme: "shopping", band_min: 1,
    character: { name: "Mrs. Fernandes the bookseller", emoji: "👩‍🦳", voice: "story" },
    intro: "You have gift money to buy a new book!", mission: "Ask for a kind of book, check the price and pay.",
    words: [{ word: "book", emoji: "📖" }, { word: "adventure", emoji: "🗺️" }, { word: "comic", emoji: "💥" }, { word: "price", emoji: "🏷️" }, { word: "author", emoji: "✍️" }],
    phrases: ["Do you have any adventure books?", "How much is this book?", "I'll take it, please.", "Thank you!"],
    turns: [
      T("Hello! Are you looking for something special?", "Ask for a type of book.", [...ASK, ...WANT, "i am looking for", "i'm looking for"], "Do you have any adventure books?", "Yes! The {item} books are on this shelf.", "Ask for a kind of book, like “Do you have any adventure books?”", "Adventure.", "I want a sandwich.", { need: ["adventure", "comic", "mystery", "animal", "science", "space", "dinosaur", "fairy", "story", "poetry", "funny", "puzzle", "history"] }),
      T("This one is called “The Lost Map”. Would you like it?", "Ask the price.", ["how much", "what is the price", "what's the price", "how much is", "how much does"], "How much is this book?", "It is one hundred and fifty rupees.", "Ask the price, like “How much is this book?”", "Money?", "Books are boring."),
      T("Would you like to buy it?", "Say you will buy it.", ["i'll take", "i will take", "yes", "i would like", "i'd like", "i want"], "Yes, I'll take it, please.", "Here you go. Happy reading!", "Say yes politely, like “Yes, I'll take it, please.”", "Yes.", "I'll steal it.", { polite: true }),
      T("Oh, you only have one hundred rupees. There is a smaller edition for ninety-nine rupees.", "Respond to the problem.", [...YES, "i will take", "i'll take", "the smaller", "that one"], "That's fine. I will take the smaller one, thank you.", "Perfect! And here's a free bookmark.", "Choose the smaller book, like “I will take the smaller one, thank you.”", "Okay.", "Give it for free!", { adv: true, polite: true }),
    ],
    reflection: ["You asked “Do you have…?”", "You checked a price before buying.", "You found a solution when you didn't have enough money."],
  },
  {
    slug: "museum", title: "Museum Visit", emoji: "🏛️", place: "National Science Museum", theme: "learning", band_min: 2,
    character: { name: "Dr. Iyer the guide", emoji: "👨‍🔬", voice: "grammy" },
    intro: "Your class is visiting the science museum.", mission: "Ask the guide questions, follow the rules and share what you learned.",
    words: [{ word: "exhibit", emoji: "🖼️" }, { word: "dinosaur", emoji: "🦕" }, { word: "guide", emoji: "🧑‍🏫" }, { word: "rule", emoji: "📏" }, { word: "fossil", emoji: "🦴" }],
    phrases: ["Excuse me, what is this?", "How old is it?", "Can I take a photo?", "I learned that ___."],
    turns: [
      T("Welcome to the dinosaur hall! What would you like to know?", "Ask a question about the exhibit.", ["what is", "how old", "how big", "where did", "is it", "was it", "what did"], "How old is this dinosaur skeleton?", "It is about sixty-six million years old!", "Ask a question, like “How old is this skeleton?”", "Old?", "Can I ride it?"),
      T("Please remember the museum rules.", "Ask if you may take a photo.", ["can i", "may i", "could i", "is it okay", "am i allowed"], "May I take a photo, please?", "Yes, photos are fine, but no flash please.", "Ask permission, like “May I take a photo, please?”", "Photo.", "I'll touch everything!", { need: ["photo", "picture"], polite: true }),
      T("What was your favourite thing today?", "Share what you learned.", ["i learned", "i learnt", "my favourite", "i liked", "i loved", "i found out"], "My favourite was the fossil. I learned that dinosaurs laid eggs.", "What a great fact to remember!", "Share a fact, like “I learned that dinosaurs laid eggs.”", "Fossil.", "Nothing at all."),
      T("Your friend touched the glass and the alarm beeped! What should you say to the guard?", "Apologise and explain.", ["sorry", "we are sorry", "we're sorry", "it was an accident", "we didn't mean", "we did not mean"], "We are sorry. It was an accident and we won't do it again.", "Thank you for being honest. Enjoy the rest of your visit!", "Say sorry, like “We are sorry. It was an accident.”", "Sorry.", "Run away!", { adv: true }),
    ],
    reflection: ["You asked “How old…?” and “May I…?” questions.", "You shared what you learned.", "Honest apologies make things right."],
  },
  {
    slug: "travel-desk", title: "Travel Information Desk", emoji: "🗺️", place: "Tourist Information Centre", theme: "travel", band_min: 3,
    character: { name: "Mr. Singh at the info desk", emoji: "🧑‍💼", voice: "speaky" },
    intro: "Your family is visiting a new city for the weekend.", mission: "Ask for a map, find a place to visit and get directions.",
    words: [{ word: "map", emoji: "🗺️" }, { word: "directions", emoji: "🧭" }, { word: "fort", emoji: "🏯" }, { word: "opening time", emoji: "🕘" }, { word: "nearby", emoji: "📍" }],
    phrases: ["Could I have a city map, please?", "What can we visit nearby?", "How do we get there?", "Thanks for your help!"],
    turns: [
      T("Hello! Welcome to our city. How can I help?", "Ask for a map.", WANT, "Could I have a city map, please?", "Of course, here is a free map.", "Ask for a map, like “Could I have a city map, please?”", "Map.", "Where is my sandwich?", { need: ["map"], polite: true }),
      T("Is there anything you'd like to visit?", "Ask what you can visit.", ["what can we", "what can i", "what is there", "what's there", "is there", "can you suggest", "could you suggest", "what should we"], "What can we visit nearby?", "The old fort is close, and the lake garden is lovely too.", "Ask for ideas, like “What can we visit nearby?”", "Visit?", "Nothing is interesting."),
      T("The fort is very popular.", "Ask for directions.", ["how do we get", "how do i get", "how can we get", "how can i get", "which way", "how far", "where is"], "How do we get to the fort?", "Take the main road, turn left at the clock tower, and walk five minutes.", "Ask the way, like “How do we get to the fort?”", "Way?", "Fly me there."),
      T("Just so you know, the fort closes at five o'clock today because of a festival.", "Ask a follow-up and plan.", ["what time does it open", "when does it open", "what time does it", "then we will", "we will go", "we'll go", "is it open tomorrow", "can we go"], "Thank you. Then we will go in the morning. What time does it open?", "It opens at nine. Have a wonderful visit!", "Make a plan, like “Then we will go in the morning. What time does it open?”", "Morning.", "That's silly!", { adv: true }),
    ],
    reflection: ["You asked for a map and ideas.", "You asked “How do we get to…?”", "You changed your plan using new information."],
  },
  {
    slug: "presentation", title: "Classroom Presentation", emoji: "🎤", place: "Your Classroom", theme: "school", band_min: 3,
    character: { name: "Ms. Joseph the teacher", emoji: "👩‍🏫", voice: "grammy" },
    intro: "It's your turn to give a short talk about your favourite animal.", mission: "Greet the class, share facts, give your opinion and answer a question.",
    words: [{ word: "presentation", emoji: "🎤" }, { word: "fact", emoji: "💡" }, { word: "habitat", emoji: "🌳" }, { word: "opinion", emoji: "💭" }, { word: "conclusion", emoji: "🏁" }],
    phrases: ["Good morning, everyone. Today I will talk about ___.", "One interesting fact is ___.", "I think ___ because ___.", "Thank you for listening."],
    turns: [
      T("You may begin when you're ready.", "Greet the class and say your topic.", ["today i will talk about", "today i am going to talk about", "i will talk about", "my topic is", "i'm going to talk about", "i am going to talk about"], "Good morning, everyone. Today I will talk about elephants.", "The class is listening carefully.", "Start with a greeting and topic, like “Good morning, everyone. Today I will talk about elephants.”", "Elephants.", "I don't want to."),
      T("Tell us something interesting.", "Share a fact.", ["one interesting fact", "a fact", "did you know", "they live", "they can", "they eat", "it can", "it lives", "it eats"], "One interesting fact is that elephants can remember places for many years.", "Wow, the class looks amazed!", "Share a fact, like “One interesting fact is that elephants can remember places.”", "Big ears.", "I forgot everything."),
      T("What do you think about this animal?", "Give your opinion with a reason.", ["i think", "in my opinion", "i believe", "i feel"], "I think elephants are amazing because they look after their families.", "That's a thoughtful opinion with a reason!", "Use “I think… because…”, like “I think elephants are amazing because they help their families.”", "They're nice.", "Animals are boring."),
      T("A classmate asks: “Why are elephants in danger?”", "Answer the question and end your talk.", ["because", "they are in danger", "people", "thank you for listening"], "Because their forests are getting smaller. Thank you for listening.", "Great answer! The class gives you a big round of applause.", "Answer with “because” and finish, like “Because their forests are getting smaller. Thank you for listening.”", "I don't know.", "Next question!", { adv: true }),
    ],
    reflection: ["You opened with a greeting and your topic.", "You shared a fact and an opinion with “because”.", "You answered a question and thanked your audience."],
  },
];
