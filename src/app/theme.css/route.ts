import { activeThemes, defaultThemeSlug } from "@/server/themes";
import { themeStylesheet } from "@/lib/theme/themes";

export const dynamic = "force-dynamic";

/** Theme variables from the admin-managed registry (overrides the built-in copy inlined in the page). */
export async function GET() {
  const css = themeStylesheet(await activeThemes(), await defaultThemeSlug());
  return new Response(css, { headers: { "Content-Type": "text/css; charset=utf-8", "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}
