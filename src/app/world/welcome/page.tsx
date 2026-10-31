import { requireChild } from "@/server/session";
import { query } from "@/server/db";
import { Welcome } from "./Welcome";
import { activeThemes } from "@/server/themes";

export const metadata = { title: "Welcome, Explorer!" };
export default async function WelcomePage() {
  const child = await requireChild();
  const kingdoms = await query<{ slug: string; title: string; emoji: string; art: string; description: string }>(`select slug, title, emoji, art, description from kingdoms where active order by sort_order`);
  const themes = (await activeThemes()).map((t) => ({ slug: t.slug, name: t.name, emoji: t.emoji, swatches: [t.tokens.primary, t.tokens.secondary, t.tokens.pink, t.tokens.reward] }));
  return <Welcome name={child.display_name} kingdoms={kingdoms} themes={themes} />;
}
