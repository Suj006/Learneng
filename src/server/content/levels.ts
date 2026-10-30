/**
 * PING VIBE progression: 250 initial levels in 10 tiers of 25. Generated once into
 * `learning_levels`; admins can append more rows (the engine supports any count).
 *
 * Balance: XP to go from level n → n+1 is 120 + 7·(n−1). With a typical active day
 * (~350–450 XP) a child reaches Level 25 in ~2 weeks, Level 100 in ~4 months and
 * Level 250 in ~1.5–2 years — always a next goal, never an impossible one.
 * Every 10th level adds a gentle mastery gate (8 mastered words per 10 levels) so
 * levels reflect real learning, not only clicking.
 */
export const TIERS = [
  "Word Explorer", "Vocabulary Adventurer", "Sentence Builder", "Grammar Champion", "Story Creator",
  "Speaking Star", "Language Wizard", "English Legend", "Master Word Guardian", "Grand English Champion",
];
export const LEVELS_PER_TIER = 25;
export const INITIAL_LEVELS = 250;

export const xpStep = (n: number) => 120 + 7 * (n - 1);
export function minXpFor(level: number) {
  let total = 0;
  for (let n = 1; n < level; n++) total += xpStep(n);
  return total;
}

const COSTUMES = [
  ["🧢", "Explorer Cap"], ["🎓", "Scholar Cap"], ["🤠", "Ranger Hat"], ["👒", "Garden Hat"], ["⛑️", "Rescue Helmet"],
  ["🥽", "Lab Goggles"], ["👓", "Reading Specs"], ["🪖", "Adventure Helmet"], ["🎀", "Starlight Bow"], ["👑", "Royal Crown"],
];
const MAGIC = [
  ["🪄", "Word Wand"], ["🔮", "Crystal Orb"], ["🗝️", "Golden Key"], ["📜", "Ancient Scroll"], ["🧭", "Story Compass"],
  ["💎", "Grammar Gem"], ["🪔", "Wish Lamp"], ["⏳", "Time Hourglass"], ["🔭", "Star Telescope"], ["📯", "Echo Horn"],
];
const DECOR = [
  ["🌈", "Rainbow Bridge"], ["🏰", "Castle Tower"], ["⛲", "Wishing Fountain"], ["🌳", "Word Tree"], ["🎡", "Sky Wheel"],
  ["🗼", "Lighthouse"], ["🏯", "Sunrise Pagoda"], ["🎪", "Story Circus Tent"], ["🛸", "Starship Landing Pad"], ["🌋", "Volcano Garden"],
];
const PETS50 = [["🪶", "Peacock Feather Relic"], ["🐚", "Ocean Song Shell"], ["🦁", "Lion Heart Medal"], ["💠", "Dragon Crystal"], ["🌟", "Golden Star Relic"]];
const THEMES50 = [["🌌", "Aurora Sky", "theme-aurora"], ["🍭", "Candy Clouds", "theme-candy"], ["🌋", "Volcano Glow", "theme-volcano"], ["🪐", "Deep Cosmos", "theme-cosmos"], ["🏆", "Champion Gold", "theme-gold"]];

export interface LevelSeed {
  id: number; name: string; tier: number; tier_name: string; min_xp: number; min_words_mastered: number;
  milestone: number; reward_coins: number; reward_slugs: string[]; special_mission: string | null; description: string;
}
export interface LevelRewardSeed { slug: string; title: string; category: string; emoji: string; cost_coins: number; description: string; min_level: number; level_exclusive: boolean }

export function buildLevels(count = INITIAL_LEVELS) {
  const levels: LevelSeed[] = [];
  const rewards: LevelRewardSeed[] = [];
  let c10 = 0;
  for (let n = 1; n <= count; n++) {
    const tier = Math.min(TIERS.length, Math.floor((n - 1) / LEVELS_PER_TIER) + 1);
    const tierName = TIERS[tier - 1] ?? `Legend Tier ${tier}`;
    const milestone = n % 50 === 0 ? 50 : n % 25 === 0 ? 25 : n % 10 === 0 ? 10 : n % 5 === 0 ? 5 : 0;
    const slugs: string[] = [];
    let coins = 0;
    let mission: string | null = null;

    if (milestone === 5) coins = 25;
    if (milestone === 10) {
      coins = 40;
      const pool = [COSTUMES, MAGIC, DECOR][c10 % 3];
      const [emoji, title] = pool[Math.floor(c10 / 3) % pool.length];
      const cat = ["costume", "magic_object", "decoration"][c10 % 3];
      const slug = `lvl${n}-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
      rewards.push({ slug, title, category: cat, emoji, cost_coins: 0, description: `Exclusive Level ${n} reward.`, min_level: n, level_exclusive: true });
      slugs.push(slug);
      c10++;
    }
    if (milestone === 25 || milestone === 50) {
      coins = milestone === 50 ? 150 : 100;
      const [emoji, title] = COSTUMES[(n / 25) % COSTUMES.length];
      const slug = `lvl${n}-tier-${title.toLowerCase().replace(/[^a-z]+/g, "-")}`;
      rewards.push({ slug, title: `${title} of ${tierName}`, category: "costume", emoji, cost_coins: 0, description: `Exclusive costume for reaching Level ${n}.`, min_level: n, level_exclusive: true });
      slugs.push(slug);
      mission = `Special Mission: ${TIERS[Math.min(TIERS.length - 1, tier)] ?? "Legend"} Trial — a mixed-skill boss battle to celebrate Level ${n}!`;
    }
    if (milestone === 50) {
      const i = n / 50 - 1;
      const [pe, pt] = PETS50[i % PETS50.length];
      const [te, tt, tslug] = THEMES50[i % THEMES50.length];
      const [de, dt] = DECOR[(i + 5) % DECOR.length];
      rewards.push({ slug: `lvl${n}-relic`, title: pt, category: "magic_object", emoji: pe, cost_coins: 0, description: `Legendary relic for Level ${n}.`, min_level: n, level_exclusive: true });
      rewards.push({ slug: tslug, title: tt, category: "theme", emoji: te, cost_coins: 0, description: `Exclusive background for Level ${n}.`, min_level: n, level_exclusive: true });
      rewards.push({ slug: `lvl${n}-kingdom-${dt.toLowerCase().replace(/[^a-z]+/g, "-")}`, title: `Golden ${dt}`, category: "decoration", emoji: de, cost_coins: 0, description: `Kingdom decoration for Level ${n}.`, min_level: n, level_exclusive: true });
      slugs.push(`lvl${n}-relic`, tslug, `lvl${n}-kingdom-${dt.toLowerCase().replace(/[^a-z]+/g, "-")}`);
    }
    levels.push({
      id: n,
      name: `${tierName} ${((n - 1) % LEVELS_PER_TIER) + 1}`,
      tier, tier_name: tierName,
      min_xp: minXpFor(n),
      min_words_mastered: Math.floor(n / 10) * 8,
      milestone, reward_coins: coins, reward_slugs: slugs, special_mission: mission,
      description: n === 1 ? "Your adventure begins!" : milestone ? `Milestone level! ${milestone >= 25 ? "A new tier of rewards awaits." : "Bonus rewards unlocked."}` : `Keep going, ${tierName}!`,
    });
  }
  return { levels, rewards };
}
