/**
 * Child-facing economy: two currencies only.
 *   XP         = learning progress (levels). Never spent.
 *   VIBE COINS = reward shopping power.
 * Magic Crystals are retired from the child interface: content priced or rewarded in crystals is converted to coins at
 * this fixed rate. Existing crystal balances and history stay in the database untouched.
 */
export const CRYSTAL_TO_COINS = 25;
export const coinPrice = (coins: number, crystals = 0) => coins + crystals * CRYSTAL_TO_COINS;
export const XP_EXPLAINER = "XP = Your learning progress";
export const COINS_EXPLAINER = "VIBE COINS = Your reward shopping power";
