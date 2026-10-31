import Landing from "@/components/landing/Landing";
import { currentChild } from "@/server/session";
import { discover, homeMe } from "@/server/home";
import { activeThemes } from "@/server/themes";

export const dynamic = "force-dynamic";

/** Public homepage; a signed-in child gets a personal welcome and words for their level. */
export default async function Home() {
  const child = await currentChild().catch(() => null);
  const me = child ? await homeMe(child) : null;
  const [d, themes] = await Promise.all([
    discover(me?.band ?? 2),
    activeThemes(),
  ]);
  return <Landing me={me} discover={d} themes={themes.map((t) => ({ slug: t.slug, name: t.name, emoji: t.emoji, swatches: [t.tokens.primary, t.tokens.secondary, t.tokens.pink, t.tokens.reward] }))} />;
}
