/**
 * Curated grade-wise headwords (not yet enriched). The content pipeline turns
 * each into a full word card (meaning, phonetic, example, synonyms, …) with
 * Claude, validates it, and queues it for admin approval before any child sees it.
 * Category tags drive vocabulary variety (action/descriptive/homophone/…).
 */
const split = (s: string) => s.trim().split(/\s+/).map((w) => w.replace(/_/g, " "));

export const HEADWORDS: Record<1 | 2 | 3 | 4, Record<string, string[]>> = {
  1: {
    everyday: split(`bag bed bell boat bowl box bread brush bus button chair clock coat comb cup cupboard door doll drum fan flag fork gate glass hand home house jam juice key kite lamp leaf letter lock mango map mat mirror nest note orange pan pen pencil pillow plate pot rice road rock roof room rope sand school shoe shop sock soap spoon stone sweet table teeth tent towel toy train truck van wall watch water window`),
    action: split(`bake blow catch climb cook crawl cry cut dance dig draw drink drive eat fall fly give grow hide hop hug kick kiss laugh look open paint play pull push read ride sit skip sleep slide splash stand swim swing talk throw tickle walk wash wave write`),
    descriptive: split(`bright clean dark dirty dry fast full funny furry good hard kind light little long loud new old pretty quiet round shiny short slow soft sour spicy sticky sweet tall thin warm wet yummy`),
    nature: split(`ant bee butterfly cloud cow crab elephant flower frog garden goat grass hen hill horse lion monkey mouse owl parrot peacock pig pond rabbit river sea sheep snail snake snow squirrel tiger tortoise wind zebra`),
  },
  2: {
    everyday: split(`backpack balcony blanket breakfast bucket calendar candle carpet ceiling chalk cushion dinner envelope eraser feather gift hammer helmet jacket kitchen ladder lunchbox medicine notebook parcel picnic pocket poster puzzle ribbon ruler sandwich scissors shelf sticker stool suitcase sweater thermometer ticket tiffin torch umbrella uniform wallet whistle`),
    action: split(`arrive borrow bounce build carry chase cheer choose clap crunch decide discover enjoy fetch float gallop gather giggle glide hurry invite juggle knock learn listen march measure mix nibble notice pour practise promise race reach remember repair scribble search sneeze sparkle squeeze stretch sweep travel visit whistle wiggle wonder`),
    descriptive: split(`afraid angry busy calm cheerful clever colourful crunchy dusty excited fluffy foggy fresh gloomy grumpy healthy hungry icy juicy lazy lonely lucky messy muddy narrow noisy plain proud rough rusty scary silly sleepy smooth sparkly stormy surprised thirsty tidy tired useful wide wild windy wise`),
    homophone: split(`ate eight blue blew flower flour hear here knight night meat meet one won pair pear right write sea see sun son tail tale to two week weak`),
    compound: split(`sunflower rainbow football toothbrush butterfly bedroom cupcake doorbell sunshine snowman popcorn starfish playground goldfish raincoat notebook ladybug`),
  },
  3: {
    everyday: split(`appointment architect audience avenue bakery biography celebration ceremony committee competition costume custom department distance emergency excursion experiment exhibition fortnight headline hospital invitation journal landmark luggage magazine mechanic messenger neighbourhood orchestra passenger pharmacy postcard recipe reporter scholarship souvenir stadium sunscreen telescope tournament volunteer`),
    action: split(`accomplish admire announce approach assemble attempt avoid balance budge capture collapse compare complain concentrate create defend describe disappear encourage escape examine explain flutter gasp glance gobble grumble hesitate identify improve investigate migrate mumble observe organise persuade predict prepare protect recognise rummage scramble shiver stumble suggest surround tremble whimper`),
    descriptive: split(`adventurous ambitious anxious awkward bold brilliant clumsy confident cunning dazzling delicate dreadful elegant energetic exhausted famous fearless ferocious fierce frantic furious gigantic glamorous graceful grateful hilarious humble immense jealous majestic miserable modern patient precious puzzled reliable sensible splendid sturdy thoughtful tremendous unusual vast weary`),
    homophone: split(`allowed aloud bare bear brake break buy by cell sell cereal serial flew flu grate great hole whole mail male peace piece plain plane principal principle stair stare their there weather whether`),
    compound: split(`breakthrough countryside earthquake fingerprint grasshopper handwriting headquarters lighthouse moonlight newspaper overcome rattlesnake skyscraper thunderstorm underground waterfall wheelchair`),
    phrasal_verb: split(`break_down calm_down carry_on cheer_up find_out give_up look_after look_for pick_up put_on run_out set_off take_off turn_off wake_up`),
    idiom: split(`a_piece_of_cake break_the_ice over_the_moon raining_cats_and_dogs under_the_weather`),
  },
  4: {
    academic: split(`abstract accumulate advocate allocate analyse anticipate assess attribute bias capacity circumstance coherent comprehensive concept conclude contradict criteria crucial debate deduce derive dilemma distinguish diverse elaborate emerge emphasise establish evaluate evidence exaggerate excerpt feasible fluctuate fundamental generate hierarchy hypothetical illustrate implement implication imply infer inherent integrate interpret justify legitimate magnitude methodology minimise modify objective obsolete paradox perceive perspective phenomenon precise predominant priority proportion rational reinforce relevant reluctance resolve scenario significant simulate speculate subsequent substantial summarise supplement synthesis tangible theory thorough transform undermine validate verify`),
    descriptive: split(`adamant affluent amiable arduous audacious authentic candid compassionate conscientious conspicuous credible cynical diplomatic eccentric elaborate eminent exemplary exuberant formidable gregarious immaculate impartial impeccable indifferent industrious intrepid lucid melancholy nonchalant obstinate optimistic pessimistic plausible prudent quaint radiant robust scrupulous spontaneous steadfast subtle tranquil vibrant vigilant`),
    action: split(`acknowledge alleviate amplify articulate collaborate commemorate compensate comprehend consolidate contemplate deteriorate disseminate eliminate endeavour enhance flourish formulate hinder illuminate innovate intervene liberate mediate negotiate persevere prioritise reconcile rectify scrutinise substantiate`),
    homophone: split(`affect effect complement compliment council counsel desert dessert stationary stationery`),
    phrasal_verb: split(`bring_about carry_out come_across figure_out get_across look_into point_out put_off rule_out set_up take_after turn_down`),
    idiom: split(`hit_the_nail_on_the_head once_in_a_blue_moon the_ball_is_in_your_court bite_off_more_than_you_can_chew every_cloud_has_a_silver_lining actions_speak_louder_than_words burn_the_midnight_oil cost_an_arm_and_a_leg`),
  },
};

export function headwordRows() {
  const rows: { word: string; band: number; category: string }[] = [];
  const seen = new Set<string>();
  for (const [band, cats] of Object.entries(HEADWORDS)) {
    for (const [category, words] of Object.entries(cats)) {
      for (const w of words) {
        const k = w.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        rows.push({ word: k, band: Number(band), category });
      }
    }
  }
  return rows;
}
