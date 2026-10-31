import { requireAdmin } from "@/server/session";
import { allThemes } from "@/server/themes";
import { query } from "@/server/db";
import { contrastChecks } from "@/lib/theme/themes";
import { ThemeAdmin } from "@/components/admin/ThemeAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Themes" };

export default async function ThemesAdminPage() {
  await requireAdmin();
  const themes = await allThemes();
  const usage = await query<{ theme: string | null; n: number }>(`select color_theme theme, count(*)::int n from child_profiles group by color_theme`);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="title-lg">🎨 Colour themes</h1>
        <p className="mt-1 text-vibe-lavender">Themes children can choose in “My PING VIBE Look”. Changes go live within a minute, with no redeploy. The official logo is never themed.</p>
      </div>
      <ThemeAdmin themes={themes.map((t) => ({ ...t, checks: contrastChecks(t.tokens), users: usage.find((u) => u.theme === t.slug)?.n ?? 0 }))} defaultUsers={usage.find((u) => u.theme === null)?.n ?? 0} />
    </div>
  );
}
