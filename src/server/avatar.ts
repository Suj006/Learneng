import "server-only";
import { one, query } from "./db";

export interface Avatar { skin: string; hair: string; hair_color: string; outfit: string; shoes: string; accessory: string | null; background: string; expression: string; magic_object: string | null; celebration: string }
export const SKIN_TONES: Record<string, string> = { "tone-1": "#FFE0C7", "tone-2": "#F6C9A0", "tone-3": "#D9A066", "tone-4": "#B57A4A", "tone-5": "#8D5524", "tone-6": "#5C3A1E" };
export const HAIR_COLORS = ["#2B1B12", "#5A3A22", "#A0642B", "#E0B04A", "#B83B3B", "#1E1E2E", "#7047FF", "#39D5E8"];
const SLOT: Record<string, keyof Avatar> = { hair: "hair", outfit: "outfit", shoes: "shoes", accessory: "accessory", costume: "accessory", background: "background", expression: "expression", magic_object: "magic_object", animation: "celebration" };

export async function getAvatar(childId: string): Promise<Avatar> {
  let a = await one<Avatar>(`select skin, hair, hair_color, outfit, shoes, accessory, background, expression, magic_object, celebration from child_avatars where child_id = $1`, [childId]);
  if (!a) {
    await query(`insert into child_avatars (child_id) values ($1) on conflict do nothing`, [childId]);
    a = await one<Avatar>(`select skin, hair, hair_color, outfit, shoes, accessory, background, expression, magic_object, celebration from child_avatars where child_id = $1`, [childId]);
  }
  return a!;
}

/** Saves an avatar after checking every chosen item is owned (starter or earned). */
export async function saveAvatar(childId: string, next: Avatar) {
  if (!SKIN_TONES[next.skin]) return "Pick a skin tone from the palette.";
  if (!HAIR_COLORS.includes(next.hair_color)) return "Pick a hair colour from the palette.";
  const chosen = [next.hair, next.outfit, next.shoes, next.background, next.expression, next.celebration, next.accessory, next.magic_object].filter(Boolean) as string[];
  const owned = await query<{ slug: string; category: string }>(
    `select r.slug, r.category from rewards r join child_rewards c on c.slug = r.slug and c.child_id = $1 where r.slug = any($2::text[])`, [childId, chosen]);
  const ownedMap = new Map(owned.map((o) => [o.slug, o.category]));
  for (const [slug, field] of [[next.hair, "hair"], [next.outfit, "outfit"], [next.shoes, "shoes"], [next.background, "background"], [next.expression, "expression"], [next.celebration, "celebration"], [next.accessory, "accessory"], [next.magic_object, "magic_object"]] as const) {
    if (!slug) continue;
    const cat = ownedMap.get(slug);
    if (!cat || SLOT[cat] !== field) return "You can only wear items you've unlocked.";
  }
  await query(
    `insert into child_avatars (child_id, skin, hair, hair_color, outfit, shoes, accessory, background, expression, magic_object, celebration, updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, now())
     on conflict (child_id) do update set skin=$2, hair=$3, hair_color=$4, outfit=$5, shoes=$6, accessory=$7, background=$8, expression=$9, magic_object=$10, celebration=$11, updated_at=now()`,
    [childId, next.skin, next.hair, next.hair_color, next.outfit, next.shoes, next.accessory, next.background, next.expression, next.magic_object, next.celebration]);
  return null;
}
