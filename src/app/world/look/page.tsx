import { requireChild } from "@/server/session";
import { one } from "@/server/db";
import { activeThemes, defaultThemeSlug, resolveTheme } from "@/server/themes";
import { PageTitle } from "@/components/ui";
import { LookPicker } from "./LookPicker";

export const metadata = { title: "My PING VIBE Look" };

export default async function LookPage() {
  const child = await requireChild();
  const p = await one<{ color_theme: string | null; motion: "full" | "calm" | "off" }>(`select color_theme, motion from child_profiles where child_id = $1`, [child.id]);
  const themes = (await activeThemes()).map(({ slug, name, emoji, tagline, tokens }) => ({ slug, name, emoji, tagline, swatches: [tokens.primary, tokens.secondary, tokens.pink, tokens.success, tokens.reward, tokens.orange] }));
  return (
    <>
      <PageTitle title="🎨 My PING VIBE Look" subtitle="Choose your favourite colours and give your adventure a new look!" back="/world/me" />
      <LookPicker themes={themes} current={await resolveTheme(p?.color_theme)} chosen={p?.color_theme ?? null} defaultTheme={await defaultThemeSlug()} motion={p?.motion ?? "full"} />
    </>
  );
}
